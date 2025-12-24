import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/env';

const BankAccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
    account_type: 'current',
    is_primary: false
  });

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounting/admin/get-bank-accounts`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (data.success) {
        setAccounts(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_number: '',
      account_name: '',
      account_type: 'current',
      is_primary: false
    });
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounting/admin/create-bank-account`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Bank account added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchBankAccounts();
      } else {
        alert(data.message || 'Failed to add bank account');
      }
    } catch (err) {
      alert('Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounting/admin/update-bank-account`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...formData, id: selectedAccount.id })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Bank account updated successfully!');
        setShowEditModal(false);
        setSelectedAccount(null);
        resetForm();
        fetchBankAccounts();
      } else {
        alert(data.message || 'Failed to update bank account');
      }
    } catch (err) {
      alert('Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this bank account? If it has payment history, it will be deactivated instead.')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounting/admin/delete-bank-account`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: accountId })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchBankAccounts();
      } else {
        alert(data.message || 'Failed to delete bank account');
      }
    } catch (err) {
      alert('Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (account) => {
    setSelectedAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_name: account.account_name,
      account_type: account.account_type,
      is_primary: account.is_primary
    });
    setShowEditModal(true);
  };

  const toggleAccountStatus = async (account) => {
    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/accounting/admin/update-bank-account`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: account.id,
            is_active: !account.is_active
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchBankAccounts();
      } else {
        alert(data.message || 'Failed to update account status');
      }
    } catch (err) {
      alert('Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Account Management</h1>
          <p className="text-gray-600 mt-1">Manage school bank accounts for parent payments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bank Account
        </button>
      </div>

      {/* Bank Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchBankAccounts}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bank accounts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first bank account.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Add Bank Account
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{account.bank_name}</div>
                        {account.is_primary && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.account_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.account_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-600">
                        {account.account_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAccountStatus(account)}
                        disabled={processing}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } disabled:opacity-50`}
                      >
                        {account.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(account)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          disabled={processing}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => {
          showAddModal ? setShowAddModal(false) : setShowEditModal(false);
          resetForm();
        }}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showAddModal ? 'Add Bank Account' : 'Edit Bank Account'}
              </h3>
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddAccount : handleUpdateAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., First Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    name="account_name"
                    value={formData.account_name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., ABC School"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    name="account_type"
                    value={formData.account_type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="domiciliary">Domiciliary</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_primary"
                    checked={formData.is_primary}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Set as primary account
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {processing ? 'Saving...' : showAddModal ? 'Add Account' : 'Update Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountManagement;
