<?php
/**
 * Process Auto-Debit for Schools
 * This endpoint should be called daily via a cron job to process auto-debits for schools with due subscriptions
 *
 * Cron job setup (run daily at 2 AM):
 * 0 2 * * * curl http://localhost:8000/api/process-auto-debit
 */

require_once __DIR__ . '/../config/paystack.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

try {
    // Find all schools with auto-debit enabled and subscription due today or in the past
    $query = "
        SELECT
            id,
            school_name,
            email,
            authorization_code,
            customer_code,
            next_billing_date,
            subscription_end_date
        FROM schools
        WHERE auto_debit_enabled = 1
        AND authorization_code IS NOT NULL
        AND next_billing_date <= CURDATE()
        AND subscription_status IN ('active', 'expired')
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results = [
        'total_processed' => 0,
        'successful' => 0,
        'failed' => 0,
        'details' => []
    ];

    foreach ($schools as $school) {
        $results['total_processed']++;

        // Get the subscription plan amount (assuming monthly ₦5,000)
        $planQuery = "SELECT amount FROM subscription_plans WHERE plan_name = 'Monthly Plan' LIMIT 1";
        $planStmt = $db->prepare($planQuery);
        $planStmt->execute();
        $plan = $planStmt->fetch(PDO::FETCH_ASSOC);

        $amount = $plan ? intval($plan['amount']) * 100 : 500000; // Amount in kobo

        // Generate reference
        $reference = generatePaymentReference();

        // Attempt to charge the authorization
        $chargeResponse = chargeAuthorization(
            $school['authorization_code'],
            $school['email'],
            $amount,
            $reference,
            [
                'school_id' => $school['id'],
                'school_name' => $school['school_name'],
                'subscription_type' => 'monthly',
                'auto_debit' => true
            ]
        );

        $status = 'failed';
        $errorMessage = null;

        if ($chargeResponse && isset($chargeResponse['status']) && $chargeResponse['status'] === true) {
            // Payment successful
            $status = 'success';
            $results['successful']++;

            // Update school subscription
            $newEndDate = date('Y-m-d', strtotime('+30 days'));
            $nextBillingDate = date('Y-m-d', strtotime('+30 days'));

            $updateSchoolQuery = "
                UPDATE schools
                SET subscription_status = 'active',
                    subscription_end_date = :end_date,
                    next_billing_date = :next_billing
                WHERE id = :school_id
            ";
            $updateStmt = $db->prepare($updateSchoolQuery);
            $updateStmt->execute([
                ':end_date' => $newEndDate,
                ':next_billing' => $nextBillingDate,
                ':school_id' => $school['id']
            ]);

            // Record payment
            $paymentQuery = "
                INSERT INTO subscription_payments
                (school_id, plan_id, amount, currency, reference, status, authorization_code, payment_date)
                VALUES (:school_id, 1, :amount, 'NGN', :reference, 'success', :auth_code, NOW())
            ";
            $paymentStmt = $db->prepare($paymentQuery);
            $paymentStmt->execute([
                ':school_id' => $school['id'],
                ':amount' => $amount / 100,
                ':reference' => $reference,
                ':auth_code' => $school['authorization_code']
            ]);

        } else {
            // Payment failed
            $results['failed']++;
            $errorMessage = isset($chargeResponse['message']) ? $chargeResponse['message'] : 'Unknown error';

            // If subscription is expired, update status
            if (strtotime($school['subscription_end_date']) < time()) {
                $updateSchoolQuery = "UPDATE schools SET subscription_status = 'expired' WHERE id = :school_id";
                $updateStmt = $db->prepare($updateSchoolQuery);
                $updateStmt->execute([':school_id' => $school['id']]);
            }

            // TODO: Send failure notification email to school
        }

        // Log the auto-debit attempt
        $logQuery = "
            INSERT INTO auto_debit_history
            (school_id, reference, amount, status, authorization_code, paystack_response, error_message)
            VALUES (:school_id, :reference, :amount, :status, :auth_code, :response, :error)
        ";
        $logStmt = $db->prepare($logQuery);
        $logStmt->execute([
            ':school_id' => $school['id'],
            ':reference' => $reference,
            ':amount' => $amount / 100,
            ':status' => $status,
            ':auth_code' => $school['authorization_code'],
            ':response' => json_encode($chargeResponse),
            ':error' => $errorMessage
        ]);

        $results['details'][] = [
            'school_id' => $school['id'],
            'school_name' => $school['school_name'],
            'reference' => $reference,
            'amount' => $amount / 100,
            'status' => $status,
            'error' => $errorMessage
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Auto-debit processing completed',
        'results' => $results
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error processing auto-debits: ' . $e->getMessage()
    ]);
}
