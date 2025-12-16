import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertTriangle, Calendar } from 'lucide-react';

export default function SubscriptionRequired({ school }) {
  const navigate = useNavigate();
  const status = school?.subscription_status;
  const endDate = school?.subscription_end_date;

  const getStatusInfo = () => {
    if (status === 'trial_expired') {
      const trialEndDate = school?.trial_end_date;
      return {
        icon: AlertTriangle,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Free Trial Expired',
        message: trialEndDate
          ? `Your 7-day free trial expired on ${new Date(trialEndDate).toLocaleDateString()}. Subscribe now to continue enjoying all features!`
          : 'Your free trial has expired. Subscribe now to continue using the platform.'
      };
    }

    if (status === 'expired') {
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Subscription Expired',
        message: endDate
          ? `Your subscription expired on ${new Date(endDate).toLocaleDateString()}. Please renew to continue using the platform.`
          : 'Your subscription has expired. Please subscribe to continue using the platform.'
      };
    }

    return {
      icon: CreditCard,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      title: 'Subscription Required',
      message: 'Please subscribe to access all platform features and manage your school.'
    };
  };

  const info = getStatusInfo();
  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className={`${info.bgColor} ${info.borderColor} border-2 rounded-lg p-8 shadow-lg`}>
          <div className="flex flex-col items-center text-center">
            <div className={`${info.iconColor} mb-4`}>
              <Icon className="w-20 h-20" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {info.title}
            </h1>

            <p className="text-gray-700 text-lg mb-6 max-w-md">
              {info.message}
            </p>

            {(endDate || school?.trial_end_date) && (
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  {status === 'trial_expired'
                    ? `Trial ended: ${new Date(school.trial_end_date).toLocaleDateString()}`
                    : status === 'expired'
                    ? `Expired: ${new Date(endDate).toLocaleDateString()}`
                    : `Valid until: ${new Date(endDate).toLocaleDateString()}`
                  }
                </span>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => navigate('/dashboard/subscription')}
                className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {status === 'trial_expired' ? 'Subscribe Now' : status === 'expired' ? 'Renew Subscription' : 'Subscribe Now'}
              </button>

              {(status === 'expired' || status === 'trial_expired') && (
                <button
                  onClick={() => navigate('/dashboard/subscription')}
                  className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-300"
                >
                  View Plans
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-300 w-full">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                What you'll get with a subscription:
              </h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Create and manage unlimited student report cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Add and manage teachers with role-based access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Track attendance and generate reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Customize grading scales and school settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Generate and download PDF report cards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            School: <span className="font-semibold">{school?.school_name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
