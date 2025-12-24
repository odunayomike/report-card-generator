import { Link, Routes, Route, Navigate } from 'react-router-dom';
import PaymentVerification from './PaymentVerification';
import BankAccountManagement from './BankAccountManagement';
import FeeManagement from './FeeManagement';
import ExpenseTracking from './ExpenseTracking';
import FinancialReports from './FinancialReports';
import SettlementSetup from './SettlementSetup';

const AccountingDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Default route - redirect to payment verification */}
        <Route index element={<Navigate to="payment-verification" replace />} />

        {/* Payment Verification Route */}
        <Route path="payment-verification" element={<PaymentVerification />} />

        {/* Bank Account Management Route */}
        <Route path="bank-accounts" element={<BankAccountManagement />} />

        {/* Fee Management Route */}
        <Route path="fee-management" element={<FeeManagement />} />

        {/* Settlement Setup Route */}
        <Route path="settlement-setup" element={<SettlementSetup />} />

        {/* Expense Tracking Route */}
        <Route path="expense-tracking" element={<ExpenseTracking />} />

        {/* Financial Reports Route */}
        <Route path="financial-reports" element={<FinancialReports />} />
      </Routes>
    </div>
  );
};

export default AccountingDashboard;
