import { AlertTriangle, CreditCard, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function SubscriptionBanner({ school }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Detect if this is a student or teacher portal
  const isStudentPortal = location.pathname.startsWith('/student');
  const isTeacherPortal = location.pathname.startsWith('/teacher');

  // Check if subscription has expired or trial has ended
  const hasAccess = school?.has_access !== false;
  const status = school?.subscription_status;
  const trialEndDate = school?.trial_end_date;
  const subscriptionEndDate = school?.subscription_end_date;

  // Don't show banner if user has access or dismissed it
  if (hasAccess || isDismissed) {
    return null;
  }

  const getBannerContent = () => {
    // Message for students and teachers when school subscription expired
    if (isStudentPortal || isTeacherPortal) {
      if (status === 'trial_expired') {
        return {
          bgColor: 'bg-orange-600',
          icon: AlertTriangle,
          title: 'School Trial Expired',
          message: 'Your school\'s free trial has expired. Please contact your school administrator to renew the subscription.',
          ctaText: null, // No button for students/teachers
          ctaClass: ''
        };
      }

      if (status === 'expired') {
        return {
          bgColor: 'bg-red-600',
          icon: AlertTriangle,
          title: 'School Subscription Expired',
          message: subscriptionEndDate
            ? `Your school's subscription expired on ${new Date(subscriptionEndDate).toLocaleDateString()}. Please contact your school administrator.`
            : 'Your school\'s subscription has expired. Please contact your school administrator.',
          ctaText: null, // No button for students/teachers
          ctaClass: ''
        };
      }

      return {
        bgColor: 'bg-orange-600',
        icon: CreditCard,
        title: 'Subscription Required',
        message: 'Your school needs an active subscription. Please contact your school administrator.',
        ctaText: null,
        ctaClass: ''
      };
    }

    // Message for school admins
    if (status === 'trial_expired') {
      return {
        bgColor: 'bg-orange-600',
        icon: AlertTriangle,
        title: 'Free Trial Expired',
        message: trialEndDate
          ? `Your 7-day free trial expired on ${new Date(trialEndDate).toLocaleDateString()}.`
          : 'Your free trial has expired.',
        ctaText: 'Subscribe Now',
        ctaClass: 'bg-white text-orange-600 hover:bg-orange-50'
      };
    }

    if (status === 'expired') {
      return {
        bgColor: 'bg-red-600',
        icon: AlertTriangle,
        title: 'Subscription Expired',
        message: subscriptionEndDate
          ? `Your subscription expired on ${new Date(subscriptionEndDate).toLocaleDateString()}.`
          : 'Your subscription has expired.',
        ctaText: 'Renew Subscription',
        ctaClass: 'bg-white text-red-600 hover:bg-red-50'
      };
    }

    return {
      bgColor: 'bg-orange-600',
      icon: CreditCard,
      title: 'Subscription Required',
      message: 'Subscribe to continue using all platform features.',
      ctaText: 'View Plans',
      ctaClass: 'bg-white text-orange-600 hover:bg-orange-50'
    };
  };

  const content = getBannerContent();
  const Icon = content.icon;

  return (
    <div className={`${content.bgColor} text-white shadow-lg print:hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold">{content.title}:</span>
              <span className="text-sm sm:text-base">{content.message}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {content.ctaText && (
              <button
                onClick={() => navigate('/dashboard/subscription')}
                className={`${content.ctaClass} px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap`}
              >
                <CreditCard className="w-4 h-4" />
                {content.ctaText}
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
