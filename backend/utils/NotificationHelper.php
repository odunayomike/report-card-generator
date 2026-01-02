<?php
/**
 * Notification Helper
 * Helper functions for creating and sending notifications to parents
 */

require_once __DIR__ . '/PushNotificationService.php';

class NotificationHelper {
    private $db;
    private $pushService;

    public function __construct($db) {
        $this->db = $db;
        $this->pushService = new PushNotificationService();
    }

    /**
     * Create and send a notification to a parent
     *
     * @param int $parentId Parent ID
     * @param int $schoolId School ID
     * @param int|null $studentId Student ID (optional)
     * @param string $type Notification type (report_card, fee_payment, attendance, announcement)
     * @param string $title Notification title
     * @param string $message Notification message
     * @param array|null $data Additional data (will be JSON encoded)
     * @param bool $sendPush Whether to send push notification
     * @return array Result
     */
    public function createNotification($parentId, $schoolId, $studentId, $type, $title, $message, $data = null, $sendPush = true) {
        try {
            // Insert notification into database
            $query = "INSERT INTO notifications
                      (parent_id, school_id, student_id, type, title, message, data)
                      VALUES (?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $parentId,
                $schoolId,
                $studentId,
                $type,
                $title,
                $message,
                $data ? json_encode($data) : null
            ]);

            $notificationId = $this->db->lastInsertId();

            // Send push notification if enabled
            $pushResult = null;
            if ($sendPush) {
                // Check parent's notification settings
                $settingsQuery = "SELECT push_enabled, {$type}_enabled
                                  FROM notification_settings
                                  WHERE parent_id = ?";
                $settingsStmt = $this->db->prepare($settingsQuery);
                $settingsStmt->execute([$parentId]);
                $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);

                // If no settings exist, create default settings (all enabled)
                if (!$settings) {
                    $insertSettings = "INSERT INTO notification_settings (parent_id) VALUES (?)";
                    $insertStmt = $this->db->prepare($insertSettings);
                    $insertStmt->execute([$parentId]);
                    $settings = ['push_enabled' => true, $type . '_enabled' => true];
                }

                // Send push if both master switch and type-specific switch are enabled
                if ($settings['push_enabled'] && $settings[$type . '_enabled']) {
                    $pushData = $data ?? [];
                    $pushData['notification_id'] = $notificationId;
                    $pushData['type'] = $type;

                    $pushResult = $this->pushService->sendToParent(
                        $parentId,
                        $title,
                        $message,
                        $pushData,
                        $this->db
                    );
                }
            }

            return [
                'success' => true,
                'notification_id' => $notificationId,
                'push_sent' => $pushResult !== null,
                'push_result' => $pushResult
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to create notification: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Notify parent about new report card
     */
    public function notifyReportCardPublished($parentId, $schoolId, $studentId, $studentName, $reportId, $term, $session) {
        return $this->createNotification(
            $parentId,
            $schoolId,
            $studentId,
            'report_card',
            'New Report Card Published',
            "A new report card for {$studentName} ({$term}, {$session}) is now available.",
            [
                'report_id' => $reportId,
                'student_id' => $studentId,
                'student_name' => $studentName,
                'term' => $term,
                'session' => $session
            ]
        );
    }

    /**
     * Notify parent about fee payment reminder
     */
    public function notifyFeePaymentReminder($parentId, $schoolId, $studentId, $studentName, $feeAmount, $feeName, $dueDate) {
        return $this->createNotification(
            $parentId,
            $schoolId,
            $studentId,
            'fee_payment',
            'Fee Payment Reminder',
            "{$feeName} of {$feeAmount} for {$studentName} is due on {$dueDate}.",
            [
                'student_id' => $studentId,
                'student_name' => $studentName,
                'fee_amount' => $feeAmount,
                'fee_name' => $feeName,
                'due_date' => $dueDate
            ]
        );
    }

    /**
     * Notify parent about student absence
     */
    public function notifyStudentAbsent($parentId, $schoolId, $studentId, $studentName, $date) {
        return $this->createNotification(
            $parentId,
            $schoolId,
            $studentId,
            'attendance',
            'Attendance Alert',
            "{$studentName} was marked absent on {$date}.",
            [
                'student_id' => $studentId,
                'student_name' => $studentName,
                'date' => $date,
                'status' => 'absent'
            ]
        );
    }

    /**
     * Send announcement to all parents in a school
     */
    public function sendSchoolAnnouncement($schoolId, $title, $message, $data = null) {
        // Get all parents in this school
        $query = "SELECT DISTINCT p.id
                  FROM parents p
                  INNER JOIN parent_students ps ON p.id = ps.parent_id
                  INNER JOIN students s ON ps.student_id = s.id
                  WHERE s.school_id = ?";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$schoolId]);
        $parentIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $results = [
            'success' => true,
            'sent_count' => 0,
            'failed_count' => 0
        ];

        foreach ($parentIds as $parentId) {
            $result = $this->createNotification(
                $parentId,
                $schoolId,
                null, // No specific student for announcements
                'announcement',
                $title,
                $message,
                $data
            );

            if ($result['success']) {
                $results['sent_count']++;
            } else {
                $results['failed_count']++;
            }
        }

        return $results;
    }
}
