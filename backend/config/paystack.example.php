<?php
/**
 * Paystack Configuration - EXAMPLE
 * Copy this file to paystack.php and update with your actual Paystack keys
 * Get your keys from https://dashboard.paystack.com/#/settings/developer
 */

// Paystack API Keys
// IMPORTANT: Replace these with your actual Paystack keys
define('PAYSTACK_PUBLIC_KEY', 'pk_test_your_public_key_here');
define('PAYSTACK_SECRET_KEY', 'sk_test_your_secret_key_here');

// For production, use live keys:
// define('PAYSTACK_PUBLIC_KEY', 'pk_live_your_public_key_here');
// define('PAYSTACK_SECRET_KEY', 'sk_live_your_secret_key_here');

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

// Add other Paystack functions as needed...
