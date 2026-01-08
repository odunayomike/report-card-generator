<?php
/**
 * Simple Email Service using PHPMailer with Gmail SMTP
 * Uses PHPMailer for reliable email delivery
 */

// Load Composer autoloader if not already loaded
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    $autoloadPaths = [
        __DIR__ . '/../vendor/autoload.php',
        __DIR__ . '/../../vendor/autoload.php',
        dirname(__DIR__) . '/vendor/autoload.php',
    ];

    foreach ($autoloadPaths as $autoloadPath) {
        if (file_exists($autoloadPath)) {
            require_once $autoloadPath;
            break;
        }
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

            // Check if PHPMailer is available
            if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                throw new Exception('PHPMailer not found. Please install it using: composer require phpmailer/phpmailer');
            }

            // Validate credentials
            $username = $this->config['smtp_username'];
            $password_smtp = $this->config['smtp_password'];

            if (empty($username) || empty($password_smtp) ||
                $username === 'your-email@gmail.com' ||
                $password_smtp === 'your-app-password') {
                throw new Exception("SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.");
            }

            // Create PHPMailer instance
            $mail = new PHPMailer(true);

            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password_smtp;
            $mail->SMTPSecure = $this->config['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->config['smtp_port'];

            // Set timeouts to prevent hanging
            $mail->Timeout = 10;
            $mail->SMTPKeepAlive = false;

            // Encoding
            $mail->CharSet = 'UTF-8';

            // Use school's email if available, otherwise fall back to config email
            $fromEmail = !empty($schoolEmail) ? $schoolEmail : $this->config['from_email'];
            $fromName = $schoolName;

            // Recipients
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($parentEmail);
            $mail->addReplyTo($fromEmail, $fromName);

            // Prepare email content
            $subject = "Entrance Examination Registration - $schoolName";
            $htmlBody = $this->getRegistrationEmailTemplate($studentName, $schoolName, $examCode, $password, $loginUrl);
            $textBody = $this->getPlainTextVersion($studentName, $schoolName, $examCode, $password, $loginUrl);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $textBody;

            // Send the email
            $result = $mail->send();

            // Log success
            error_log("Email sent successfully to: $parentEmail, Subject: $subject");

            return $result;

        } catch (Exception $e) {
            // Log the error with more details
            error_log("Email sending failed to: $parentEmail");
            error_log("Error: " . $e->getMessage());
            if (isset($mail)) {
                error_log("PHPMailer Error: " . $mail->ErrorInfo);
            }
            throw $e;
        }
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
