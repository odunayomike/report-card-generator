import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, AlertCircle, Calendar, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' or 'yearly'
  const { toasts, removeToast, toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/subscription/get-status`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        console.log('Subscription API Response:', data); // Debug log
        // Map the backend response to the frontend structure
        const mappedData = {
          status: data.subscription?.status || 'inactive',
          start_date: data.current_subscription?.start_date || null,
          end_date: data.subscription?.end_date || null,
          days_remaining: data.subscription?.days_remaining || 0,
          is_active: data.subscription?.is_active || false,
          plan_name: data.current_subscription?.plan_name || 'SchoolHub Subscription',
          amount: data.current_subscription?.amount || 5000,
          payment_history: data.payment_history || []
        };
        console.log('Mapped Subscription Data:', mappedData); // Debug log
        setSubscriptionData(mappedData);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setProcessingPayment(true);
      const response = await fetch(`${API_BASE_URL}/subscription/initialize`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_type: selectedPlan
        })
      });

      const data = await response.json();

      if (data.success && data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        toast.error('Error initializing payment: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isActive = subscriptionData?.status === 'active';
  const isTrialing = subscriptionData?.status === 'trialing';
  const daysRemaining = subscriptionData?.days_remaining || getDaysRemaining(subscriptionData?.end_date);

  // Determine current plan type
  const currentPlanType = subscriptionData?.plan_name?.includes('Yearly') ? 'yearly' : 'monthly';
  const canUpgrade = isActive && currentPlanType === 'monthly';
  const canDowngrade = isActive && currentPlanType === 'yearly';

  const handleChangePlan = async (newPlanType) => {
    try {
      setProcessingPayment(true);
      const response = await fetch(`${API_BASE_URL}/subscription/change-plan`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_plan_type: newPlanType
        })
      });

      const data = await response.json();

      if (data.success && data.authorization_url) {
        // Show confirmation with prorated amount
        setConfirmDialog({
          isOpen: true,
          title: 'Confirm Plan Change',
          message: data.message + '\n\nProceed to payment?',
          confirmText: 'Proceed to Payment',
          type: 'info',
          onConfirm: () => {
            window.location.href = data.authorization_url;
          }
        });
        setProcessingPayment(false);
      } else if (data.success && data.scheduled_change) {
        // Downgrade scheduled with credit
        const infoMsg = data.info?.message || 'Plan change scheduled successfully!';
        toast.success(infoMsg + '\n\n' + (data.info?.next_charge || ''), 8000);
        loadSubscriptionStatus();
        setProcessingPayment(false);
      } else if (data.success) {
        toast.success('Plan changed successfully!');
        loadSubscriptionStatus();
        setProcessingPayment(false);
      } else {
        toast.error('Error: ' + (data.message || 'Unknown error'));
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Plan change error:', error);
      toast.error('Failed to change plan. Please try again.');
      setProcessingPayment(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your SchoolHub subscription and billing</p>
        </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div
          className="px-6 py-4"
          style={{background: 'linear-gradient(to right, #1791C8, #667eea)'}}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Current Plan</h3>
              <p className="text-white/90 text-sm">
                {isActive ? 'Active Subscription' : isTrialing ? 'Free Trial' : 'No Active Subscription'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive ? 'bg-green-500 text-white' :
              isTrialing ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {subscriptionData?.status?.toUpperCase() || 'INACTIVE'}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {subscriptionData?.start_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(subscriptionData.start_date)}
                  </p>
                </div>
              </div>
            )}

            {subscriptionData?.end_date && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">
                    {isTrialing ? 'Trial Ends' : 'Next Payment Due'}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(subscriptionData.end_date)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(isActive || isTrialing) && daysRemaining > 0 && (
            <div className={`p-4 rounded-lg ${
              daysRemaining <= 7 ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  daysRemaining <= 7 ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`text-sm font-semibold ${
                    daysRemaining <= 7 ? 'text-yellow-900' : 'text-blue-900'
                  }`}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                  </p>
                  <p className={`text-xs mt-1 ${
                    daysRemaining <= 7 ? 'text-yellow-700' : 'text-blue-700'
                  }`}>
                    {isTrialing
                      ? 'Your free trial will expire soon. Subscribe to continue using SchoolHub.'
                      : 'Your subscription will renew automatically.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Selection */}
      {!isActive && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Choose Your Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Monthly Plan */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">₦5,000</div>
                  <div className="text-sm text-gray-600 mt-1">per month</div>
                  <div className="mt-3 text-xs text-gray-500">Billed monthly</div>
                  {selectedPlan === 'monthly' && (
                    <div className="mt-3">
                      <Check className="w-5 h-5 text-blue-600 mx-auto" />
                    </div>
                  )}
                </div>
              </button>

              {/* Yearly Plan */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`p-6 rounded-lg border-2 transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Save ₦10,000
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">₦50,000</div>
                  <div className="text-sm text-gray-600 mt-1">per year</div>
                  <div className="mt-3 text-xs text-gray-500">₦4,167/month when billed yearly</div>
                  {selectedPlan === 'yearly' && (
                    <div className="mt-3">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plan Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
              </h3>
              <p className="text-sm text-gray-600">All features included</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {selectedPlan === 'yearly' ? '₦50,000' : '₦5,000'}
              </div>
              <div className="text-sm text-gray-600">
                {selectedPlan === 'yearly' ? 'per year' : 'per month'}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">What's included:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Unlimited Report Cards',
                'Student Management',
                'Teacher Management',
                'Attendance Tracking',
                'Custom Branding',
                'School Profile Management',
                'Analytics Dashboard',
                'PDF Export',
                'Email Support',
                'Regular Updates'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {!isActive && (
            <button
              onClick={handleSubscribe}
              disabled={processingPayment}
              className="w-full px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: '#1791C8'}}
              onMouseEnter={(e) => !processingPayment && (e.target.style.backgroundColor = '#1478A6')}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1791C8'}
            >
              <CreditCard className="w-5 h-5" />
              {processingPayment ? 'Processing...' : isTrialing ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
            </button>
          )}

          {isActive && (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      Active {currentPlanType === 'yearly' ? 'Yearly' : 'Monthly'} Subscription
                    </p>
                    <p className="text-xs text-green-700">Your subscription will renew automatically</p>
                  </div>
                </div>
              </div>

              {/* Upgrade/Downgrade Options */}
              {(canUpgrade || canDowngrade) && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Change Plan</h4>
                  {canUpgrade && (
                    <button
                      onClick={() => handleChangePlan('yearly')}
                      disabled={processingPayment}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                    >
                      <div className="text-left">
                        <div className="font-bold">Upgrade to Yearly Plan</div>
                        <div className="text-xs text-green-100">Save ₦10,000 per year</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₦50,000/year</div>
                        <div className="text-xs text-green-100">₦4,167/month</div>
                      </div>
                    </button>
                  )}
                  {canDowngrade && (
                    <button
                      onClick={() => handleChangePlan('monthly')}
                      disabled={processingPayment}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-left">
                        <div className="font-bold">Switch to Monthly Plan</div>
                        <div className="text-xs text-gray-200">More flexibility, pay monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₦5,000/month</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Paystack. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Need Help?</h4>
        <p className="text-xs text-gray-600">
          If you have any questions about your subscription or billing, please contact our support team.
        </p>
      </div>
      </div>
    </>
  );
}
