import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifySubscriptionPayment } from '../services/api';

const VerifyPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference provided');
      return;
    }

    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      const response = await verifySubscriptionPayment(reference);

      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Payment verified successfully!');
        setSubscriptionDetails(response.subscription);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('failed');
      setMessage('An error occurred while verifying your payment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {subscriptionDetails && (
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-2">Subscription Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-700">
                      {subscriptionDetails.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-semibold">
                      {new Date(subscriptionDetails.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-semibold">
                      {new Date(subscriptionDetails.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard in 3 seconds...
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard Now
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPayment;
