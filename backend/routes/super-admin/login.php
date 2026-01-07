<?php
/**
 * Super Admin Login Route
 * Session is already started in index.php
 */

// Get posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data provided']);
    exit();
}

// Validate required fields
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit();
}

$email = trim($data['email']);
$password = $data['password'];

$database = new Database();
$db = $database->getConnection();

// Initialize rate limiter
require_once __DIR__ . '/../../utils/RateLimiter.php';
$rateLimiter = new RateLimiter($db, 5, 15, 30); // 5 attempts, 15 min window, 30 min lockout

try {
    // Check rate limit for email
    $emailLimit = $rateLimiter->checkLimit($email, 'email', 'super_admin');
    if ($emailLimit['locked']) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Too many failed login attempts. Please try again later.',
            'locked_until' => $emailLimit['locked_until']
        ]);
        exit();
    }

    // Check rate limit for IP address
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ipLimit = $rateLimiter->checkLimit($ipAddress, 'ip', 'super_admin');
    if ($ipLimit['locked']) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Too many failed login attempts from this IP address. Please try again later.',
            'locked_until' => $ipLimit['locked_until']
        ]);
        exit();
    }

    // Fetch super admin by email
    $stmt = $db->prepare("
        SELECT id, name, email, password, phone, is_active, mfa_enabled
        FROM super_admins
        WHERE email = :email
    ");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $superAdmin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$superAdmin) {
        // Record failed attempt
        $result = $rateLimiter->recordFailedAttempt($email, 'email', 'super_admin');
        $rateLimiter->recordFailedAttempt($ipAddress, 'ip', 'super_admin');

        http_response_code(401);
        $response = ['error' => 'Invalid credentials'];

        // Include attempts remaining if not yet locked
        if (!$result['locked'] && $result['attempts_remaining'] <= 2) {
            $response['attempts_remaining'] = $result['attempts_remaining'];
        }

        echo json_encode($response);
        exit;
    }

    // Verify password
    if (!password_verify($password, $superAdmin['password'])) {
        // Record failed attempt
        $result = $rateLimiter->recordFailedAttempt($email, 'email', 'super_admin');
        $rateLimiter->recordFailedAttempt($ipAddress, 'ip', 'super_admin');

        http_response_code(401);
        $response = ['error' => 'Invalid credentials'];

        // Include attempts remaining if not yet locked
        if (!$result['locked'] && $result['attempts_remaining'] <= 2) {
            $response['attempts_remaining'] = $result['attempts_remaining'];
        }

        echo json_encode($response);
        exit;
    }

    // Check if super admin is active
    if (!$superAdmin['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Your account has been deactivated. Please contact system support.']);
        exit;
    }

    // Check if MFA is enabled
    if ($superAdmin['mfa_enabled']) {
        // Check for trusted device token
        $deviceToken = $data['device_token'] ?? null;
        $trustedDevice = false;

        if ($deviceToken) {
            $stmt = $db->prepare("
                SELECT id FROM trusted_devices
                WHERE super_admin_id = :admin_id
                AND device_token = :token
                AND trusted_until > NOW()
                LIMIT 1
            ");
            $stmt->execute([
                ':admin_id' => $superAdmin['id'],
                ':token' => $deviceToken
            ]);
            $trustedDevice = $stmt->fetch(PDO::FETCH_ASSOC) !== false;

            // Update last used time
            if ($trustedDevice) {
                $stmt = $db->prepare("
                    UPDATE trusted_devices
                    SET last_used_at = NOW()
                    WHERE device_token = :token
                ");
                $stmt->execute([':token' => $deviceToken]);
            }
        }

        // If not a trusted device, require MFA verification
        if (!$trustedDevice) {
            // Don't clear rate limits yet - wait for MFA verification
            http_response_code(200);
            echo json_encode([
                'message' => 'Password verified. MFA required.',
                'mfa_required' => true,
                'email' => $superAdmin['email']
            ]);
            exit;
        }
    }

    // Clear failed login attempts on successful login
    $rateLimiter->clearAttempts($email, 'email', 'super_admin');
    $rateLimiter->clearAttempts($ipAddress, 'ip', 'super_admin');

    // Regenerate session ID to prevent session fixation attacks
    session_regenerate_id(true);

    // Set session variables
    $_SESSION['user_type'] = 'super_admin';
    $_SESSION['super_admin_id'] = $superAdmin['id'];
    $_SESSION['super_admin_name'] = $superAdmin['name'];
    $_SESSION['super_admin_email'] = $superAdmin['email'];
    $_SESSION['mfa_verified'] = !$superAdmin['mfa_enabled'] || true; // true if trusted device

    // Log the login activity
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $logStmt = $db->prepare("
        INSERT INTO super_admin_activity_log
        (super_admin_id, action_type, target_type, description, ip_address, user_agent)
        VALUES (:super_admin_id, 'login', 'system', 'Super admin logged in', :ip_address, :user_agent)
    ");
    $logStmt->bindParam(':super_admin_id', $superAdmin['id']);
    $logStmt->bindParam(':ip_address', $ip_address);
    $logStmt->bindParam(':user_agent', $user_agent);
    $logStmt->execute();

    // Return success
    http_response_code(200);
    echo json_encode([
        'message' => 'Login successful',
        'mfa_required' => false,
        'user' => [
            'id' => $superAdmin['id'],
            'name' => $superAdmin['name'],
            'email' => $superAdmin['email'],
            'phone' => $superAdmin['phone'],
            'user_type' => 'super_admin',
            'mfa_enabled' => (bool)$superAdmin['mfa_enabled']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
