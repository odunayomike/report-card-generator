# Paystack Subaccounts Implementation Guide

## Overview

This implementation enables each school to receive fee payments directly from Paystack through **Subaccounts**. When a parent pays fees via the mobile app, Paystack automatically splits the payment:
- **Platform fee** (default 2%) → Your main Paystack account
- **Remaining amount** → School's bank account (settled directly by Paystack)

## How It Works

### 1. **Payment Flow**

```
Parent → Mobile App → Paystack → [Auto Split] → School Bank Account (98%)
                                               → Platform Account (2%)
```

### 2. **Settlement Timeline**

- **Test Mode**: No real money transferred (using test keys)
- **Live Mode**:
  - T+1 or T+2 days (1-2 business days after transaction)
  - Some verified businesses get T+0 (same day)

### 3. **School Setup Process**

1. School logs into dashboard
2. Goes to **Accounting → Settlement Setup**
3. Selects their bank
4. Enters 10-digit account number
5. Clicks "Verify" to confirm account name
6. Clicks "Create Settlement Account"
7. Paystack creates subaccount
8. Future payments automatically settled to school's account

## Implementation Details

### Database Changes

**File**: `/backend/migrations/add_paystack_subaccount_to_schools.sql`

Added columns to `schools` table:
```sql
- paystack_subaccount_code    (Paystack's unique code for this school)
- bank_name                     (School's bank name)
- bank_account_number           (School's account number)
- bank_account_name             (Account holder name)
- settlement_bank_verified      (Verification status)
- platform_fee_percentage       (Default: 2.0%)
```

**To apply the migration**:
```bash
mysql -u root -p report_card_db < backend/migrations/add_paystack_subaccount_to_schools.sql
```

### Backend Files Created/Modified

#### 1. **Paystack Helper Functions**
`/backend/config/paystack.php`

New functions:
- `createPaystackSubaccount()` - Creates subaccount for a school
- `updatePaystackSubaccount()` - Updates existing subaccount
- `getPaystackSubaccount()` - Fetches subaccount details
- `getPaystackBanks()` - Lists all Nigerian banks
- `resolvePaystackBankAccount()` - Verifies account number

#### 2. **API Endpoints Created**

**a) Create/Update Subaccount**
- **File**: `/backend/routes/accounting/admin/create-subaccount.php`
- **Method**: POST
- **URL**: `/api/accounting/admin/create-subaccount`
- **Auth**: School admin only
- **Body**:
  ```json
  {
    "bank_code": "044",
    "account_number": "0123456789",
    "account_name": "School Name",
    "platform_fee_percentage": 2.0
  }
  ```

**b) Get Bank List**
- **File**: `/backend/routes/accounting/admin/get-banks.php`
- **Method**: GET
- **URL**: `/api/accounting/admin/get-banks`
- **Returns**: List of all Nigerian banks

**c) Verify Bank Account**
- **File**: `/backend/routes/accounting/admin/verify-bank-account.php`
- **Method**: POST
- **URL**: `/api/accounting/admin/verify-bank-account`
- **Body**:
  ```json
  {
    "account_number": "0123456789",
    "bank_code": "044"
  }
  ```
- **Returns**: Account name if valid

**d) Get Settlement Info**
- **File**: `/backend/routes/accounting/admin/get-settlement-info.php`
- **Method**: GET
- **URL**: `/api/accounting/admin/get-settlement-info`
- **Returns**: School's current settlement configuration

#### 3. **Payment Initialization Updated**

**File**: `/backend/routes/accounting/parent/initialize-paystack-payment.php`

**Changes**:
- Now fetches school's `paystack_subaccount_code`
- Includes `subaccount` parameter in Paystack transaction
- Paystack automatically handles split payment

**Before**:
```php
$fields = [
    'email' => $email,
    'amount' => $amountInKobo,
    'reference' => $reference,
    'currency' => 'NGN'
];
```

**After**:
```php
$fields = [
    'email' => $email,
    'amount' => $amountInKobo,
    'reference' => $reference,
    'currency' => 'NGN',
    'subaccount' => $student['paystack_subaccount_code']  // ← Added
];
```

### Frontend Implementation

#### 1. **Settlement Setup Page**

**File**: `/src/pages/accounting/SettlementSetup.jsx`

Features:
- Bank dropdown (fetched from Paystack)
- Account number input (10 digits)
- "Verify" button to check account
- Auto-fills account name after verification
- Shows current settlement configuration
- Update existing subaccount

#### 2. **Routes Added**

**File**: `/src/pages/accounting/AccountingDashboard.jsx`
```jsx
<Route path="settlement-setup" element={<SettlementSetup />} />
```

**File**: `/src/components/DashboardLayout.jsx`
- Added "Settlement Setup" menu item under Accounting

## Setup Instructions

### Step 1: Apply Database Migration

```bash
mysql -u root -p report_card_db < backend/migrations/add_paystack_subaccount_to_schools.sql
```

### Step 2: Switch to Live Keys (When Ready for Production)

**File**: `/backend/config/paystack.php`

Replace test keys with live keys:
```php
// Current (TEST)
define('PAYSTACK_PUBLIC_KEY', 'pk_test_...');
define('PAYSTACK_SECRET_KEY', 'sk_test_...');

// Change to (LIVE)
define('PAYSTACK_PUBLIC_KEY', 'pk_live_...');
define('PAYSTACK_SECRET_KEY', 'sk_live_...');
```

Get live keys from: https://dashboard.paystack.com/#/settings/developer

### Step 3: Schools Add Bank Details

1. School admin logs in
2. Navigate to: **Dashboard → Accounting → Settlement Setup**
3. Select bank from dropdown
4. Enter 10-digit account number
5. Click "Verify" to confirm account name
6. Click "Create Settlement Account"

### Step 4: Start Receiving Payments

Once setup is complete:
- Parents pay fees via mobile app
- Paystack processes payment
- Platform receives 2% fee
- School receives 98% directly from Paystack (1-2 days)

## Platform Fee Configuration

The platform fee is set per school in the database. Default is 2%.

**To change the platform fee**:

1. Update database:
```sql
UPDATE schools
SET platform_fee_percentage = 3.0
WHERE id = 1;
```

2. Re-create/update the subaccount via the Settlement Setup page

**Note**: Fee changes only apply to new transactions, not existing ones.

## Testing

### Test Mode (Current Setup)

With test keys, you can:
- ✅ Create subaccounts
- ✅ Verify bank accounts
- ✅ Initialize payments
- ❌ NO real money transferred
- ❌ NO actual settlements

### Live Mode Testing

Before going live:
1. Get live API keys from Paystack
2. Complete business verification
3. Test with small amounts
4. Verify settlements in Paystack dashboard

## Troubleshooting

### 1. "Failed to create subaccount"

**Possible causes**:
- Invalid bank code
- Invalid account number
- Account name doesn't match
- Business not verified on Paystack

**Solution**:
- Verify account using "Verify" button first
- Ensure school has completed KYC on Paystack
- Check error message in API response

### 2. "Payments not being split"

**Check**:
- School has valid `paystack_subaccount_code` in database
- Payment initialization includes `subaccount` parameter
- Using correct Paystack keys (live vs test)

### 3. "Settlement not received"

**Check**:
- Using live keys (not test keys)
- Bank account verified in Paystack dashboard
- Settlement timeline (T+1 or T+2 days)
- Check Paystack dashboard → Settlements

## Security Notes

1. **API Keys**: Never commit live keys to version control
2. **Account Verification**: Always verify accounts before saving
3. **Authorization**: Only school admins can manage settlement accounts
4. **Audit Trail**: All subaccount changes logged in Paystack dashboard

## Paystack Dashboard Access

Schools can view their settlements:
1. Log into https://dashboard.paystack.com
2. Go to **Settlements** tab
3. View settlement history, amounts, dates
4. Download settlement reports

**Note**: Each school needs their own Paystack dashboard login (if you want them to track settlements independently). Otherwise, you manage all settlements from the main account.

## Next Steps

1. ✅ Apply database migration
2. ⬜ Test with test keys
3. ⬜ Complete Paystack business verification
4. ⬜ Switch to live keys
5. ⬜ Have schools add bank details
6. ⬜ Test live payment flow
7. ⬜ Monitor first settlements

## Support

For Paystack-specific issues:
- **Documentation**: https://paystack.com/docs/
- **Support**: support@paystack.com
- **Subaccounts Guide**: https://paystack.com/docs/payments/split-payments/#subaccounts

## Summary

With this implementation:
- ✅ Each school receives payments directly from Paystack
- ✅ No manual distribution needed
- ✅ Platform automatically receives 2% fee
- ✅ Settlements happen automatically (1-2 days)
- ✅ Schools can track their own settlements
- ✅ Scalable for unlimited schools
