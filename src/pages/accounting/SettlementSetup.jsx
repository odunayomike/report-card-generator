import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/env';
import PaystackLogo from '../../components/PaystackLogo';

const SettlementSetup = () => {
  const bankDropdownRef = useRef(null);
  const [banks, setBanks] = useState([]);
  const [settlementInfo, setSettlementInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Bank search state
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: '',
    account_number: '',
    account_name: ''
  });

  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifyingSubaccount, setVerifyingSubaccount] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    fetchBanks();
    fetchSettlementInfo();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/get-banks`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Banks API response not OK:', response.status, response.statusText);
      }

      const data = await response.json();

      if (data.success) {
        setBanks(data.data);
      } else {
        console.error('Banks API error:', data.message || 'Failed to load banks');
        showNotification('error', data.message || 'Failed to load banks');
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      showNotification('error', 'Failed to load banks: ' + error.message);
    }
  };

  const fetchSettlementInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/get-settlement-info`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setSettlementInfo(data.data);

        // Pre-fill form if settlement account exists
        if (data.data.has_subaccount && data.data.bank_name) {
          // Find the bank in the banks list
          const bank = banks.find(b => b.name === data.data.bank_name);
          if (bank) {
            setSelectedBank(bank);
            setBankSearch(bank.name);
          }

          setFormData({
            bank_code: bank?.code || '',
            account_number: data.data.bank_account_number || '',
            account_name: data.data.bank_account_name || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settlement info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter banks based on search
  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    bank.code.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Handle bank selection
  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setBankSearch(bank.name);
    setFormData(prev => ({
      ...prev,
      bank_code: bank.code,
      account_name: '' // Reset account name when bank changes
    }));
    setShowBankDropdown(false);
  };

  const handleVerifyAccount = async () => {
    if (!formData.bank_code || !formData.account_number) {
      showNotification('error', 'Please select a bank and enter account number');
      return;
    }

    if (formData.account_number.length !== 10) {
      showNotification('error', 'Account number must be 10 digits');
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/verify-bank-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          account_number: formData.account_number,
          bank_code: formData.bank_code
        })
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          account_name: data.data.account_name
        }));
        showNotification('success', 'Account verified successfully');
      } else {
        showNotification('error', data.message || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      showNotification('error', 'Failed to verify account');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.account_name) {
      showNotification('error', 'Please verify your account first');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/create-subaccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          bank_name: selectedBank?.name || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', settlementInfo?.has_subaccount
          ? 'Settlement account updated successfully'
          : 'Settlement account created successfully');

        // Refresh settlement info
        await fetchSettlementInfo();

        // Close form and reset
        setShowForm(false);
        setSelectedBank(null);
        setBankSearch('');
        setFormData({ bank_code: '', account_number: '', account_name: '' });
      } else {
        showNotification('error', data.message || 'Failed to save settlement account');
      }
    } catch (error) {
      console.error('Error saving settlement account:', error);
      showNotification('error', 'Failed to save settlement account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/delete-subaccount`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const message = data.paystack_deactivated
          ? 'Settlement account removed and deactivated in Paystack'
          : 'Settlement account removed (Note: Paystack deactivation may have failed)';

        showNotification('success', message);
        setShowDeleteModal(false);

        // Refresh settlement info
        await fetchSettlementInfo();

        // Reset form
        setShowForm(false);
        setSelectedBank(null);
        setBankSearch('');
        setFormData({ bank_code: '', account_number: '', account_name: '' });
      } else {
        showNotification('error', data.message || 'Failed to remove settlement account');
      }
    } catch (error) {
      console.error('Error deleting settlement account:', error);
      showNotification('error', 'Failed to remove settlement account');
    } finally {
      setDeleting(false);
    }
  };

  const handleVerifySubaccount = async () => {
    setVerifyingSubaccount(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/verify-subaccount`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data.data);
        setShowVerifyModal(true);
        showNotification('success', 'Subaccount verified successfully');
      } else {
        showNotification('error', data.message || 'Failed to verify subaccount');
        setVerificationResult({ error: data.message, subaccount_code: data.subaccount_code });
        setShowVerifyModal(true);
      }
    } catch (error) {
      console.error('Error verifying subaccount:', error);
      showNotification('error', 'Failed to verify subaccount');
    } finally {
      setVerifyingSubaccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Paystack Security Badge */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <PaystackLogo className="w-24 h-auto" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Secured by Paystack
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                All payments are processed securely through Paystack's PCI-DSS compliant infrastructure. Your financial data is encrypted and protected.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-600 mb-2">Settlement Account Setup</h2>
            <p className="text-gray-600">
              Configure your bank account to receive fee payments directly
            </p>
          </div>

          {/* Update Account Button */}
          {settlementInfo?.has_subaccount && !showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                // Preload existing data
                if (settlementInfo?.bank_name) {
                  const bank = banks.find(b => b.name === settlementInfo.bank_name);
                  if (bank) {
                    setSelectedBank(bank);
                    setBankSearch(bank.name);
                    setFormData({
                      bank_code: bank.code,
                      account_number: settlementInfo.bank_account_number || '',
                      account_name: settlementInfo.bank_account_name || ''
                    });
                  }
                }
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Account
            </button>
          )}
        </div>

        {/* Settlement Account List */}
        {settlementInfo?.has_subaccount && !showForm ? (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Active Settlement Account</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Bank Name</span>
                    <p className="font-medium text-gray-900 mt-1">{settlementInfo.bank_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Account Number</span>
                    <p className="font-medium text-gray-900 mt-1">{settlementInfo.bank_account_number}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Account Name</span>
                    <p className="font-medium text-gray-900 mt-1">{settlementInfo.bank_account_name}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Verified & Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleVerifySubaccount}
                      disabled={verifyingSubaccount}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {verifyingSubaccount ? 'Verifying...' : 'Verify with Paystack'}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete Account
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        // Preload existing data
                        if (settlementInfo?.bank_name) {
                          const bank = banks.find(b => b.name === settlementInfo.bank_name);
                          if (bank) {
                            setSelectedBank(bank);
                            setBankSearch(bank.name);
                            setFormData({
                              bank_code: bank.code,
                              account_number: settlementInfo.bank_account_number || '',
                              account_name: settlementInfo.bank_account_name || ''
                            });
                          }
                        }
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Update Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Show form when no account exists or when Add/Update is clicked */}
        {(!settlementInfo?.has_subaccount || showForm) && (
          <>
            {/* Cancel button if updating */}
            {settlementInfo?.has_subaccount && showForm && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedBank(null);
                    setBankSearch('');
                    setFormData({ bank_code: '', account_number: '', account_name: '' });
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Settlement Account
                </button>
              </div>
            )}

            {/* Info Box */}
            <div className="mb-8 p-5 bg-primary-50 border-l-4 border-primary-500 rounded">
              <h3 className="font-semibold text-primary-900 mb-3">How it works:</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Parents pay school fees through the mobile app</li>
                <li>Your school receives the exact fee amount in your bank account within 1-2 business days</li>
                <li>You'll receive SMS/email notifications when funds are transferred to your account</li>
                <li>No Paystack account needed - just provide your bank details here</li>
              </ul>
            </div>

            {/* Setup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bank Selection - Searchable */}
          <div className="relative" ref={bankDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bank *
            </label>
            <div className="relative">
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => {
                  setBankSearch(e.target.value);
                  setShowBankDropdown(true);
                }}
                onFocus={() => setShowBankDropdown(true)}
                placeholder="Search for your bank..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={!selectedBank}
              />
              {selectedBank && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBank(null);
                      setBankSearch('');
                      setFormData(prev => ({ ...prev, bank_code: '', account_name: '' }));
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown */}
            {showBankDropdown && bankSearch && !selectedBank && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg max-h-60 overflow-y-auto">
                {filteredBanks.length > 0 ? (
                  filteredBanks.map(bank => (
                    <div
                      key={bank.code}
                      onClick={() => handleBankSelect(bank)}
                      className="px-4 py-2 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{bank.name}</div>
                      <div className="text-xs text-gray-500">Code: {bank.code}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No banks found matching "{bankSearch}"
                  </div>
                )}
              </div>
            )}

            {/* Selected Bank Display */}
            {selectedBank && (
              <div className="mt-2 p-3 bg-primary-50 border-l-4 border-primary-500 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-primary-900">{selectedBank.name}</div>
                    <div className="text-xs text-primary-600">Code: {selectedBank.code}</div>
                  </div>
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setFormData(prev => ({
                      ...prev,
                      account_number: value,
                      account_name: '' // Reset account name when number changes
                    }));
                  }
                }}
                placeholder="Enter 10-digit account number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={handleVerifyAccount}
                disabled={verifying || !formData.bank_code || formData.account_number.length !== 10}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Click "Verify" to confirm account details
            </p>
          </div>

          {/* Account Name (Auto-filled after verification) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              value={formData.account_name}
              readOnly
              placeholder="Account name will appear after verification"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitting || !formData.account_name}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting
                ? 'Saving...'
                : settlementInfo?.has_subaccount
                  ? 'Update Settlement Account'
                  : 'Create Settlement Account'}
            </button>
          </div>
        </form>
          </>
        )}
      </div>

      {/* Verification Result Modal */}
      {showVerifyModal && verificationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Paystack Subaccount Verification</h3>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {verificationResult.error ? (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-red-900">Verification Failed</h4>
                </div>
                <p className="text-sm text-red-700">{verificationResult.error}</p>
                {verificationResult.subaccount_code && (
                  <p className="text-xs text-red-600 mt-2">
                    Subaccount Code: {verificationResult.subaccount_code}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-green-900">Subaccount Active on Paystack</h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Subaccount Code</span>
                      <p className="font-mono text-sm text-gray-900 mt-1">{verificationResult.subaccount_code}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Business Name</span>
                      <p className="font-medium text-gray-900 mt-1">{verificationResult.business_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Account Number</span>
                      <p className="font-medium text-gray-900 mt-1">{verificationResult.account_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Settlement Bank</span>
                      <p className="font-medium text-gray-900 mt-1">{verificationResult.database_info?.bank_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Account Name</span>
                      <p className="font-medium text-gray-900 mt-1">{verificationResult.database_info?.bank_account_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${verificationResult.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {verificationResult.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Verification</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${verificationResult.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {verificationResult.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!verificationResult.is_verified && (
                    <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h5 className="font-semibold text-yellow-900 mb-1">Unverified Subaccount</h5>
                          <p className="text-sm text-yellow-800 mb-2">
                            Your subaccount is currently unverified. Don't worry - you can still receive payments and settlements!
                          </p>
                          <p className="text-sm text-yellow-800">
                            <strong>What this means:</strong> Unverified subaccounts can receive payments normally, but may have settlement limits. Verification is handled automatically by Paystack or may require business documents for large transaction volumes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Settlement Account</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to remove your settlement account?
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>The subaccount will be deactivated in Paystack</li>
                <li>You will no longer receive automatic payments</li>
                <li>You'll need to set up a new account to receive settlements</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementSetup;
