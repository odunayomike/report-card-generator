# Subscription & Payment Setup Guide

This guide will help you set up the subscription and payment system with Paystack for the Report Card Generator.

## Overview

The subscription system includes:
- Monthly subscription plan (₦5,000/month)
- Paystack payment integration
- Automatic subscription tracking
- Payment verification and activation

## Setup Instructions

### 1. Get Your Paystack API Keys

1. Create a Paystack account at https://paystack.com
2. Login to your Paystack Dashboard: https://dashboard.paystack.com
3. Go to Settings > API Keys & Webhooks
4. Copy your **Public Key** and **Secret Key**

**Important:**
- For testing, use your **TEST** keys (starts with `pk_test_` and `sk_test_`)
- For production, use your **LIVE** keys (starts with `pk_live_` and `sk_live_`)

### 2. Configure Backend

Edit the file: `backend/config/paystack.php`

Replace the placeholder keys with your actual Paystack keys:

```php
// Replace these with your actual Paystack keys
define('PAYSTACK_PUBLIC_KEY', 'pk_test_your_actual_public_key_here');
define('PAYSTACK_SECRET_KEY', 'sk_test_your_actual_secret_key_here');
```

### 3. Update Database Schema

Run the updated database schema to add subscription tables:

```bash
mysql -u your_username -p db_abcb24_school < backend/database.sql
```

Or manually run these SQL commands:

```sql
-- Add subscription fields to schools table
ALTER TABLE schools
ADD COLUMN subscription_status ENUM('active', 'expired', 'trial') DEFAULT 'trial',
ADD COLUMN subscription_end_date DATE;

-- Create subscription tables (see database.sql for full schema)
```

### 4. Update Callback URL (Production Only)

When deploying to production, update the callback URL in `backend/config/paystack.php`:

```php
'callback_url' => 'https://your-domain.com/subscription/verify'
```

## Testing the Subscription Flow

### 1. Test Payment

1. Start your application:
   ```bash
   # Backend (from backend directory)
   php -S localhost:8000 index.php

   # Frontend (from root directory)
   npm run dev
   ```

2. Login to your school account
3. Navigate to the "Subscription" page in the dashboard
4. Click "Subscribe Now" on the Monthly Plan
5. You will be redirected to Paystack's payment page

### 2. Test Card Details

Use Paystack's test cards for testing:

**Successful Payment:**
- Card Number: `4084 0840 8408 4081`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 408)
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**
- Card Number: `5060 6666 6666 6666`
- This card will simulate a failed payment

### 3. Verify Payment

After completing the payment:
1. You'll be redirected to the verification page
2. The system will verify the payment with Paystack
3. If successful, your subscription will be activated
4. You'll be redirected to the dashboard

## Features

### Subscription Plans Page
- View available subscription plans
- See current subscription status
- View days remaining
- Subscribe or renew subscription

### Payment Verification
- Automatic payment verification
- Real-time status updates
- Detailed subscription information
- Automatic redirect after success

### Subscription Status Tracking
- Active subscriptions
- Expired subscriptions
- Trial status
- Payment history

## API Endpoints

### Get Subscription Plans
```
GET /api/subscription/get-plans
```

### Initialize Payment
```
POST /api/subscription/initialize-payment
Body: { "plan_id": 1 }
```

### Verify Payment
```
GET /api/subscription/verify-payment?reference=RCGEN_xxx
```

### Get Subscription Status
```
GET /api/subscription/get-status
```

## Database Tables

### subscription_plans
Stores available subscription plans (5000 NGN monthly plan is pre-inserted)

### subscription_payments
Tracks all payment transactions and their status

### subscription_history
Records subscription periods and expiration dates

### schools (updated)
Added `subscription_status` and `subscription_end_date` fields

## Security Notes

1. **Never commit your Paystack keys to version control**
2. Use environment variables for production
3. Always use TEST keys for development
4. Switch to LIVE keys only in production
5. The callback URL must be HTTPS in production

## Troubleshooting

### Payment initialization fails
- Check that Paystack keys are correct
- Verify that the school is authenticated
- Check network connectivity

### Payment verification fails
- Ensure the reference parameter is present
- Check Paystack API logs in your dashboard
- Verify webhook configuration (if using webhooks)

### Subscription not activating
- Check database connection
- Verify transaction was successful in Paystack dashboard
- Check server logs for errors

## Next Steps

1. Configure your actual Paystack keys
2. Update the database schema
3. Test the payment flow with test cards
4. Add webhook support for automatic status updates (optional)
5. Configure production callback URLs
6. Switch to LIVE keys when ready for production

## Support

For Paystack-related issues:
- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com

For application issues:
- Check server logs
- Review browser console for errors
- Verify API endpoints are accessible
