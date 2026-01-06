<?php
/**
 * Paystack Configuration
 * API keys loaded from environment variables for security
 */

// Paystack API Keys from environment variables
define('PAYSTACK_PUBLIC_KEY', getenv('PAYSTACK_PUBLIC_KEY') ?: '');
define('PAYSTACK_SECRET_KEY', getenv('PAYSTACK_SECRET_KEY') ?: '');

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

/**
 * Create a Subaccount
 * This allows each school to receive direct settlements from Paystack
 *
 * @param string $business_name - School name
 * @param string $settlement_bank - Bank code (e.g., '044' for Access Bank)
 * @param string $account_number - School's bank account number
 * @param string $description - Description of the subaccount
 * @return array - API response
 */
function createPaystackSubaccount($business_name, $settlement_bank, $account_number, $description = '', $primary_contact_email = null, $primary_contact_name = null, $primary_contact_phone = null) {
    $url = PAYSTACK_BASE_URL . "/subaccount";

    $fields = [
        'business_name' => $business_name,
        'settlement_bank' => $settlement_bank,
        'account_number' => $account_number,
        'percentage_charge' => 0, // School receives 100% via subaccount, platform fee handled in transaction_charge
        'description' => $description
    ];

    // Add optional contact information to improve verification chances
    if ($primary_contact_email) {
        $fields['primary_contact_email'] = $primary_contact_email;
    }
    if ($primary_contact_name) {
        $fields['primary_contact_name'] = $primary_contact_name;
    }
    if ($primary_contact_phone) {
        $fields['primary_contact_phone'] = $primary_contact_phone;
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
 * Update a Subaccount
 * @param string $subaccount_code - Subaccount code to update
 * @param array $data - Fields to update (business_name, settlement_bank, account_number, etc.)
 * @return array - API response
 */
function updatePaystackSubaccount($subaccount_code, $data) {
    $url = PAYSTACK_BASE_URL . "/subaccount/" . $subaccount_code;

    $fields_string = json_encode($data);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
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
 * Get Subaccount Details
 * @param string $subaccount_code - Subaccount code
 * @return array - API response
 */
function getPaystackSubaccount($subaccount_code) {
    $url = PAYSTACK_BASE_URL . "/subaccount/" . $subaccount_code;

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
 * List all Nigerian Banks supported by Paystack
 * @return array - API response with list of banks
 */
function getPaystackBanks() {
    $url = PAYSTACK_BASE_URL . "/bank?country=nigeria";

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
 * Delete a Subaccount
 * Note: Paystack doesn't actually delete subaccounts, but deactivates them
 * @param string $subaccount_code - Subaccount code to delete
 * @return array - API response
 */
function deletePaystackSubaccount($subaccount_code) {
    // Paystack API doesn't support true deletion, so we deactivate instead
    // by updating the active status to false
    $url = PAYSTACK_BASE_URL . "/subaccount/" . $subaccount_code;

    $fields = [
        'active' => false
    ];

    $fields_string = json_encode($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
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
 * Resolve Bank Account
 * Verify that bank account number is valid and get account name
 * @param string $account_number - Bank account number
 * @param string $bank_code - Bank code
 * @return array - API response with account name
 */
function resolvePaystackBankAccount($account_number, $bank_code) {
    $url = PAYSTACK_BASE_URL . "/bank/resolve?account_number=" . $account_number . "&bank_code=" . $bank_code;

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
