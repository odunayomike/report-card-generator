# Quick Start: Paystack Subaccounts

## What You Just Implemented

Each school now receives fee payments **directly from Paystack** to their own bank account. No manual distribution needed!

## 5-Minute Setup

### 1. Apply Database Migration

```bash
cd /Users/user/report-card-generator
mysql -u root -p report_card_db < backend/migrations/add_paystack_subaccount_to_schools.sql
```

### 2. School Setup (In Browser)

1. Login as school admin
2. Go to: **Dashboard → Accounting → Settlement Setup**
3. Select bank → Enter account number → Click "Verify"
4. Click "Create Settlement Account"
5. Done! ✅

### 3. Payment Flow (Automatic)

```
Parent pays ₦10,000 fee
    ↓
Paystack processes payment
    ↓
Platform receives: ₦200 (2% fee)
School receives: ₦9,800 (98%)
    ↓
Money in school's bank account (1-2 days)
```

## Important Files

### Backend
- `backend/config/paystack.php` - Subaccount functions
- `backend/routes/accounting/admin/create-subaccount.php` - Create subaccount
- `backend/routes/accounting/admin/verify-bank-account.php` - Verify account
- `backend/routes/accounting/parent/initialize-paystack-payment.php` - Now includes subaccount

### Frontend
- `src/pages/accounting/SettlementSetup.jsx` - UI for bank setup
- `src/components/DashboardLayout.jsx` - Menu item added

### Database
- `schools` table - Added 6 new columns for settlement info

## Live vs Test Mode

### Currently (Test Mode)
- Using: `pk_test_...` and `sk_test_...`
- Result: No real money, no settlements
- Purpose: Testing only

### Production (Live Mode)
1. Change keys in `backend/config/paystack.php`:
   ```php
   define('PAYSTACK_PUBLIC_KEY', 'pk_live_YOUR_KEY');
   define('PAYSTACK_SECRET_KEY', 'sk_live_YOUR_KEY');
   ```
2. Get keys from: https://dashboard.paystack.com/#/settings/developer
3. Complete business verification first!

## API Endpoints Added

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/accounting/admin/create-subaccount` | POST | Create/update school subaccount |
| `/api/accounting/admin/get-banks` | GET | List Nigerian banks |
| `/api/accounting/admin/verify-bank-account` | POST | Verify account number |
| `/api/accounting/admin/get-settlement-info` | GET | Get school's settlement config |

## Platform Fee

- **Default**: 2% per transaction
- **Changeable**: Update `platform_fee_percentage` in schools table
- **Example**: ₦10,000 payment = ₦200 to platform, ₦9,800 to school

## Testing Checklist

- [ ] Database migration applied
- [ ] Can access Settlement Setup page
- [ ] Banks dropdown loads
- [ ] Can verify bank account
- [ ] Can create subaccount
- [ ] Payment includes subaccount code
- [ ] Switch to live keys when ready

## Troubleshooting

**"Failed to create subaccount"**
→ Verify account first using the "Verify" button

**"Account verification failed"**
→ Check account number (must be 10 digits) and correct bank

**"Payments not splitting"**
→ Ensure school has `paystack_subaccount_code` in database

## Next Steps

1. Test the setup page with test data
2. Verify a real bank account (test mode)
3. When ready for production:
   - Complete Paystack business verification
   - Switch to live keys
   - Have schools add their real bank details
   - Monitor first few settlements

## Support

- **Paystack Docs**: https://paystack.com/docs/payments/split-payments/
- **Get Help**: support@paystack.com

---

**That's it!** Schools can now receive payments directly without you having to manually distribute funds. 🎉
