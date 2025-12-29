<?php
/**
 * Update Subscription Plan Prices
 * Updates the prices to match the correct pricing
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "=== Updating Subscription Plan Prices ===\n\n";

    // Update Monthly Plan to ₦15,000
    $updateMonthly = "UPDATE subscription_plans
                      SET amount = 15000,
                          description = 'Pay as you go - Monthly subscription'
                      WHERE plan_name LIKE '%Monthly%' OR duration_days = 30";
    $db->exec($updateMonthly);
    echo "✓ Updated Monthly Plan to ₦15,000\n";

    // Update Per Term Plan to ₦40,000 (90 days)
    $updateTerm = "UPDATE subscription_plans
                   SET amount = 40000,
                       description = 'Perfect for academic terms - 3 months coverage. Save ₦5,000!'
                   WHERE plan_name LIKE '%Term%' OR duration_days = 90";
    $db->exec($updateTerm);
    echo "✓ Updated Per Term Plan to ₦40,000\n";

    // Update Yearly Plan to ₦150,000 (365 days)
    $updateYearly = "UPDATE subscription_plans
                     SET amount = 150000,
                         description = 'Best value - Full year coverage. Save ₦30,000!'
                     WHERE plan_name LIKE '%Year%' OR plan_name LIKE '%Annual%' OR duration_days = 365";
    $db->exec($updateYearly);
    echo "✓ Updated Yearly Plan to ₦150,000\n";

    echo "\n=== Verifying Updated Prices ===\n\n";

    // Show updated plans
    $stmt = $db->query("SELECT id, plan_name, amount, duration_days, currency, description
                        FROM subscription_plans
                        WHERE is_active = TRUE
                        ORDER BY amount ASC");
    $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($plans as $plan) {
        echo "Plan: {$plan['plan_name']}\n";
        echo "  Amount: ₦" . number_format($plan['amount']) . "\n";
        echo "  Duration: {$plan['duration_days']} days\n";
        echo "  Description: {$plan['description']}\n\n";
    }

    echo "=== Update Complete ===\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
