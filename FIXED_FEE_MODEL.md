# Fixed ₦200 Platform Fee Model

## Overview

The platform now uses a **fixed ₦200 fee per transaction** instead of a percentage-based fee. Parents pay **all transaction costs**, ensuring schools receive the exact fee amount they're owed.

## Payment Breakdown

### Example: Parent Paying ₦10,000 School Fee

```
School Fee:           ₦10,000
Platform Fee:         +₦200
Subtotal:             ₦10,200
Paystack Fee (1.5%):  +₦153
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Parent Pays:    ₦10,353

Settlement:
→ School receives:    ₦10,000 (exact amount owed)
→ Platform receives:  ₦200 (fixed fee)
```

### Key Points:

1. **Parent pays**: School fee + ₦200 + Paystack transaction fees
2. **School receives**: Exact fee amount (₦10,000)
3. **Platform receives**: ₦200 per transaction
4. **Paystack receives**: Their transaction fee (~1.5%)

## Benefits of Fixed Fee Model

### For Parents:
- ✅ Transparent pricing - know exactly what you're paying
- ✅ Predictable costs - always ₦200 platform fee regardless of amount

### For Schools:
- ✅ Receive exact fee amount
- ✅ No deductions from school fees
- ✅ Predictable revenue - no percentage cuts

### For Platform (SchoolHub):
- ✅ Consistent ₦200 revenue per transaction
- ✅ Simple pricing model
- ✅ Scales with transaction volume, not transaction value

## How It Works Technically

### 1. **Database Schema**

**Field**: `platform_fee_flat_charge` (INT)
- Stored in **kobo** (₦200 = 20,000 kobo)
- Default: 20,000
- Location: `schools` table

### 2. **Payment Initialization**

```php
// Calculate total amount
$feeAmountInKobo = $amount * 100;        // ₦10,000 = 1,000,000 kobo
$platformFeeKobo = 20000;                  // ₦200 = 20,000 kobo
$totalAmountInKobo = $feeAmountInKobo + $platformFeeKobo; // 1,020,000 kobo

// Paystack transaction
$fields = [
    'amount' => $totalAmountInKobo,        // Parent charged this
    'subaccount' => $subaccountCode,       // School's account
    'transaction_charge' => $platformFeeKobo, // Platform gets ₦200
    'bearer' => 'account'                   // Parent pays Paystack fees
];
```

### 3. **Money Flow**

```
Parent initiates payment
    ↓
Paystack charges: ₦10,000 + ₦200 + ₦153 = ₦10,353
    ↓
Paystack automatically splits:
    → Platform: ₦200
    → School: ₦10,000
    → Paystack keeps: ₦153 (transaction fee)
    ↓
Settlements (1-2 days):
    → ₦200 → Platform bank account
    → ₦10,000 → School bank account
```

## Implementation Files Changed

### Backend

1. **Database Migration**
   - File: `backend/migrations/add_paystack_subaccount_to_schools.sql`
   - Changed: `platform_fee_percentage` → `platform_fee_flat_charge`

2. **Paystack Config**
   - File: `backend/config/paystack.php`
   - Updated: `createPaystackSubaccount()` to use flat charge

3. **Payment Initialization**
   - File: `backend/routes/accounting/parent/initialize-paystack-payment.php`
   - Added: Platform fee calculation
   - Added: `transaction_charge` parameter
   - Added: `bearer: 'account'` (parent pays Paystack fees)

4. **Subaccount Management**
   - File: `backend/routes/accounting/admin/create-subaccount.php`
   - Updated: Use fixed ₦200 fee instead of percentage
   - File: `backend/routes/accounting/admin/get-settlement-info.php`
   - Updated: Return fixed fee amount

### Frontend

1. **Settlement Setup UI**
   - File: `src/pages/accounting/SettlementSetup.jsx`
   - Removed: Percentage fee input
   - Added: Fixed ₦200 fee display
   - Updated: Info messages to explain parent pays all fees

## Mobile App Integration

The mobile app should display the fee breakdown to parents before payment:

```
┌─────────────────────────────────────┐
│ Payment Summary                     │
├─────────────────────────────────────┤
│ School Fee:          ₦10,000.00     │
│ Platform Fee:        ₦200.00        │
│ Transaction Fee:     ₦153.00        │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Total:               ₦10,353.00     │
└─────────────────────────────────────┘
```

## Cost Comparison

### Old Model (2% Percentage):

| Fee Amount | 2% Platform Fee | School Receives |
|-----------|----------------|----------------|
| ₦5,000    | ₦100          | ₦4,900         |
| ₦10,000   | ₦200          | ₦9,800         |
| ₦50,000   | ₦1,000        | ₦49,000        |
| ₦100,000  | ₦2,000        | ₦98,000        |

**Problem**: Schools lose more as fees increase

### New Model (Fixed ₦200):

| Fee Amount | Platform Fee | School Receives | Parent Pays Extra |
|-----------|--------------|----------------|------------------|
| ₦5,000    | ₦200        | ₦5,000         | ₦200 + ~₦78      |
| ₦10,000   | ₦200        | ₦10,000        | ₦200 + ₦153      |
| ₦50,000   | ₦200        | ₦50,000        | ₦200 + ₦753      |
| ₦100,000  | ₦200        | ₦100,000       | ₦200 + ₦1,503    |

**Advantage**:
- Schools receive exact amounts
- Platform fee is predictable
- Better for larger transactions

## Migration Steps

If you already have schools using the percentage model:

### 1. Apply Database Migration

```bash
mysql -u root -p report_card_db < backend/migrations/add_paystack_subaccount_to_schools.sql
```

This adds the `platform_fee_flat_charge` column.

### 2. No Action Needed for Existing Subaccounts

The payment initialization code now uses `transaction_charge` instead of percentage split, so existing subaccounts will work with the new model.

### 3. Test Payment Flow

Test with a small amount to verify:
1. Parent sees correct total (fee + ₦200 + Paystack fee)
2. School receives exact fee amount
3. Platform receives ₦200

## Frequently Asked Questions

### Q: Why ₦200 specifically?

A: It's a reasonable fee that:
- Covers platform operational costs
- Isn't too high to discourage usage
- Is simple and easy to understand
- Scales well across different fee amounts

### Q: Can schools negotiate the platform fee?

A: The fee is currently fixed at ₦200 for all schools. To change it for a specific school:

```sql
UPDATE schools
SET platform_fee_flat_charge = 15000  -- ₦150 in kobo
WHERE id = 123;
```

### Q: What if parents complain about the extra ₦200?

A: Communicate that:
- The fee covers the platform's services (mobile app, payment processing, reporting)
- It's a fixed ₦200 regardless of fee amount
- Schools receive 100% of their fees
- It's more transparent than hidden percentage fees

### Q: Can we remove the platform fee entirely?

A: Yes, but you'll need another revenue model:
- Rely solely on subscription fees
- Or charge schools a monthly/annual fee
- Update the code to set `transaction_charge` to 0

## Revenue Projections

### Example School:
- 500 students
- Average 3 fee payments per student per year
- Total transactions: 1,500/year

**Annual Revenue from this school**: 1,500 × ₦200 = ₦300,000

### Platform with 100 Schools:
- 100 schools × 500 students = 50,000 students
- 50,000 × 3 payments/year = 150,000 transactions
- **Annual transaction revenue**: 150,000 × ₦200 = **₦30,000,000**

Plus subscription fees for additional revenue!

## Summary

✅ Fixed ₦200 fee per transaction
✅ Parents pay all fees (platform + Paystack)
✅ Schools receive exact fee amounts
✅ Transparent and predictable
✅ Scales with transaction volume
✅ Simple to explain and implement
