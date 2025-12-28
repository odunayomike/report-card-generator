<?php
/**
 * Contact Form Handler
 * Receives contact form submissions and sends email notifications
 */

header('Content-Type: application/json');

// Include database connection
require_once __DIR__ . '/../config/database.php';

// Get the posted data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit;
}

// Validate required fields
$required = ['name', 'email', 'subject', 'message'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Field '{$field}' is required"]);
        exit;
    }
}

// Sanitize inputs
$name = htmlspecialchars(strip_tags($data['name']));
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$phone = isset($data['phone']) ? htmlspecialchars(strip_tags($data['phone'])) : 'Not provided';
$school = isset($data['school']) ? htmlspecialchars(strip_tags($data['school'])) : 'Not provided';
$subject = htmlspecialchars(strip_tags($data['subject']));
$message = htmlspecialchars(strip_tags($data['message']));

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Map subject codes to readable names
$subjectNames = [
    'sales' => 'Sales Inquiry',
    'support' => 'Technical Support',
    'billing' => 'Billing Question',
    'feature' => 'Feature Request',
    'other' => 'Other'
];
$subjectName = isset($subjectNames[$subject]) ? $subjectNames[$subject] : $subject;

// Email configuration
$to = 'support@schoolhub.tech'; // Your support email
$emailSubject = "SchoolHub Contact Form: {$subjectName}";

// Create email body
$emailBody = "
New Contact Form Submission

Name: {$name}
Email: {$email}
Phone: {$phone}
School: {$school}
Subject: {$subjectName}

Message:
{$message}

---
Submitted from: SchoolHub Contact Form
IP Address: {$_SERVER['REMOTE_ADDR']}
Date: " . date('Y-m-d H:i:s') . "
";

// Create HTML email body
$htmlBody = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1791C8; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-top: 5px; }
        .message-box { background-color: white; padding: 15px; border-left: 4px solid #1791C8; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='field-label'>Name:</div>
                <div class='field-value'>{$name}</div>
            </div>
            <div class='field'>
                <div class='field-label'>Email:</div>
                <div class='field-value'>{$email}</div>
            </div>
            <div class='field'>
                <div class='field-label'>Phone:</div>
                <div class='field-value'>{$phone}</div>
            </div>
            <div class='field'>
                <div class='field-label'>School:</div>
                <div class='field-value'>{$school}</div>
            </div>
            <div class='field'>
                <div class='field-label'>Subject:</div>
                <div class='field-value'>{$subjectName}</div>
            </div>
            <div class='field'>
                <div class='field-label'>Message:</div>
                <div class='message-box'>{$message}</div>
            </div>
        </div>
        <div class='footer'>
            <p>Submitted from SchoolHub Contact Form<br>
            IP: {$_SERVER['REMOTE_ADDR']} | Date: " . date('Y-m-d H:i:s') . "</p>
        </div>
    </div>
</body>
</html>
";

// Configure SMTP settings (for Windows hosting)
ini_set('SMTP', 'localhost'); // Your hosting provider's SMTP server
ini_set('smtp_port', '25');
ini_set('sendmail_from', 'noreply@schoolhub.tech');

// Store message in database first (as backup even if email fails)
try {
    $database = new Database();
    $db = $database->getConnection();

    $insertQuery = "INSERT INTO contact_messages (name, email, phone, school_name, subject, message, ip_address, user_agent, email_sent)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)";
    $stmt = $db->prepare($insertQuery);
    $stmt->execute([
        $name,
        $email,
        $phone,
        $school,
        $subject,
        $message,
        $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ]);
    $messageId = $db->lastInsertId();
} catch (Exception $e) {
    error_log("Failed to store contact message in database: " . $e->getMessage());
    // Continue anyway - we'll try to send email
    $messageId = null;
}

// Email headers
$headers = "From: SchoolHub <noreply@schoolhub.tech>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Send email
$mailSent = @mail($to, $emailSubject, $htmlBody, $headers);

if ($mailSent) {
    // Update database to mark email as sent
    if ($messageId) {
        try {
            $updateQuery = "UPDATE contact_messages SET email_sent = 1 WHERE id = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$messageId]);
        } catch (Exception $e) {
            error_log("Failed to update email_sent status: " . $e->getMessage());
        }
    }

    // Also send confirmation email to user
    $confirmSubject = "Thank you for contacting SchoolHub";
    $confirmBody = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1791C8; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Thank You for Contacting Us!</h2>
            </div>
            <div class='content'>
                <p>Dear {$name},</p>
                <p>Thank you for reaching out to SchoolHub. We have received your message and our team will get back to you within 24 hours.</p>
                <p><strong>Your message:</strong></p>
                <div style='background-color: white; padding: 15px; border-left: 4px solid #1791C8; margin: 15px 0;'>
                    {$message}
                </div>
                <p>If you have any urgent concerns, please don't hesitate to call us at +234 701 012 3061.</p>
                <p>Best regards,<br>
                The SchoolHub Team</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $confirmHeaders = "From: SchoolHub <noreply@schoolhub.tech>\r\n";
    $confirmHeaders .= "MIME-Version: 1.0\r\n";
    $confirmHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

    @mail($email, $confirmSubject, $confirmBody, $confirmHeaders);
}

// Always return success if message was stored in database
if ($messageId) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! We have received your message and will get back to you within 24 hours.'
    ]);
} else {
    // Only fail if we couldn't store in database AND couldn't send email
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send message. Please try again or email us directly at support@schoolhub.tech'
    ]);
}
?>
