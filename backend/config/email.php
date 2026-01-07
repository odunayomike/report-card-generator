<?php
/**
 * Email Configuration for Gmail SMTP
 *
 * IMPORTANT: The system will use each school's email address as the sender.
 * This configuration is only used as a fallback if a school doesn't have an email address.
 *
 * Environment Variables Required:
 * Add these to your .env file or server environment:
 *
 * SMTP_USERNAME=your-email@gmail.com
 * SMTP_PASSWORD=your-16-character-app-password
 * SMTP_FROM_EMAIL=your-email@gmail.com (optional, defaults to SMTP_USERNAME)
 *
 * Instructions for Gmail App Password:
 * 1. Go to your Google Account settings
 * 2. Enable 2-Step Verification if not already enabled
 * 3. Generate an App Password:
 *    - Go to Security > 2-Step Verification > App passwords
 *    - Select "Mail" and "Other (Custom name)"
 *    - Copy the 16-character password and add to SMTP_PASSWORD
 *
 * Note: When emails are sent, they will show:
 * From: "School Name" <school-email@example.com>
 *
 * If using Gmail SMTP with different school email addresses:
 * - You may need to add school emails as "Send mail as" aliases in Gmail settings
 * - Or use a transactional email service like SendGrid, Mailgun, or AWS SES
 */

return [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_secure' => 'tls', // or 'ssl' for port 465
    'smtp_username' => getenv('SMTP_USERNAME') ?: 'your-email@gmail.com', // Your Gmail address for authentication
    'smtp_password' => getenv('SMTP_PASSWORD') ?: 'your-app-password', // Gmail App Password (16 characters)
    'from_email' => getenv('SMTP_FROM_EMAIL') ?: getenv('SMTP_USERNAME') ?: 'your-email@gmail.com', // Fallback sender email
];
