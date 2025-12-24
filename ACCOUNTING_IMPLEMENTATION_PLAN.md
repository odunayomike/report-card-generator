# School Accounting & Fee Management System
## Implementation Plan

---

## Overview

A comprehensive accounting system for schools to manage:
- Student fees (tuition, books, transport, etc.)
- Fee payments and receipts
- Expenses and income tracking
- Financial reporting and analytics
- Parent fee portal

---

## Phase 1: Database Setup ✅

**File Created:** `/backend/migrations/accounting_schema.sql`

### Tables Created:
1. ✅ `fee_categories` - Types of fees (Tuition, Books, Transport, etc.)
2. ✅ `fee_structure` - Fee amounts per class/session/term
3. ✅ `student_fees` - Fees assigned to individual students
4. ✅ `fee_payments` - Payment records with receipts
5. ✅ `expense_categories` - Types of expenses (Salaries, Utilities, etc.)
6. ✅ `expenses` - School expenditure tracking
7. ✅ `other_income` - Non-fee revenue
8. ✅ `fee_waivers` - Scholarships and discounts
9. ✅ `payment_reminders` - Track payment reminder history

### Next Action:
Run the migration:
```sql
mysql -u your_user -p your_database < backend/migrations/accounting_schema.sql
```

---

## Phase 2: Backend API Development

### 2.1 Fee Management APIs

**Create these files:**

#### `/backend/routes/accounting/fee-categories/`
- `create.php` - Create new fee category (POST)
- `get-all.php` - List all fee categories (GET)
- `update.php` - Update fee category (PUT)
- `delete.php` - Delete fee category (DELETE)

#### `/backend/routes/accounting/fee-structure/`
- `create.php` - Create fee structure for class/term (POST)
- `get-all.php` - List fee structures with filters (GET)
- `get-by-class.php` - Get fees for specific class (GET)
- `update.php` - Update fee structure (PUT)
- `delete.php` - Delete fee structure (DELETE)

#### `/backend/routes/accounting/student-fees/`
- `assign-fees.php` - Assign fees to student(s) (POST)
- `get-student-fees.php` - Get all fees for a student (GET)
- `get-outstanding.php` - Get students with outstanding fees (GET)
- `update-status.php` - Update fee status (PUT)
- `bulk-assign.php` - Assign fees to multiple students at once (POST)

### 2.2 Payment Processing APIs

#### `/backend/routes/accounting/payments/`
- `record-payment.php` - Record a fee payment (POST)
- `get-payment-history.php` - Get payment history for student (GET)
- `generate-receipt.php` - Generate PDF receipt (GET)
- `verify-payment.php` - Verify online payment (POST)
- `get-all-payments.php` - Get all payments with filters (GET)
- `refund-payment.php` - Process refund (POST)

### 2.3 Expense Management APIs

#### `/backend/routes/accounting/expenses/`
- `create.php` - Record new expense (POST)
- `get-all.php` - List expenses with filters (GET)
- `update.php` - Update expense (PUT)
- `delete.php` - Delete expense (DELETE)
- `get-by-category.php` - Get expenses by category (GET)

#### `/backend/routes/accounting/expense-categories/`
- `create.php` - Create expense category (POST)
- `get-all.php` - List expense categories (GET)
- `update.php` - Update category (PUT)
- `delete.php` - Delete category (DELETE)

### 2.4 Reporting & Analytics APIs

#### `/backend/routes/accounting/reports/`
- `revenue-summary.php` - Get revenue summary (GET)
  - Total collected, outstanding, by category
  - Date range filters

- `expense-summary.php` - Get expense summary (GET)
  - Total expenses by category
  - Date range filters

- `profit-loss.php` - Profit & Loss statement (GET)
  - Income vs Expenses
  - Date range filters

- `defaulters-list.php` - List of students with overdue fees (GET)

- `collection-report.php` - Daily/Weekly/Monthly collections (GET)
  - Breakdown by payment method
  - Staff-wise collection

- `class-wise-revenue.php` - Revenue breakdown by class (GET)

- `payment-trends.php` - Payment trends over time (GET)

### 2.5 Parent Portal APIs

#### `/backend/routes/accounting/parent/`
- `get-fees.php` - Get child's fee details (GET)
- `get-payment-history.php` - Get payment history (GET)
- `initialize-payment.php` - Start online payment (POST)
- `download-receipt.php` - Download receipt PDF (GET)

---

## Phase 3: Frontend Development

### 3.1 School Admin Dashboard Pages

Create these React components:

#### `/src/pages/accounting/`

**1. `AccountingDashboard.jsx`** - Main overview
   - Revenue vs Expense chart
   - Outstanding fees summary
   - Recent payments
   - Quick stats cards
   - Defaulters count
   - Monthly trends

**2. `FeeManagement.jsx`** - Fee structure setup
   - Create/Edit fee categories
   - Set up fee structure by class
   - Assign fees to students
   - Bulk fee assignment
   - Fee templates

**3. `PaymentRecording.jsx`** - Record payments
   - Search student
   - View outstanding fees
   - Record payment form
   - Generate receipt
   - Payment method selection
   - Quick payment entry

**4. `PaymentHistory.jsx`** - View all payments
   - Searchable payment list
   - Filter by date, class, payment method
   - Export to Excel/PDF
   - Print receipts

**5. `OutstandingFees.jsx`** - Defaulters management
   - List students with outstanding fees
   - Filter by class, amount, overdue days
   - Send payment reminders
   - Export defaulters list

**6. `ExpenseManagement.jsx`** - Track expenses
   - Record new expense
   - List all expenses
   - Filter by category, date
   - Expense analytics

**7. `FinancialReports.jsx`** - Comprehensive reports
   - Revenue summary
   - Expense summary
   - Profit & Loss statement
   - Collection reports (daily, weekly, monthly)
   - Class-wise revenue
   - Payment trends chart
   - Export functionality

**8. `StudentLedger.jsx`** - Individual student account
   - Fee history
   - Payment history
   - Balance overview
   - Download statement

### 3.2 Parent Portal Pages

#### `/src/pages/parent/accounting/`

**1. `FeeOverview.jsx`**
   - Outstanding fees
   - Payment history
   - Download receipts
   - Pay online button

**2. `PaymentHistory.jsx`**
   - List of all payments
   - Download receipts
   - Payment details

---

## Phase 4: Key Features Implementation

### 4.1 Receipt Generation
- PDF receipt with school logo
- Receipt number (auto-generated)
- Payment details
- Outstanding balance
- Download/Print functionality

### 4.2 Online Payment Integration
- Paystack integration (already have config)
- Payment verification
- Auto-update student fees
- Email receipt to parent

### 4.3 Bulk Operations
- Assign fees to entire class
- Generate fee structure for new session
- Bulk payment import (CSV)
- Mass payment reminders

### 4.4 Notifications
- Payment reminder emails to parents
- Overdue fee notifications
- Payment confirmation emails
- Low balance alerts for school

### 4.5 Permissions & Access Control
- Accountant role (view all, record payments)
- Teacher role (view only)
- Admin role (full access)
- Parent role (view own child only)

---

## Phase 5: Navigation Integration

### Update Dashboard Layout

Add to `/src/components/DashboardLayout.jsx`:

```jsx
{/* Accounting Menu */}
<div>
  <button onClick={() => setShowAccountingSubmenu(!showAccountingSubmenu)}>
    <svg>💰</svg>
    Accounting
  </button>

  {showAccountingSubmenu && (
    <div>
      <NavLink to="/dashboard/accounting">Dashboard</NavLink>
      <NavLink to="/dashboard/accounting/fees">Fee Management</NavLink>
      <NavLink to="/dashboard/accounting/payments">Record Payment</NavLink>
      <NavLink to="/dashboard/accounting/outstanding">Outstanding Fees</NavLink>
      <NavLink to="/dashboard/accounting/expenses">Expenses</NavLink>
      <NavLink to="/dashboard/accounting/reports">Financial Reports</NavLink>
    </div>
  )}
</div>
```

---

## Phase 6: Testing & Deployment

### 6.1 Testing Checklist
- [ ] Create fee categories
- [ ] Set up fee structure
- [ ] Assign fees to students
- [ ] Record payments
- [ ] Generate receipts
- [ ] View reports
- [ ] Online payment flow
- [ ] Parent portal access
- [ ] Export functionality
- [ ] Permission controls

### 6.2 Sample Data
Create sample data for:
- Fee categories
- Fee structures
- Student fees
- Payments
- Expenses

---

## Technology Stack

### Backend
- PHP 7.4+
- MySQL/MariaDB
- Paystack API (payments)
- FPDF/TCPDF (receipt generation)

### Frontend
- React 18+
- Recharts (for charts/graphs)
- React Router
- Tailwind CSS
- Export libraries (xlsx, jspdf)

---

## Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Database Setup | 1 day | ✅ Ready |
| 2. Backend APIs | 5-7 days | Pending |
| 3. Frontend Pages | 7-10 days | Pending |
| 4. Features & Integration | 3-5 days | Pending |
| 5. Testing & Refinement | 3-4 days | Pending |
| **Total** | **3-4 weeks** | |

---

## Quick Start Guide

### Step 1: Run Database Migration
```bash
mysql -u root -p school_db < backend/migrations/accounting_schema.sql
```

### Step 2: Start with Core Features
Priority order:
1. Fee categories & structure setup
2. Student fee assignment
3. Payment recording
4. Receipt generation
5. Basic reports
6. Parent portal
7. Advanced features

### Step 3: Add Routes to `backend/index.php`
```php
// Accounting routes
case '/accounting/fee-categories':
    require __DIR__ . '/routes/accounting/fee-categories/get-all.php';
    break;
// ... add all other routes
```

---

## Additional Considerations

### Currency Support
- Already have CurrencyContext (₦, $, £, €)
- All amounts stored in DECIMAL(10,2)
- Display with appropriate currency symbol

### Multi-Session Support
- Track fees by session and term
- Session rollover functionality
- Historical data preservation

### Security
- Authentication required for all endpoints
- Role-based access control
- Audit trail for all transactions
- Input validation and sanitization

### Backup & Recovery
- Regular database backups
- Transaction logs
- Data export capabilities

---

## Questions to Consider

Before starting implementation:

1. **Payment Methods**: Which payment methods do you want to support?
   - Cash, Bank Transfer, Card, Cheque, Mobile Money?

2. **Fee Structure**: How complex are your fee structures?
   - Same for all classes or different per class?
   - Installment payments?
   - Early payment discounts?

3. **Receipt Numbering**: What format?
   - Example: RCT/2024/0001

4. **Reporting Period**: What reports are most important?
   - Daily collections?
   - Monthly revenue?
   - Class-wise analysis?

5. **Online Payments**: Should parents pay online?
   - Paystack integration?
   - Payment confirmation workflow?

6. **Notifications**: Automated reminders?
   - Email/SMS for overdue payments?
   - Payment confirmations?

---

## Next Steps

**Choose your starting point:**

1. **Quick Start** - Build core fee management only (1-2 weeks)
   - Fee setup
   - Payment recording
   - Basic reports

2. **Full Implementation** - Complete accounting system (3-4 weeks)
   - All features as planned
   - Parent portal
   - Advanced reports
   - Online payments

**Let me know which approach you prefer and I'll start building!**
