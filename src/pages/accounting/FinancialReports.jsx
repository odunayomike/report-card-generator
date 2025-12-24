import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/env';

const FinancialReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st
    end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], // Dec 31st
    session: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
  });

  useEffect(() => {
    fetchFinancialReport();
  }, [filters]);

  const fetchFinancialReport = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        start_date: filters.start_date,
        end_date: filters.end_date,
        session: filters.session
      });

      const response = await fetch(
        `${API_BASE_URL}/accounting/admin/get-financial-report?${params}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to load financial report');
      }
    } catch (err) {
      console.error('Error fetching financial report:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      salaries: 'bg-blue-100 text-blue-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      supplies: 'bg-green-100 text-green-800',
      maintenance: 'bg-red-100 text-red-800',
      transport: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      marketing: 'bg-pink-100 text-pink-800',
      equipment: 'bg-indigo-100 text-indigo-800',
      rent: 'bg-gray-100 text-gray-800',
      other: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-1">Comprehensive financial overview and analytics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session
            </label>
            <input
              type="text"
              value={filters.session}
              onChange={(e) => setFilters({ ...filters, session: e.target.value })}
              placeholder="2024/2025"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(reportData.summary.total_income)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(reportData.summary.total_expenses)}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold mt-1 ${reportData.summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData.summary.net_income)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${reportData.summary.net_income >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <svg className={`w-6 h-6 ${reportData.summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Fees</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {formatCurrency(reportData.summary.total_outstanding)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reportData.summary.students_with_balance} students
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Income & Payment Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Income Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Total Payments</span>
                  <span className="font-semibold">{reportData.income.total_payments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm text-gray-600">Verified Amount</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(reportData.income.verified_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="text-sm text-gray-600">Pending Amount</span>
                  <span className="font-semibold text-yellow-600">
                    {formatCurrency(reportData.income.pending_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              {reportData.payment_methods.length > 0 ? (
                <div className="space-y-3">
                  {reportData.payment_methods.map((method, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {method.method.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">({method.count} payments)</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(method.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No payment methods data</p>
              )}
            </div>
          </div>

          {/* Expense Breakdown by Category */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown by Category</h3>
            {reportData.expenses.by_category.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.expenses.by_category.map((category, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(category.category)}`}>
                        {category.category}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(category.total)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No expense data for this period</p>
            )}
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
            {reportData.monthly_breakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Income
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expenses
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.monthly_breakdown.map((month, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatMonth(month.month)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          {formatCurrency(month.income)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="font-bold">
                      <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                      <td className="px-6 py-4 text-sm text-right text-green-600">
                        {formatCurrency(reportData.summary.total_income)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-red-600">
                        {formatCurrency(reportData.summary.total_expenses)}
                      </td>
                      <td className={`px-6 py-4 text-sm text-right ${reportData.summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(reportData.summary.net_income)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No monthly data for this period</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReports;
