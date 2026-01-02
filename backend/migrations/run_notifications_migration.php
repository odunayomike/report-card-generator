<?php
/**
 * Run Notifications System Migration
 */

require_once __DIR__ . '/../config/database.php';

echo "===========================================\n";
echo "Notifications System Migration\n";
echo "===========================================\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Create notifications table
    echo "1. Creating 'notifications' table...\n";
    $sql1 = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        school_id INT NOT NULL,
        student_id INT NULL,
        type ENUM('report_card', 'fee_payment', 'attendance', 'announcement') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON NULL COMMENT 'Additional data like report_id, fee_id, etc.',
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_parent_read (parent_id, is_read),
        INDEX idx_parent_created (parent_id, created_at DESC),
        INDEX idx_school_created (school_id, created_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $db->exec($sql1);
    echo "   ✓ Success\n\n";

    // Create parent_device_tokens table
    echo "2. Creating 'parent_device_tokens' table...\n";
    $sql2 = "CREATE TABLE IF NOT EXISTS parent_device_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        device_token VARCHAR(255) NOT NULL COMMENT 'FCM device token',
        device_type ENUM('android', 'ios') NOT NULL,
        device_name VARCHAR(255) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        UNIQUE KEY unique_parent_token (parent_id, device_token),
        INDEX idx_parent_active (parent_id, is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $db->exec($sql2);
    echo "   ✓ Success\n\n";

    // Create notification_settings table
    echo "3. Creating 'notification_settings' table...\n";
    $sql3 = "CREATE TABLE IF NOT EXISTS notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        report_card_enabled BOOLEAN DEFAULT TRUE,
        fee_payment_enabled BOOLEAN DEFAULT TRUE,
        attendance_enabled BOOLEAN DEFAULT TRUE,
        announcement_enabled BOOLEAN DEFAULT TRUE,
        push_enabled BOOLEAN DEFAULT TRUE COMMENT 'Master switch for push notifications',
        email_enabled BOOLEAN DEFAULT FALSE COMMENT 'Future: email notifications',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
        UNIQUE KEY unique_parent_settings (parent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $db->exec($sql3);
    echo "   ✓ Success\n\n";

    // Verify tables
    echo "Verifying tables...\n";
    $result1 = $db->query("SHOW TABLES LIKE 'notifications'");
    $result2 = $db->query("SHOW TABLES LIKE 'parent_device_tokens'");
    $result3 = $db->query("SHOW TABLES LIKE 'notification_settings'");

    $count1 = $result1->rowCount();
    $count2 = $result2->rowCount();
    $count3 = $result3->rowCount();

    echo "   " . ($count1 > 0 ? "✓" : "✗") . " notifications\n";
    echo "   " . ($count2 > 0 ? "✓" : "✗") . " parent_device_tokens\n";
    echo "   " . ($count3 > 0 ? "✓" : "✗") . " notification_settings\n\n";

    if ($count1 > 0 && $count2 > 0 && $count3 > 0) {
        echo "===========================================\n";
        echo "✓ Migration completed successfully!\n";
        echo "===========================================\n\n";
        echo "Notification system is ready:\n";
        echo "  • In-app notifications\n";
        echo "  • Push notifications (FCM)\n";
        echo "  • Parent notification preferences\n\n";
        echo "Next: Configure FCM_SERVER_KEY in environment\n\n";
    } else {
        echo "⚠ Some tables were not created\n\n";
    }

} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'already exists') !== false) {
        echo "   ⚠ Table already exists\n\n";
        echo "===========================================\n";
        echo "Migration already applied\n";
        echo "===========================================\n\n";
    } else {
        echo "\n===========================================\n";
        echo "✗ Error: " . $e->getMessage() . "\n";
        echo "===========================================\n\n";
        exit(1);
    }
}
?>
