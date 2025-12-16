<?php
/**
 * API Documentation Landing Page
 * Displays all available API endpoints with descriptions
 */

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Card Generator API - Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
            font-size: 18px;
            opacity: 0.9;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .stat-card h3 {
            font-size: 36px;
            color: #667eea;
            margin-bottom: 8px;
        }

        .stat-card p {
            color: #64748b;
            font-size: 14px;
        }

        .section {
            background: white;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
            color: #1e293b;
            font-size: 24px;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e2e8f0;
        }

        .endpoint {
            margin-bottom: 20px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .endpoint:hover {
            background: #f1f5f9;
        }

        .endpoint-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 12px;
        }

        .method {
            padding: 4px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
        }

        .method.get {
            background: #22c55e;
            color: white;
        }

        .method.post {
            background: #3b82f6;
            color: white;
        }

        .method.put {
            background: #f59e0b;
            color: white;
        }

        .method.delete {
            background: #ef4444;
            color: white;
        }

        .endpoint-path {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #475569;
            font-weight: 500;
        }

        .endpoint-desc {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 8px;
        }

        .badge.auth {
            background: #fef3c7;
            color: #92400e;
        }

        .badge.public {
            background: #d1fae5;
            color: #065f46;
        }

        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.9;
        }

        .footer a {
            color: white;
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 32px;
            }

            .section {
                padding: 20px;
            }

            .endpoint-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Report Card Generator API</h1>
            <p>RESTful API for School Management & Report Card Generation</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>35+</h3>
                <p>API Endpoints</p>
            </div>
            <div class="stat-card">
                <h3>9</h3>
                <p>Modules</p>
            </div>
            <div class="stat-card">
                <h3>REST</h3>
                <p>Architecture</p>
            </div>
        </div>

        <!-- Authentication -->
        <div class="section">
            <h2>🔐 Authentication</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/register</span>
                    <span class="badge public">Public</span>
                </div>
                <p class="endpoint-desc">Register a new school account</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/login</span>
                    <span class="badge public">Public</span>
                </div>
                <p class="endpoint-desc">Login to school account</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/logout</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Logout from current session</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/auth/check-session</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Check if school session is valid</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auth/teacher-login</span>
                    <span class="badge public">Public</span>
                </div>
                <p class="endpoint-desc">Login to teacher account</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/auth/teacher-check-session</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Check if teacher session is valid</p>
            </div>
        </div>

        <!-- Students & Reports -->
        <div class="section">
            <h2>👨‍🎓 Students & Reports</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/generate-admission-number</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Generate unique admission number for new student</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/create-student</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Create a new student record</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/save-report</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Save or update student report card</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/get-report</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get student report card by ID</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/get-all-students</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get all students for current school</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/delete-report</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Delete a student report</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/check-student</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Check if student exists by admission number</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/get-student-profile</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get complete student profile with all reports</p>
            </div>
        </div>

        <!-- School Management -->
        <div class="section">
            <h2>🏫 School Management</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/school/get-profile</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get school profile information</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/school/update-profile</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Update school profile details</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/school/update-logo</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Upload/update school logo</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/school/update-settings</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Update school settings and preferences</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/school/change-password</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Change school account password</p>
            </div>
        </div>

        <!-- Teachers -->
        <div class="section">
            <h2>👨‍🏫 Teacher Management</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/teachers/create</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Create a new teacher account</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/teachers/get-all</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get all teachers for current school</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/teachers/assign-class</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Assign a class to a teacher</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/teachers/get-my-classes</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get classes assigned to current teacher</p>
            </div>
        </div>

        <!-- Attendance -->
        <div class="section">
            <h2>📋 Attendance</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance/get-students</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get students for attendance marking</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/attendance/mark-daily</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Mark daily attendance for students</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/attendance/get-daily</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get attendance records for a specific date</p>
            </div>
        </div>

        <!-- Analytics -->
        <div class="section">
            <h2>📊 Analytics</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/get-analytics</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get dashboard analytics (top students, class performance, grade distribution)</p>
            </div>
        </div>

        <!-- Subscription & Payments -->
        <div class="section">
            <h2>💳 Subscription & Payments</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/subscription/get-plans</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get available subscription plans</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/subscription/initialize-payment</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Initialize Paystack payment for subscription</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/subscription/verify-payment</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Verify payment transaction with Paystack</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/subscription/get-status</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get current subscription status</p>
            </div>
        </div>

        <!-- Auto-Debit -->
        <div class="section">
            <h2>🔄 Auto-Debit & Recurring Payments</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auto-debit/enable</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Enable auto-debit after successful payment</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/auto-debit/manage</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Get auto-debit status and history</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/auto-debit/manage</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Update auto-debit settings</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/process-auto-debit</span>
                    <span class="badge public">Cron Job</span>
                </div>
                <p class="endpoint-desc">Process auto-debits (scheduled daily via cron)</p>
            </div>
        </div>

        <!-- PDF Generation -->
        <div class="section">
            <h2>📄 PDF Generation</h2>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/api/generate-pdf</span>
                    <span class="badge auth">Auth Required</span>
                </div>
                <p class="endpoint-desc">Generate PDF report card</p>
            </div>
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/api/pdf-view</span>
                    <span class="badge public">Public</span>
                </div>
                <p class="endpoint-desc">HTML view for PDF generation (used by Puppeteer)</p>
            </div>
        </div>

        <div class="footer">
            <p>&copy; <?php echo date('Y'); ?> Report Card Generator API | Built with ❤️ for Schools</p>
            <p style="margin-top: 8px;">Base URL: <code style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;"><?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://{$_SERVER['HTTP_HOST']}"; ?></code></p>
        </div>
    </div>
</body>
</html>
