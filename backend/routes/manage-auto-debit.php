<?php
/**
 * Manage Auto-Debit Settings
 * GET - Get current auto-debit status
 * POST - Enable/Disable auto-debit
 */

$database = new Database();
$db = $database->getConnection();

$school_id = isset($_SESSION['school_id']) ? $_SESSION['school_id'] : null;

if (!$school_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get current auto-debit status and details
        $query = "
            SELECT
                auto_debit_enabled,
                card_last4,
                card_brand,
                next_billing_date,
                authorization_code IS NOT NULL as has_authorization
            FROM schools
            WHERE id = :school_id
        ";

        $stmt = $db->prepare($query);
        $stmt->execute([':school_id' => $school_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get notification preferences
        $notifQuery = "
            SELECT
                email_before_debit,
                days_before_notification,
                email_after_debit,
                email_on_failure
            FROM notification_preferences
            WHERE school_id = :school_id
        ";
        $notifStmt = $db->prepare($notifQuery);
        $notifStmt->execute([':school_id' => $school_id]);
        $notifications = $notifStmt->fetch(PDO::FETCH_ASSOC);

        // Get recent auto-debit history
        $historyQuery = "
            SELECT
                reference,
                amount,
                status,
                attempt_date,
                error_message
            FROM auto_debit_history
            WHERE school_id = :school_id
            ORDER BY attempt_date DESC
            LIMIT 10
        ";
        $historyStmt = $db->prepare($historyQuery);
        $historyStmt->execute([':school_id' => $school_id]);
        $history = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'auto_debit' => [
                'enabled' => (bool)$result['auto_debit_enabled'],
                'has_authorization' => (bool)$result['has_authorization'],
                'card_last4' => $result['card_last4'],
                'card_brand' => $result['card_brand'],
                'next_billing_date' => $result['next_billing_date']
            ],
            'notifications' => $notifications ?: [
                'email_before_debit' => 1,
                'days_before_notification' => 3,
                'email_after_debit' => 1,
                'email_on_failure' => 1
            ],
            'history' => $history
        ]);

    } elseif ($method === 'POST') {
        // Update auto-debit settings
        $input = json_decode(file_get_contents('php://input'), true);

        $enable = isset($input['enable']) ? $input['enable'] : null;
        $notifications = isset($input['notifications']) ? $input['notifications'] : null;

        if ($enable !== null) {
            // Check if school has authorization code
            $checkQuery = "SELECT authorization_code FROM schools WHERE id = :school_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([':school_id' => $school_id]);
            $school = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($enable && !$school['authorization_code']) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cannot enable auto-debit. Please make a payment first to authorize recurring charges.'
                ]);
                exit();
            }

            // Update auto-debit status
            $updateQuery = "UPDATE schools SET auto_debit_enabled = :enable WHERE id = :school_id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([
                ':enable' => $enable ? 1 : 0,
                ':school_id' => $school_id
            ]);
        }

        if ($notifications) {
            // Update notification preferences
            $notifQuery = "
                INSERT INTO notification_preferences
                (school_id, email_before_debit, days_before_notification, email_after_debit, email_on_failure)
                VALUES (:school_id, :before, :days, :after, :failure)
                ON DUPLICATE KEY UPDATE
                    email_before_debit = :before,
                    days_before_notification = :days,
                    email_after_debit = :after,
                    email_on_failure = :failure
            ";
            $notifStmt = $db->prepare($notifQuery);
            $notifStmt->execute([
                ':school_id' => $school_id,
                ':before' => isset($notifications['email_before_debit']) ? $notifications['email_before_debit'] : 1,
                ':days' => isset($notifications['days_before_notification']) ? $notifications['days_before_notification'] : 3,
                ':after' => isset($notifications['email_after_debit']) ? $notifications['email_after_debit'] : 1,
                ':failure' => isset($notifications['email_on_failure']) ? $notifications['email_on_failure'] : 1
            ]);
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Auto-debit settings updated successfully'
        ]);

    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error managing auto-debit: ' . $e->getMessage()
    ]);
}
