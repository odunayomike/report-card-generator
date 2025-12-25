import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, Mail, Lock, Phone, MapPin, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import schoolLogo from '../assets/schoolhub.png';
import { API_BASE_URL } from '../config/env';

export default function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    school_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (data.success) {
        onRegister(data.school);
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={schoolLogo}
                alt="SchoolHub Logo"
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold" style={{color: '#1791C8'}}>SchoolHub</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="max-w-xl w-full">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your School Account</h1>
              <p className="text-base text-gray-600">Start your 7-day free trial. No credit card required.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs">!</span>
                  </div>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* School Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <School className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="school_name"
                        value={formData.school_name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1791C8] focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="e.g., Green Valley Secondary School"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1791C8] focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="admin@greenvalley.edu"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1791C8] focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="Min. 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1791C8] focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="Re-enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1791C8] focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="08012345678"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      School Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1791C8] focus:border-transparent text-gray-900 placeholder-gray-400"
                        placeholder="Lagos, Nigeria"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-base text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg mt-4"
                  style={{backgroundColor: '#1791C8'}}
                >
                  {loading ? 'Creating Your Account...' : 'Create Account'}
                </button>

                <p className="text-xs text-gray-500 text-center pt-2">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms-of-service" className="text-[#1791C8] hover:underline">Terms</Link>
                  {' '}&{' '}
                  <Link to="/privacy-policy" className="text-[#1791C8] hover:underline">Privacy Policy</Link>
                </p>
              </form>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[#1791C8] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#1791C8] to-[#0d6eaa] p-8 items-center overflow-y-auto">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-5">Why Schools Love SchoolHub</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">7-Day Free Trial</h3>
                  <p className="text-blue-100 text-xs">Start using all features immediately. No credit card needed.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">Unlimited Students & Teachers</h3>
                  <p className="text-blue-100 text-xs">Add as many students and staff as you need at no extra cost.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">Secure Cloud Storage</h3>
                  <p className="text-blue-100 text-xs">Your data is safe on Google Cloud with daily backups and 256-bit encryption.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">Everything You Need</h3>
                  <p className="text-blue-100 text-xs">Report cards, attendance, CBT exams, parent portal, and fee management included.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-0.5">24/7 Support</h3>
                  <p className="text-blue-100 text-xs">Get help whenever you need it via email, chat, and comprehensive guides.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-white text-xs italic">
                "SchoolHub has transformed how we manage our school. Report cards that used to take days now take minutes!"
              </p>
              <p className="text-blue-100 text-xs mt-2">— Mrs. Adeyemi, Principal, Lagos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
