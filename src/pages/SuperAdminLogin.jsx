import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { superAdminLogin, superAdminVerifyMFA } from '../services/api';
import SEO from '../components/SEO';
import logo from '../assets/schoolhub.png';

export default function SuperAdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAttemptsRemaining(null);
    setLoading(true);

    try {
      // Get device token from localStorage if exists
      const deviceToken = localStorage.getItem('sa_device_token');
      const response = await superAdminLogin(formData.email, formData.password, deviceToken);

      // Check if MFA is required
      if (response.mfa_required) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      if (response.user) {
        // Store in localStorage and reload to trigger session check
        localStorage.setItem('userType', 'super_admin');
        localStorage.setItem('superAdminData', JSON.stringify(response.user));
        // Reload page to trigger App.jsx's checkSession()
        window.location.href = '/super-admin/dashboard';
      } else {
        setError(response.error || 'Login failed');

        // Show attempts remaining if provided
        if (response.attempts_remaining !== undefined) {
          setAttemptsRemaining(response.attempts_remaining);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await superAdminVerifyMFA(formData.email, mfaCode, rememberDevice);

      if (response.user) {
        // Store device token if remember device was checked
        if (response.device_token) {
          localStorage.setItem('sa_device_token', response.device_token);
        }

        // Store in localStorage and reload
        localStorage.setItem('userType', 'super_admin');
        localStorage.setItem('superAdminData', JSON.stringify(response.user));
        window.location.href = '/super-admin/dashboard';
      } else {
        setError(response.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error('MFA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Super Admin Login"
        description="System administrator login for Report Card Generator"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg p-2">
              <img src={logo} alt="SchoolHub Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Super Admin Portal
            </h2>
            <p className="mt-2 text-center text-sm text-primary-200">
              System Administrator Access Only
            </p>
          </div>

          <form className="mt-8 space-y-6 bg-white rounded-lg shadow-2xl p-8" onSubmit={mfaRequired ? handleMFASubmit : handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {attemptsRemaining !== null && attemptsRemaining <= 2 && !mfaRequired && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                <strong>Warning:</strong> {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining before account lockout.
              </div>
            )}

            {mfaRequired ? (
              // MFA Verification Form
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div>
                  <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="mfa-code"
                    name="mfa-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9-]*"
                    maxLength="9"
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Or use a backup code (format: XXXX-XXXX)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-device"
                    name="remember-device"
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-device" className="ml-2 block text-sm text-gray-700">
                    Trust this device for 30 days
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMfaRequired(false);
                      setMfaCode('');
                      setError('');
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    ← Back to login
                  </button>
                </div>
              </div>
            ) : (
              // Regular Login Form
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Signing in...' : 'Sign in to Admin Portal'}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            )}
          </form>

          <p className="mt-4 text-center text-xs text-primary-200">
            Unauthorized access is prohibited and will be logged
          </p>
        </div>
      </div>
    </>
  );
}
