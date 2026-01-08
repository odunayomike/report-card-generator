<?php
/**
 * Simple Email Service using Gmail SMTP with cURL
 * No external dependencies required - uses PHP's built-in functions
 */

class SimpleEmailService {
    private $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../config/email.php';
    }

    /**
     * Send registration credentials email to parent
     */
    public function sendRegistrationEmail($parentEmail, $studentName, $schoolName, $schoolEmail, $examCode, $password, $loginUrl) {
        try {
            // Validate email
            if (!filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email address: $parentEmail");
            }

            // Prepare email content
            $subject = "Entrance Examination Registration - $schoolName";
            $htmlBody = $this->getRegistrationEmailTemplate($studentName, $schoolName, $examCode, $password, $loginUrl);
            $textBody = $this->getPlainTextVersion($studentName, $schoolName, $examCode, $password, $loginUrl);

            // Use school's email if available, otherwise fall back to config email
            $fromEmail = !empty($schoolEmail) ? $schoolEmail : $this->config['from_email'];
            $fromName = $schoolName;

            // Send email using Gmail API or fallback to PHP mail()
            $result = $this->sendViaGmailSMTP($parentEmail, $fromEmail, $fromName, $subject, $htmlBody, $textBody);

            return $result;

        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send email via Gmail SMTP using fsockopen
     */
    private function sendViaGmailSMTP($to, $from, $fromName, $subject, $htmlBody, $textBody) {
        $username = $this->config['smtp_username'];
        $password = $this->config['smtp_password'];
        $host = $this->config['smtp_host'];
        $port = $this->config['smtp_port'];

        // Validate credentials
        if (empty($username) || empty($password) ||
            $username === 'your-email@gmail.com' ||
            $password === 'your-app-password') {
            throw new Exception("SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.");
        }

        // Create socket connection
        $socket = @fsockopen($host, $port, $errno, $errstr, 10);
        if (!$socket) {
            throw new Exception("Cannot connect to SMTP server: $errstr ($errno)");
        }

        // Set timeout
        stream_set_timeout($socket, 10);

        // Read server greeting
        $this->readResponse($socket, 220);

        // Send EHLO
        $this->sendCommand($socket, "EHLO localhost\r\n", 250);

        // Start TLS
        $this->sendCommand($socket, "STARTTLS\r\n", 220);

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new Exception("Failed to enable TLS encryption");
        }

        // Send EHLO again after TLS
        $this->sendCommand($socket, "EHLO localhost\r\n", 250);

        // Authenticate
        $this->sendCommand($socket, "AUTH LOGIN\r\n", 334);
        $this->sendCommand($socket, base64_encode($username) . "\r\n", 334);
        $this->sendCommand($socket, base64_encode($password) . "\r\n", 235);

        // Send MAIL FROM
        $this->sendCommand($socket, "MAIL FROM: <$from>\r\n", 250);

        // Send RCPT TO
        $this->sendCommand($socket, "RCPT TO: <$to>\r\n", 250);

        // Send DATA
        $this->sendCommand($socket, "DATA\r\n", 354);

        // Build email headers and body
        $boundary = uniqid('boundary_');
        $headers = "From: $fromName <$from>\r\n";
        $headers .= "To: <$to>\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
        $headers .= "\r\n";

        $body = "--$boundary\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $body .= $textBody . "\r\n\r\n";
        $body .= "--$boundary\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $body .= $htmlBody . "\r\n\r\n";
        $body .= "--$boundary--\r\n";

        // Send email content
        fwrite($socket, $headers . $body . "\r\n.\r\n");
        $this->readResponse($socket, 250);

        // Quit
        $this->sendCommand($socket, "QUIT\r\n", 221);

        // Close connection
        fclose($socket);

        return true;
    }

    /**
     * Send SMTP command and check response
     */
    private function sendCommand($socket, $command, $expectedCode) {
        fwrite($socket, $command);
        return $this->readResponse($socket, $expectedCode);
    }

    /**
     * Read and validate SMTP response
     */
    private function readResponse($socket, $expectedCode) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == ' ') {
                break;
            }
        }

        $code = intval(substr($response, 0, 3));
        if ($code !== $expectedCode) {
            throw new Exception("SMTP Error: Expected $expectedCode but got $code - $response");
        }

        return $response;
    }

    /**
     * Get HTML email template for registration
     */
    private function getRegistrationEmailTemplate($studentName, $schoolName, $examCode, $password, $loginUrl) {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Registration Successful!</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Welcome to {$schoolName}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Dear Parent/Guardian,</p>
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Thank you for registering <strong>{$studentName}</strong> for the entrance examination at <strong>{$schoolName}</strong>.</p>
                            <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px;">Below are the login credentials needed to access the examination portal:</p>

                            <table width="100%" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 600;">EXAM CODE</p>
                                        <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">{$examCode}</p>

                                        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 600;">PASSWORD</p>
                                        <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">{$password}</p>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{$loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">Login to Examination Portal</a>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⚠️ Important:</strong> Please save these credentials. You will need them to login and take your entrance examination.</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: #6b7280; font-size: 14px;">If you have any questions, please contact the school directly.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">This is an automated email. Please do not reply.</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; 2026 SchoolHub. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    /**
     * Get plain text version of the email
     */
    private function getPlainTextVersion($studentName, $schoolName, $examCode, $password, $loginUrl) {
        return <<<TEXT
REGISTRATION SUCCESSFUL

Dear Parent/Guardian,

Thank you for registering {$studentName} for the entrance examination at {$schoolName}.

Below are the login credentials needed to access the examination portal:

EXAM CODE: {$examCode}
PASSWORD: {$password}

Login URL: {$loginUrl}

IMPORTANT: Please save these credentials. You will need them to login and take your entrance examination.

If you have any questions, please contact the school directly.

---
This is an automated email. Please do not reply.
© 2026 SchoolHub. All rights reserved.
TEXT;
    }
}
