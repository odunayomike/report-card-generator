<?php
/**
 * Push Notification Service
 * Handles sending push notifications via Firebase Cloud Messaging (FCM)
 */

class PushNotificationService {
    private $fcmServerKey;
    private $fcmUrl = 'https://fcm.googleapis.com/fcm/send';

    public function __construct() {
        // FCM Server Key should be stored in environment or config
        // For now, it should be set in env.php
        $this->fcmServerKey = defined('FCM_SERVER_KEY') ? FCM_SERVER_KEY : null;
    }

    /**
     * Send push notification to multiple device tokens
     *
     * @param array $deviceTokens Array of FCM device tokens
     * @param string $title Notification title
     * @param string $body Notification message body
     * @param array $data Additional data payload
     * @return array Result with success count and failures
     */
    public function sendToMultiple($deviceTokens, $title, $body, $data = []) {
        if (empty($this->fcmServerKey)) {
            return [
                'success' => false,
                'message' => 'FCM Server Key not configured'
            ];
        }

        if (empty($deviceTokens)) {
            return [
                'success' => true,
                'sent_count' => 0,
                'message' => 'No device tokens provided'
            ];
        }

        $results = [
            'success' => true,
            'sent_count' => 0,
            'failed_count' => 0,
            'failed_tokens' => []
        ];

        // FCM allows batching up to 1000 tokens per request
        // For simplicity, we'll send individually for better error handling
        foreach ($deviceTokens as $token) {
            $result = $this->sendToSingle($token, $title, $body, $data);
            if ($result['success']) {
                $results['sent_count']++;
            } else {
                $results['failed_count']++;
                $results['failed_tokens'][] = [
                    'token' => $token,
                    'error' => $result['message']
                ];
            }
        }

        return $results;
    }

    /**
     * Send push notification to a single device token
     *
     * @param string $deviceToken FCM device token
     * @param string $title Notification title
     * @param string $body Notification message body
     * @param array $data Additional data payload
     * @return array Result
     */
    public function sendToSingle($deviceToken, $title, $body, $data = []) {
        if (empty($this->fcmServerKey)) {
            return [
                'success' => false,
                'message' => 'FCM Server Key not configured'
            ];
        }

        $notification = [
            'title' => $title,
            'body' => $body,
            'sound' => 'default',
            'badge' => '1'
        ];

        $fcmPayload = [
            'to' => $deviceToken,
            'notification' => $notification,
            'data' => $data,
            'priority' => 'high'
        ];

        $headers = [
            'Authorization: key=' . $this->fcmServerKey,
            'Content-Type: application/json'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->fcmUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fcmPayload));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $responseData = json_decode($response, true);
            if (isset($responseData['success']) && $responseData['success'] > 0) {
                return [
                    'success' => true,
                    'message' => 'Notification sent successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => $responseData['results'][0]['error'] ?? 'Failed to send notification'
                ];
            }
        } else {
            return [
                'success' => false,
                'message' => 'FCM request failed with HTTP code: ' . $httpCode
            ];
        }
    }

    /**
     * Send notification to a parent (all their active devices)
     *
     * @param int $parentId Parent ID
     * @param string $title Notification title
     * @param string $body Notification message body
     * @param array $data Additional data payload
     * @param PDO $db Database connection
     * @return array Result
     */
    public function sendToParent($parentId, $title, $body, $data = [], $db) {
        // Get all active device tokens for this parent
        $query = "SELECT device_token FROM parent_device_tokens
                  WHERE parent_id = ? AND is_active = TRUE";
        $stmt = $db->prepare($query);
        $stmt->execute([$parentId]);
        $tokens = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($tokens)) {
            return [
                'success' => true,
                'sent_count' => 0,
                'message' => 'No active devices registered for this parent'
            ];
        }

        return $this->sendToMultiple($tokens, $title, $body, $data);
    }
}
