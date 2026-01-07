<?php
/**
 * Email Service using PHPMailer with Gmail SMTP
 *
 * Installation:
 * composer require phpmailer/phpmailer
 */

// Load Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $mailer;
    private $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../config/email.php';
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP();
    }

    private function configureSMTP() {
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['smtp_host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['smtp_username'];
            $this->mailer->Password = $this->config['smtp_password'];
            $this->mailer->SMTPSecure = $this->config['smtp_secure'];
            $this->mailer->Port = $this->config['smtp_port'];

            // Encoding
            $this->mailer->CharSet = 'UTF-8';
        } catch (Exception $e) {
            error_log("SMTP Configuration Error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send registration credentials email to parent
     */
    public function sendRegistrationEmail($parentEmail, $studentName, $schoolName, $schoolEmail, $examCode, $password, $loginUrl) {
        try {
            // Use school's email if available, otherwise fall back to config email
            $fromEmail = !empty($schoolEmail) ? $schoolEmail : $this->config['from_email'];

            // Set from address with school name
            $this->mailer->setFrom(
                $fromEmail,
                $schoolName
            );

            // Recipient
            $this->mailer->addAddress($parentEmail);

            // Content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = "Entrance Examination Registration - $schoolName";

            // Load email template
            $htmlBody = $this->getRegistrationEmailTemplate(
                $studentName,
                $schoolName,
                $examCode,
                $password,
                $loginUrl
            );

            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $this->getPlainTextVersion(
                $studentName,
                $schoolName,
                $examCode,
                $password,
                $loginUrl
            );

            // Send email
            $result = $this->mailer->send();

            // Clear addresses for next email
            $this->mailer->clearAddresses();

            return $result;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $this->mailer->ErrorInfo);
            throw new Exception("Failed to send email: " . $e->getMessage());
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
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Registration Successful!</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Welcome to {$schoolName}</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Dear Parent/Guardian,
                            </p>
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Thank you for registering <strong>{$studentName}</strong> for the entrance examination at <strong>{$schoolName}</strong>.
                            </p>
                            <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                Below are the login credentials needed to access the examination portal:
                            </p>

                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 600;">EXAM CODE</p>
                                                    <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">
                                                        {$examCode}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 600;">PASSWORD</p>
                                                    <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">
                                                        {$password}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Login Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{$loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Login to Examination Portal
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Important Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Important:</strong> Please save these credentials in a safe place. You will need them to login and take your entrance examination.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you have any questions or need assistance, please contact the school directly.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                &copy; 2026 SchoolHub. All rights reserved.
                            </p>
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

IMPORTANT: Please save these credentials in a safe place. You will need them to login and take your entrance examination.

If you have any questions or need assistance, please contact the school directly.

---
This is an automated email. Please do not reply to this message.
© 2026 SchoolHub. All rights reserved.
TEXT;
    }
}
