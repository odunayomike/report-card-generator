<?php
/**
 * Subscription Check Middleware
 * Validates if school has an active subscription
 */

function checkSubscription($schoolId, $db) {
    try {
        // Get school subscription status
        $query = "SELECT subscription_status, subscription_end_date, trial_end_date
                  FROM schools
                  WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$schoolId]);
        $school = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$school) {
            return [
                'has_access' => false,
                'status' => 'not_found',
                'message' => 'School not found'
            ];
        }

        $status = $school['subscription_status'];
        $endDate = $school['subscription_end_date'];
        $trialEndDate = $school['trial_end_date'];

        // Trial access - check if trial has not expired
        if ($status === 'trial') {
            if ($trialEndDate && strtotime($trialEndDate) >= strtotime('today')) {
                // Calculate days remaining
                $daysRemaining = ceil((strtotime($trialEndDate) - strtotime('today')) / 86400);

                return [
                    'has_access' => true,
                    'status' => 'trial',
                    'message' => "Trial access - {$daysRemaining} days remaining",
                    'end_date' => $trialEndDate,
                    'days_remaining' => $daysRemaining
                ];
            } else {
                // Trial expired, update status
                $updateQuery = "UPDATE schools SET subscription_status = 'expired' WHERE id = ?";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([$schoolId]);

                return [
                    'has_access' => false,
                    'status' => 'trial_expired',
                    'message' => 'Free trial has expired. Please subscribe to continue.',
                    'end_date' => $trialEndDate
                ];
            }
        }

        // Active subscription - check if not expired
        if ($status === 'active') {
            if ($endDate && strtotime($endDate) >= strtotime('today')) {
                return [
                    'has_access' => true,
                    'status' => 'active',
                    'message' => 'Active subscription',
                    'end_date' => $endDate
                ];
            } else {
                // Subscription expired, update status
                $updateQuery = "UPDATE schools SET subscription_status = 'expired' WHERE id = ?";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([$schoolId]);

                return [
                    'has_access' => false,
                    'status' => 'expired',
                    'message' => 'Subscription has expired',
                    'end_date' => $endDate
                ];
            }
        }

        // Expired subscription
        return [
            'has_access' => false,
            'status' => 'expired',
            'message' => 'Subscription required',
            'end_date' => $endDate
        ];

    } catch (PDOException $e) {
        error_log("Subscription check error: " . $e->getMessage());
        return [
            'has_access' => false,
            'status' => 'error',
            'message' => 'Error checking subscription status'
        ];
    }
}

/**
 * Require active subscription
 * Call this function at the start of protected routes
 */
function requireActiveSubscription($schoolId, $db) {
    $check = checkSubscription($schoolId, $db);

    if (!$check['has_access']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'subscription_required' => true,
            'subscription_status' => $check['status'],
            'message' => $check['message'],
            'end_date' => $check['end_date'] ?? null
        ]);
        exit;
    }

    return $check;
}
?>
