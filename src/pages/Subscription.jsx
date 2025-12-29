import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, AlertCircle, Calendar, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import CurrencySelector from '../components/CurrencySelector';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Subscription() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly', 'term', or 'yearly'
  const [plans, setPlans] = useState([]);
  const { toasts, removeToast, toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([loadSubscriptionStatus(), loadPlans()]);
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/get-plans`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/get-status`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
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
        setSubscriptionData(mappedData);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      setProcessingPayment(true);
      const response = await fetch(`${API_BASE_URL}/subscription/initialize-payment`, {
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
  const currentPlanType = subscriptionData?.plan_name?.toLowerCase().includes('yearly') ? 'yearly'
    : subscriptionData?.plan_name?.toLowerCase().includes('term') ? 'term'
    : 'monthly';
  const canUpgrade = isActive && (currentPlanType === 'monthly' || currentPlanType === 'term');
  const canChangePlan = isActive;

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

      <div className="max-w-6xl mx-auto px-2">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{color: '#1791C8'}}>Subscription Management</h2>
            <p className="text-xs text-gray-600">Manage your SchoolHub subscription</p>
          </div>
          <CurrencySelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg overflow-hidden" style={{borderColor: '#1791C8'}}>
              <div className="px-3 py-2" style={{backgroundColor: '#1791C8'}}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">Current Plan</h3>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-green-500 text-white' :
                    isTrialing ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {subscriptionData?.status?.toUpperCase() || 'INACTIVE'}
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2">
                {subscriptionData?.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" style={{color: '#1791C8'}} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Start</p>
                      <p className="text-xs font-semibold">{formatDate(subscriptionData.start_date)}</p>
                    </div>
                  </div>
                )}

                {subscriptionData?.end_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" style={{color: '#1791C8'}} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">{isTrialing ? 'Trial Ends' : 'Next Payment'}</p>
                      <p className="text-xs font-semibold">{formatDate(subscriptionData.end_date)}</p>
                    </div>
                  </div>
                )}

                {(isActive || isTrialing) && daysRemaining > 0 && (
                  <div className={`p-2 rounded border text-center ${daysRemaining <= 7 ? 'bg-yellow-50 border-yellow-200' : ''}`} style={daysRemaining > 7 ? {borderColor: '#1791C8', backgroundColor: '#E6F4F9'} : {}}>
                    <p className={`text-xs font-bold ${daysRemaining <= 7 ? 'text-yellow-900' : ''}`} style={daysRemaining > 7 ? {color: '#1791C8'} : {}}>
                      {daysRemaining} days left
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white border rounded-lg overflow-hidden" style={{borderColor: '#1791C8'}}>
              {!isActive && (
                <div className="border-b p-3" style={{borderColor: '#1791C8'}}>
                  <h3 className="text-sm font-bold mb-2" style={{color: '#1791C8'}}>Choose Your Plan</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {plans.map((plan, index) => {
                      const planKey = plan.plan_name.toLowerCase().includes('yearly') ? 'yearly'
                        : plan.plan_name.toLowerCase().includes('term') ? 'term'
                        : 'monthly';
                      const isPopular = planKey === 'term';
                      const perMonth = planKey === 'term' ? Math.round(plan.amount / 4)
                        : planKey === 'yearly' ? Math.round(plan.amount / 12)
                        : null;

                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlan(planKey)}
                          className={`p-2 rounded border transition-all text-center ${
                            selectedPlan === planKey ? '' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={selectedPlan === planKey ? {borderColor: '#1791C8', backgroundColor: '#E6F4F9'} : {}}
                        >
                          {isPopular && <span className="text-xs font-bold block mb-1" style={{color: '#1791C8'}}>POPULAR</span>}
                          <div className="text-xs font-semibold text-gray-700">{plan.plan_name}</div>
                          <div className="text-lg font-bold text-gray-900">{formatPrice(plan.amount)}</div>
                          {perMonth && (
                            <div className="text-xs text-gray-500">{formatPrice(perMonth)}/mo</div>
                          )}
                          {selectedPlan === planKey && (
                            <Check className="w-4 h-4 mx-auto mt-1" style={{color: '#1791C8'}} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold" style={{color: '#1791C8'}}>
                      {plans.find(p => {
                        const key = p.plan_name.toLowerCase().includes('yearly') ? 'yearly'
                          : p.plan_name.toLowerCase().includes('term') ? 'term'
                          : 'monthly';
                        return key === selectedPlan;
                      })?.plan_name || 'Selected Plan'}
                    </h3>
                    <p className="text-xs text-gray-600">All features included</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{color: '#1791C8'}}>
                      {formatPrice(plans.find(p => {
                        const key = p.plan_name.toLowerCase().includes('yearly') ? 'yearly'
                          : p.plan_name.toLowerCase().includes('term') ? 'term'
                          : 'monthly';
                        return key === selectedPlan;
                      })?.amount || 0)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {selectedPlan === 'yearly' ? 'per year' : selectedPlan === 'term' ? 'per term' : 'per month'}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-2 mb-3" style={{borderColor: '#1791C8'}}>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {[
                      'Unlimited Report Cards',
                      'Student Management',
                      'Teacher Management',
                      'Attendance Tracking',
                      'Custom Branding',
                      'Analytics Dashboard',
                      'PDF Export',
                      'Email Support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Check className="w-3 h-3 flex-shrink-0" style={{color: '#1791C8'}} />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isActive && (
                  <button
                    onClick={handleSubscribe}
                    disabled={processingPayment}
                    className="w-full px-4 py-2 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{backgroundColor: '#1791C8'}}
                  >
                    <CreditCard className="w-4 h-4" />
                    {processingPayment ? 'Processing...' : isTrialing ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
                  </button>
                )}

                {isActive && (
                  <div>
                    <div className="border rounded p-2 mb-2" style={{borderColor: '#1791C8', backgroundColor: '#E6F4F9'}}>
                      <p className="text-xs font-semibold" style={{color: '#1791C8'}}>
                        Active {currentPlanType === 'yearly' ? 'Yearly' : currentPlanType === 'term' ? 'Per Term' : 'Monthly'} Subscription
                      </p>
                    </div>

                    {canChangePlan && (
                      <div className="space-y-2">
                        {plans.filter(plan => {
                          const planKey = plan.plan_name.toLowerCase().includes('yearly') ? 'yearly'
                            : plan.plan_name.toLowerCase().includes('term') ? 'term'
                            : 'monthly';
                          return planKey !== currentPlanType;
                        }).map((plan) => {
                          const planKey = plan.plan_name.toLowerCase().includes('yearly') ? 'yearly'
                            : plan.plan_name.toLowerCase().includes('term') ? 'term'
                            : 'monthly';
                          const isUpgrade = (currentPlanType === 'monthly' && (planKey === 'term' || planKey === 'yearly'))
                            || (currentPlanType === 'term' && planKey === 'yearly');

                          return (
                            <button
                              key={plan.id}
                              onClick={() => handleChangePlan(planKey)}
                              disabled={processingPayment}
                              className="w-full px-3 py-2 text-white rounded text-sm font-semibold flex items-center justify-between disabled:opacity-50 transition-opacity"
                              style={{backgroundColor: isUpgrade ? '#1791C8' : '#6b7280'}}
                            >
                              <span>{isUpgrade ? 'Upgrade' : 'Switch'} to {plan.plan_name}</span>
                              <span>{formatPrice(plan.amount)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-2">
                  Secure payment by Paystack • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
