# Auto-Debit Setup Guide

This guide will help you set up automatic billing/auto-debit functionality for subscription renewals using Paystack's recurring payment feature.

## Overview

The auto-debit system will:
- Automatically charge subscribers on their renewal date
- Store payment authorization codes securely
- Track all auto-debit attempts and their status
- Send notifications before and after billing attempts
- Handle failed payments gracefully

## How It Works

1. **First Payment**: When a school makes their first subscription payment, Paystack returns an `authorization_code`
2. **Store Authorization**: The system stores this code to enable future recurring charges
3. **Auto-Debit Enabled**: Schools can opt-in to enable auto-debit for automatic renewals
4. **Scheduled Billing**: A cron job runs daily to process auto-debits for schools with due subscriptions
5. **Charge Authorization**: The system uses the stored authorization code to charge the school's card
6. **Update Subscription**: On success, the subscription is extended; on failure, notifications are sent

## Database Setup

Run the migration to add required tables and fields:

```bash
mysql -u your_username -p db_abcb24_school < backend/auto_debit_migration.sql
```

This creates:
- **Authorization fields** in `schools` table (authorization_code, customer_code, auto_debit_enabled, etc.)
- **auto_debit_history** table to track all billing attempts
- **notification_preferences** table for email notification settings

## API Endpoints

### 1. Enable Auto-Debit After Payment
**Endpoint**: `POST /api/auto-debit/enable`

Called after a successful payment to store the authorization code and enable auto-debit.

**Request Body**:
```json
{
  "reference": "RCGEN_1234567890_abc123",
  "enable_auto_debit": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Auto-debit enabled successfully",
  "auto_debit_enabled": true,
  "card_details": {
    "last4": "4081",
    "brand": "Visa"
  },
  "next_billing_date": "2025-01-16"
}
```

### 2. Get Auto-Debit Status
**Endpoint**: `GET /api/auto-debit/manage`

Returns current auto-debit status, card details, and billing history.

**Response**:
```json
{
  "success": true,
  "auto_debit": {
    "enabled": true,
    "has_authorization": true,
    "card_last4": "4081",
    "card_brand": "Visa",
    "next_billing_date": "2025-01-16"
  },
  "notifications": {
    "email_before_debit": 1,
    "days_before_notification": 3,
    "email_after_debit": 1,
    "email_on_failure": 1
  },
  "history": [
    {
      "reference": "RCGEN_1234567890_abc123",
      "amount": "5000.00",
      "status": "success",
      "attempt_date": "2024-12-16 02:00:00",
      "error_message": null
    }
  ]
}
```

### 3. Update Auto-Debit Settings
**Endpoint**: `POST /api/auto-debit/manage`

Enable/disable auto-debit or update notification preferences.

**Request Body**:
```json
{
  "enable": true,
  "notifications": {
    "email_before_debit": 1,
    "days_before_notification": 3,
    "email_after_debit": 1,
    "email_on_failure": 1
  }
}
```

### 4. Process Auto-Debits (Cron Job)
**Endpoint**: `GET /api/process-auto-debit`

This endpoint should be called daily via cron job to process auto-debits.

**Response**:
```json
{
  "success": true,
  "message": "Auto-debit processing completed",
  "results": {
    "total_processed": 5,
    "successful": 4,
    "failed": 1,
    "details": [...]
  }
}
```

## Cron Job Setup

Set up a daily cron job to run at 2 AM:

```bash
# Open crontab editor
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * curl http://localhost:8000/api/process-auto-debit
```

For production:
```bash
0 2 * * * curl https://your-domain.com/api/process-auto-debit
```

## Frontend Integration

### Step 1: After Successful Payment

After a payment is verified, prompt the user to enable auto-debit:

```javascript
// After payment verification
const enableAutoDebit = await fetch('http://localhost:8000/api/auto-debit/enable', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reference: paymentReference,
    enable_auto_debit: true // or false based on user choice
  })
});

const result = await enableAutoDebit.json();
console.log('Auto-debit enabled:', result);
```

### Step 2: Manage Auto-Debit Settings

Allow schools to view and manage their auto-debit settings:

```javascript
// Get current settings
const getSettings = async () => {
  const response = await fetch('http://localhost:8000/api/auto-debit/manage', {
    credentials: 'include'
  });
  return await response.json();
};

// Update settings
const updateSettings = async (enabled) => {
  const response = await fetch('http://localhost:8000/api/auto-debit/manage', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      enable: enabled
    })
  });
  return await response.json();
};
```

## Testing

### Test Auto-Debit Flow

1. **Make a Test Payment**:
   - Use Paystack test card: `4084 0840 8408 4081`
   - Complete the payment successfully

2. **Enable Auto-Debit**:
   ```bash
   curl -X POST http://localhost:8000/api/auto-debit/enable \
     -H "Content-Type: application/json" \
     -d '{"reference": "RCGEN_xxx", "enable_auto_debit": true}'
   ```

3. **Update Next Billing Date** (for testing):
   ```sql
   UPDATE schools
   SET next_billing_date = CURDATE()
   WHERE id = YOUR_SCHOOL_ID;
   ```

4. **Manually Trigger Auto-Debit**:
   ```bash
   curl http://localhost:8000/api/process-auto-debit
   ```

5. **Check Results**:
   ```sql
   SELECT * FROM auto_debit_history ORDER BY attempt_date DESC LIMIT 5;
   ```

## Security Best Practices

1. **Never expose authorization codes** in frontend or logs
2. **Use HTTPS in production** for all API calls
3. **Validate webhook signatures** (optional but recommended)
4. **Store authorization codes encrypted** (consider implementing encryption)
5. **Implement rate limiting** on auto-debit endpoints
6. **Log all auto-debit attempts** for audit trail

## Error Handling

The system handles various failure scenarios:

- **Invalid authorization code**: Auto-debit disabled, school notified
- **Insufficient funds**: Subscription marked expired, retry notification sent
- **Card expired**: School prompted to update payment method
- **Network errors**: Logged and retried in next cycle

## Monitoring

Monitor auto-debit performance:

```sql
-- Success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM auto_debit_history), 2) as percentage
FROM auto_debit_history
GROUP BY status;

-- Recent failures
SELECT
  s.school_name,
  h.amount,
  h.error_message,
  h.attempt_date
FROM auto_debit_history h
JOIN schools s ON h.school_id = s.id
WHERE h.status = 'failed'
ORDER BY h.attempt_date DESC
LIMIT 10;
```

## Troubleshooting

### Auto-debit not working
- Check if authorization_code is stored in database
- Verify auto_debit_enabled = 1 for the school
- Confirm next_billing_date is today or in the past
- Check cron job is running: `tail -f /var/log/cron.log`

### Payment fails repeatedly
- Verify Paystack API keys are correct
- Check authorization code hasn't expired
- Ensure school's card is still valid
- Review error messages in auto_debit_history table

## Next Steps

1. ✅ Run database migration
2. ✅ Set up cron job
3. ⏳ Implement email notifications (optional)
4. ⏳ Add webhook handler for Paystack events (optional)
5. ⏳ Create frontend UI for auto-debit management
6. ⏳ Test with Paystack test cards
7. ⏳ Monitor first production auto-debits

## Support

For Paystack-related issues:
- Paystack Documentation: https://paystack.com/docs/payments/recurring-charges/
- Paystack Support: support@paystack.com
