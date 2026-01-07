<?php
/**
 * Rate Limiter Utility
 * Prevents brute force attacks by limiting login attempts
 */

class RateLimiter {
    private $db;
    private $maxAttempts;
    private $lockoutDuration; // in minutes
    private $timeWindow; // in minutes

    /**
     * @param PDO $db Database connection
     * @param int $maxAttempts Maximum allowed attempts (default: 5)
     * @param int $timeWindow Time window for counting attempts in minutes (default: 15)
     * @param int $lockoutDuration Duration of lockout in minutes (default: 30)
     */
    public function __construct($db, $maxAttempts = 5, $timeWindow = 15, $lockoutDuration = 30) {
        $this->db = $db;
        $this->maxAttempts = $maxAttempts;
        $this->timeWindow = $timeWindow;
        $this->lockoutDuration = $lockoutDuration;
    }

    /**
     * Check if an identifier (email or IP) is currently locked out
     * @param string $identifier Email or IP address
     * @param string $identifierType 'email' or 'ip'
     * @param string $userType User type (e.g., 'super_admin', 'school_admin')
     * @return array ['locked' => bool, 'locked_until' => string|null, 'attempts_remaining' => int]
     */
    public function checkLimit($identifier, $identifierType, $userType) {
        // Check for active lockout
        $lockout = $this->getActiveLockout($identifier, $identifierType, $userType);
        if ($lockout) {
            return [
                'locked' => true,
                'locked_until' => $lockout['locked_until'],
                'attempts_remaining' => 0,
                'reason' => $lockout['reason']
            ];
        }

        // Count recent attempts
        $attempts = $this->countRecentAttempts($identifier, $identifierType, $userType);
        $remaining = max(0, $this->maxAttempts - $attempts);

        return [
            'locked' => false,
            'locked_until' => null,
            'attempts_remaining' => $remaining,
            'current_attempts' => $attempts
        ];
    }

    /**
     * Record a failed login attempt
     * @param string $identifier Email or IP address
     * @param string $identifierType 'email' or 'ip'
     * @param string $userType User type
     * @return array Status after recording attempt
     */
    public function recordFailedAttempt($identifier, $identifierType, $userType) {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        // Record the attempt
        $stmt = $this->db->prepare("
            INSERT INTO login_attempts
            (identifier, identifier_type, user_type, ip_address, user_agent)
            VALUES (:identifier, :identifier_type, :user_type, :ip_address, :user_agent)
        ");
        $stmt->execute([
            ':identifier' => $identifier,
            ':identifier_type' => $identifierType,
            ':user_type' => $userType,
            ':ip_address' => $ipAddress,
            ':user_agent' => $userAgent
        ]);

        // Check if we need to lock the account
        $attempts = $this->countRecentAttempts($identifier, $identifierType, $userType);

        if ($attempts >= $this->maxAttempts) {
            $this->createLockout($identifier, $identifierType, $userType);
            return [
                'locked' => true,
                'attempts' => $attempts,
                'locked_until' => date('Y-m-d H:i:s', strtotime("+{$this->lockoutDuration} minutes"))
            ];
        }

        return [
            'locked' => false,
            'attempts' => $attempts,
            'attempts_remaining' => $this->maxAttempts - $attempts
        ];
    }

    /**
     * Clear failed attempts after successful login
     * @param string $identifier Email or IP address
     * @param string $identifierType 'email' or 'ip'
     * @param string $userType User type
     */
    public function clearAttempts($identifier, $identifierType, $userType) {
        // Remove failed attempts
        $stmt = $this->db->prepare("
            DELETE FROM login_attempts
            WHERE identifier = :identifier
            AND identifier_type = :identifier_type
            AND user_type = :user_type
        ");
        $stmt->execute([
            ':identifier' => $identifier,
            ':identifier_type' => $identifierType,
            ':user_type' => $userType
        ]);

        // Remove any lockouts
        $stmt = $this->db->prepare("
            DELETE FROM account_lockouts
            WHERE identifier = :identifier
            AND identifier_type = :identifier_type
            AND user_type = :user_type
        ");
        $stmt->execute([
            ':identifier' => $identifier,
            ':identifier_type' => $identifierType,
            ':user_type' => $userType
        ]);
    }

    /**
     * Get active lockout if exists
     */
    private function getActiveLockout($identifier, $identifierType, $userType) {
        $stmt = $this->db->prepare("
            SELECT * FROM account_lockouts
            WHERE identifier = :identifier
            AND identifier_type = :identifier_type
            AND user_type = :user_type
            AND locked_until > NOW()
            LIMIT 1
        ");
        $stmt->execute([
            ':identifier' => $identifier,
            ':identifier_type' => $identifierType,
            ':user_type' => $userType
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Count recent failed attempts within time window
     */
    private function countRecentAttempts($identifier, $identifierType, $userType) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count
            FROM login_attempts
            WHERE identifier = :identifier
            AND identifier_type = :identifier_type
            AND user_type = :user_type
            AND attempt_time > DATE_SUB(NOW(), INTERVAL :time_window MINUTE)
        ");
        $stmt->execute([
            ':identifier' => $identifier,
            ':identifier_type' => $identifierType,
            ':user_type' => $userType,
            ':time_window' => $this->timeWindow
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }

    /**
     * Create a lockout for the identifier
     */
    private function createLockout($identifier, $identifierType, $userType) {
        $lockedUntil = date('Y-m-d H:i:s', strtotime("+{$this->lockoutDuration} minutes"));
        $reason = "Too many failed login attempts";

        $stmt = $this->db->prepare("
            INSERT INTO account_lockouts
            (identifier, identifier_type, user_type, locked_until, reason)
            VALUES (:identifier, :identifier_type, :user_type, :locked_until, :reason)
            ON DUPLICATE KEY UPDATE
                locked_until = :locked_until,
                reason = :reason,
                created_at = NOW()
        ");
        $stmt->execute([
            ':identifier' => $identifier,
            ':identifier_type' => $identifierType,
            ':user_type' => $userType,
            ':locked_until' => $lockedUntil,
            ':reason' => $reason
        ]);
    }

    /**
     * Clean up old records (call this periodically)
     * Removes attempts older than 24 hours and expired lockouts
     */
    public function cleanup() {
        // Remove old attempts
        $stmt = $this->db->prepare("
            DELETE FROM login_attempts
            WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        $stmt->execute();

        // Remove expired lockouts
        $stmt = $this->db->prepare("
            DELETE FROM account_lockouts
            WHERE locked_until < NOW()
        ");
        $stmt->execute();
    }
}
