import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';
import schoolLogo from '../assets/schoolhub.png';

export default function StudentLogin({ onLogin }) {
  const [admissionNo, setAdmissionNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ admission_no: admissionNo })
      });

      const data = await response.json();

      if (data.success) {

        // Store student info
        localStorage.setItem('userType', 'student');
        localStorage.setItem('studentData', JSON.stringify(data.student));

        // Update App state
        if (onLogin) {
          onLogin(data.student);
        }

        // Navigate to student dashboard
        navigate('/student/dashboard');
      } else {
        console.error('Login failed:', data.message);
        setError(data.message || 'Invalid admission number');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={schoolLogo}
              alt="SchoolHub Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Student Portal</h1>
          <p className="text-sm sm:text-base text-gray-600">Enter your admission number to access your exams</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="admissionNo" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number
              </label>
              <input
                type="text"
                id="admissionNo"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your admission number"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Access Portal'}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-primary-600 hover:text-primary-700">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
