<?php
/**
 * Paystack Configuration
 * API keys and settings for Paystack payment integration
 */

// Paystack API Keys
// IMPORTANT: Replace these with your actual Paystack keys
// Get your keys from https://dashboard.paystack.com/#/settings/developer
define('PAYSTACK_PUBLIC_KEY', 'pk_test_467d299831e13a0ea72533d45b7810d908a735d4');
define('PAYSTACK_SECRET_KEY', 'sk_test_fc21b7295b9236fa549e995757ece9541c14a54f');

// Paystack API Base URL
define('PAYSTACK_BASE_URL', 'https://api.paystack.co');

/**
 * Initialize Paystack Payment
 * @param string $email - Customer email
 * @param int $amount - Amount in kobo (e.g., 5000 * 100 = 500000 kobo for 5000 naira)
 * @param string $reference - Unique payment reference
 * @param array $metadata - Additional metadata
 * @return array - API response
 */
function initializePaystackPayment($email, $amount, $reference, $metadata = []) {
    $url = PAYSTACK_BASE_URL . "/transaction/initialize";

    $fields = [
        'email' => $email,
        'amount' => $amount,
        'reference' => $reference,
        'metadata' => $metadata,
        'callback_url' => FRONTEND_URL . '/subscription/verify'
    ];

    $fields_string = json_encode($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json",
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    curl_close($ch);

    return json_decode($result, true);
}

/**
 * Verify Paystack Payment
 * @param string $reference - Payment reference to verify
 * @return array - API response
 */
function verifyPaystackPayment($reference) {
    $url = PAYSTACK_BASE_URL . "/transaction/verify/" . $reference;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
    ]);

    $result = curl_exec($ch);
    curl_close($ch);

    return json_decode($result, true);
}

/**
 * Generate unique payment reference
 * @return string
 */
function generatePaymentReference() {
    return 'RCGEN_' . time() . '_' . uniqid();
}

/**
 * Charge Authorization (for recurring payments/auto-debit)
 * @param string $authorization_code - Authorization code from previous transaction
 * @param string $email - Customer email
 * @param int $amount - Amount in kobo (e.g., 5000 * 100 = 500000 kobo for 5000 naira)
 * @param string $reference - Unique payment reference
 * @param array $metadata - Additional metadata
 * @return array - API response
 */
function chargeAuthorization($authorization_code, $email, $amount, $reference = null, $metadata = []) {
    $url = PAYSTACK_BASE_URL . "/transaction/charge_authorization";

    $fields = [
        'authorization_code' => $authorization_code,
        'email' => $email,
        'amount' => $amount,
        'metadata' => $metadata
    ];

    if ($reference) {
        $fields['reference'] = $reference;
    }

    $fields_string = json_encode($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json",
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    curl_close($ch);

    return json_decode($result, true);
}

/**
 * Create a Subscription Plan
 * @param string $name - Plan name
 * @param int $amount - Amount in kobo
 * @param string $interval - Payment interval (daily, weekly, monthly, annually)
 * @param string $description - Plan description
 * @return array - API response
 */
function createPaystackPlan($name, $amount, $interval = 'monthly', $description = '') {
    $url = PAYSTACK_BASE_URL . "/plan";

    $fields = [
        'name' => $name,
        'amount' => $amount,
        'interval' => $interval,
        'description' => $description
    ];

    $fields_string = json_encode($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json",
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    curl_close($ch);

    return json_decode($result, true);
}

/**
 * Create a Subscription
 * @param string $customer_code - Customer code or email
 * @param string $plan_code - Plan code
 * @param string $authorization_code - Authorization code (optional)
 * @return array - API response
 */
function createPaystackSubscription($customer_code, $plan_code, $authorization_code = null) {
    $url = PAYSTACK_BASE_URL . "/subscription";

    $fields = [
        'customer' => $customer_code,
        'plan' => $plan_code
    ];

    if ($authorization_code) {
        $fields['authorization'] = $authorization_code;
    }

    $fields_string = json_encode($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Content-Type: application/json",
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    curl_close($ch);

    return json_decode($result, true);
}
?>
