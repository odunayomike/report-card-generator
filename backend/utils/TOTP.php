<?php
/**
 * TOTP (Time-based One-Time Password) Utility
 * Compatible with Google Authenticator, Authy, etc.
 * Based on RFC 6238
 */

class TOTP {
    private $codeLength = 6;
    private $timeStep = 30; // seconds
    private $discrepancy = 1; // Allow 1 time step before/after for clock skew

    /**
     * Generate a random secret key for TOTP
     * @return string Base32 encoded secret
     */
    public function generateSecret() {
        $secret = '';
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 alphabet

        for ($i = 0; $i < 16; $i++) {
            $secret .= $chars[random_int(0, 31)];
        }

        return $secret;
    }

    /**
     * Generate a TOTP code for the current time
     * @param string $secret Base32 encoded secret
     * @param int|null $timestamp Unix timestamp (null for current time)
     * @return string 6-digit code
     */
    public function generateCode($secret, $timestamp = null) {
        if ($timestamp === null) {
            $timestamp = time();
        }

        $timeSlice = floor($timestamp / $this->timeStep);
        $secretKey = $this->base32Decode($secret);

        // Pack time into binary string
        $time = pack('N*', 0) . pack('N*', $timeSlice);

        // Hash it with HMAC-SHA1
        $hash = hash_hmac('sha1', $time, $secretKey, true);

        // Extract dynamic binary code
        $offset = ord($hash[19]) & 0x0f;
        $code = (
            ((ord($hash[$offset + 0]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        );

        // Generate 6-digit code
        $code = $code % pow(10, $this->codeLength);

        return str_pad($code, $this->codeLength, '0', STR_PAD_LEFT);
    }

    /**
     * Verify a TOTP code
     * @param string $secret Base32 encoded secret
     * @param string $code The code to verify
     * @param int|null $timestamp Unix timestamp (null for current time)
     * @return bool True if code is valid
     */
    public function verifyCode($secret, $code, $timestamp = null) {
        if ($timestamp === null) {
            $timestamp = time();
        }

        // Check current time and allow for clock discrepancy
        for ($i = -$this->discrepancy; $i <= $this->discrepancy; $i++) {
            $testTime = $timestamp + ($i * $this->timeStep);
            $testCode = $this->generateCode($secret, $testTime);

            if ($this->timingSafeEquals($testCode, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate backup codes for account recovery
     * @param int $count Number of backup codes to generate
     * @return array Array of backup codes
     */
    public function generateBackupCodes($count = 10) {
        $codes = [];

        for ($i = 0; $i < $count; $i++) {
            $code = '';
            for ($j = 0; $j < 8; $j++) {
                $code .= random_int(0, 9);
            }
            // Format as XXXX-XXXX for readability
            $codes[] = substr($code, 0, 4) . '-' . substr($code, 4, 4);
        }

        return $codes;
    }

    /**
     * Hash backup codes for storage
     * @param array $codes Plain text backup codes
     * @return array Hashed backup codes
     */
    public function hashBackupCodes($codes) {
        return array_map(function($code) {
            return password_hash($code, PASSWORD_DEFAULT);
        }, $codes);
    }

    /**
     * Verify a backup code
     * @param string $code Plain text backup code
     * @param array $hashedCodes Array of hashed backup codes
     * @return int|false Index of matched code, or false if no match
     */
    public function verifyBackupCode($code, $hashedCodes) {
        foreach ($hashedCodes as $index => $hashedCode) {
            if (password_verify($code, $hashedCode)) {
                return $index;
            }
        }
        return false;
    }

    /**
     * Generate QR code URL for Google Authenticator
     * @param string $secret Base32 encoded secret
     * @param string $issuer Application name (e.g., "SchoolHub")
     * @param string $accountName User's email or identifier
     * @return string otpauth:// URL for QR code generation
     */
    public function getQRCodeUrl($secret, $issuer, $accountName) {
        $issuer = rawurlencode($issuer);
        $accountName = rawurlencode($accountName);

        return "otpauth://totp/{$issuer}:{$accountName}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits={$this->codeLength}&period={$this->timeStep}";
    }

    /**
     * Decode base32 string
     * @param string $input Base32 encoded string
     * @return string Decoded binary string
     */
    private function base32Decode($input) {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $output = '';
        $v = 0;
        $vbits = 0;

        for ($i = 0, $j = strlen($input); $i < $j; $i++) {
            $v <<= 5;
            $v += stripos($alphabet, $input[$i]);
            $vbits += 5;

            while ($vbits >= 8) {
                $vbits -= 8;
                $output .= chr($v >> $vbits);
                $v &= ((1 << $vbits) - 1);
            }
        }

        return $output;
    }

    /**
     * Timing-safe string comparison
     * @param string $a First string
     * @param string $b Second string
     * @return bool True if strings are equal
     */
    private function timingSafeEquals($a, $b) {
        if (function_exists('hash_equals')) {
            return hash_equals($a, $b);
        }

        // Fallback for older PHP versions
        if (strlen($a) !== strlen($b)) {
            return false;
        }

        $result = 0;
        for ($i = 0; $i < strlen($a); $i++) {
            $result |= ord($a[$i]) ^ ord($b[$i]);
        }

        return $result === 0;
    }
}
