import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Copy, Check, UserPlus, AlertCircle } from 'lucide-react';
import { publicRegisterExternalStudent } from '../services/externalStudentApi';
import { API_BASE_URL } from '../config/env';

const PublicRegister = () => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();

  // Support both slug and school_id
  const schoolId = searchParams.get('school');
  const schoolSlug = slug;

  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loadingSchool, setLoadingSchool] = useState(true);

  const [formData, setFormData] = useState({
    school_id: schoolId || '',
    school_slug: schoolSlug || '',
    name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    applying_for_class: '',
    previous_school: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    parent_relationship: 'father',
  });

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Update form data when slug or schoolId changes
    setFormData(prev => ({
      ...prev,
      school_id: schoolId || '',
      school_slug: schoolSlug || '',
    }));
  }, [schoolId, schoolSlug]);

  useEffect(() => {
    // Fetch school information
    const fetchSchoolInfo = async () => {
      if (!schoolId && !schoolSlug) {
        setLoadingSchool(false);
        return;
      }

      try {
        setLoadingSchool(true);
        const params = new URLSearchParams();
        if (schoolSlug) {
          params.append('slug', schoolSlug);
        } else if (schoolId) {
          params.append('school_id', schoolId);
        }

        const response = await fetch(`${API_BASE_URL}/school/get-public-info?${params}`);
        const data = await response.json();

        if (data.success) {
          setSchoolInfo(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch school info:', error);
      } finally {
        setLoadingSchool(false);
      }
    };

    fetchSchoolInfo();
  }, [schoolId, schoolSlug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await publicRegisterExternalStudent(formData);

      if (response.success) {
        setCredentials(response.data);
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!schoolId && !schoolSlug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Registration Link</h2>
          <p className="text-gray-600 mb-6">
            This registration link is invalid or incomplete. Please contact the school for a valid registration link.
          </p>
        </div>
      </div>
    );
  }

  if (credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600">
              Welcome to {credentials.school_name}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">Exam Code</p>
                <button
                  onClick={() => copyToClipboard(credentials.exam_code, 'exam_code')}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  {copiedField === 'exam_code' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <code className="block px-3 py-2 bg-white border border-blue-300 rounded text-lg font-mono text-gray-900">
                {credentials.exam_code}
              </code>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-900">Password</p>
                <button
                  onClick={() => copyToClipboard(credentials.password, 'password')}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                >
                  {copiedField === 'password' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <code className="block px-3 py-2 bg-white border border-green-300 rounded text-lg font-mono text-gray-900">
                {credentials.password}
              </code>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please save these credentials. You will need them to login and take your entrance examination.
            </p>
          </div>

          <button
            onClick={() => navigate('/external-student/login')}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loadingSchool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Compact Header with School Branding */}
          <div className="bg-primary-600 text-white p-4 flex items-center gap-4">
            {/* School Logo */}
            {schoolInfo?.logo ? (
              <img
                src={schoolInfo.logo}
                alt={`${schoolInfo.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white shadow-lg flex-shrink-0">
                <UserPlus className="w-8 h-8" />
              </div>
            )}

            {/* School Name & Title */}
            <div className="flex-1 min-w-0">
              {schoolInfo ? (
                <>
                  <h1 className="text-xl font-bold truncate">{schoolInfo.name}</h1>
                  <p className="text-sm text-primary-100">Entrance Examination Registration</p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold">Entrance Examination Registration</h1>
                  <p className="text-sm text-primary-100">Register for entrance examination</p>
                </>
              )}
            </div>

            {/* Contact Info in Header */}
            {schoolInfo && (schoolInfo.phone || schoolInfo.email) && (
              <div className="hidden md:flex flex-col items-end text-xs text-primary-100 flex-shrink-0">
                {schoolInfo.phone && <span>{schoolInfo.phone}</span>}
                {schoolInfo.email && <span>{schoolInfo.email}</span>}
              </div>
            )}
          </div>

          {/* Compact Form */}
          <form onSubmit={handleSubmit} className="p-4">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 mb-3 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Three Column Compact Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Student Full Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Applying For Class */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Applying For <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="applying_for_class"
                    value={formData.applying_for_class}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Previous School */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Previous School</label>
                  <input
                    type="text"
                    name="previous_school"
                    value={formData.previous_school}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Parent Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="parent_phone"
                    value={formData.parent_phone}
                    onChange={handleChange}
                    required
                    placeholder="08012345678"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Parent Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    name="parent_email"
                    value={formData.parent_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    name="parent_relationship"
                    value={formData.parent_relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Password: EXT + last 4 digits of parent phone
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register
                    </>
                  )}
                </button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicRegister;
