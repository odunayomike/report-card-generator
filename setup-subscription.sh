#!/bin/bash

# Subscription System Setup Script
# This script will update your database with subscription tables

echo "=========================================="
echo "Report Card Generator - Subscription Setup"
echo "=========================================="
echo ""

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL is not installed or not in PATH"
    exit 1
fi

echo "This script will:"
echo "1. Add subscription fields to the schools table"
echo "2. Create subscription_plans table"
echo "3. Create subscription_payments table"
echo "4. Create subscription_history table"
echo "5. Insert the default 5000 NGN monthly plan"
echo ""

# Prompt for MySQL credentials
read -p "Enter MySQL username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Enter MySQL password: " DB_PASS
echo ""

DB_NAME="db_abcb24_school"

echo ""
echo "Applying database migration..."

# Run the migration SQL file
if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < backend/subscription_migration.sql; then
    echo ""
    echo "✓ Database migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Your Paystack keys are already configured in backend/config/paystack.php"
    echo "2. Start your backend: cd backend && php -S localhost:8000 index.php"
    echo "3. Start your frontend: npm run dev"
    echo "4. Login and navigate to the Subscription page"
    echo "5. Use test card: 4084 0840 8408 4081 to test payment"
    echo ""
    echo "For more details, see SUBSCRIPTION_SETUP.md"
else
    echo ""
    echo "✗ Migration failed. Please check your database credentials and try again."
    exit 1
fi
