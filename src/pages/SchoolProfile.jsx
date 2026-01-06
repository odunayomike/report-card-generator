import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchoolProfile } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function SchoolProfile() {
  const navigate = useNavigate();
  const { toast } = useToastContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getSchoolProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error('Error loading profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#1791C8'}}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">School Profile</h2>
        <button
          onClick={() => navigate('/dashboard/profile/edit')}
          className="px-4 py-2 text-white text-sm rounded-md transition-colors flex items-center gap-2 hover:opacity-90"
          style={{backgroundColor: '#1791C8'}}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Header Card with Logo */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 mb-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg">
            {profile.logo ? (
              <img src={profile.logo} alt="School Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold" style={{color: '#1791C8'}}>{profile.school_name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.school_name}</h1>
            {profile.motto && <p className="text-white/90 text-base italic">"{profile.motto}"</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Contact & Branding */}
        <div className="lg:col-span-1 space-y-6">

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile.email}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {profile.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <p className="text-sm text-gray-900 flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.address || 'Not provided'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Branding Colors */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md"
                    style={{ backgroundColor: profile.primary_color || '#4F46E5' }}
                  ></div>
                  <span className="text-sm font-mono text-gray-700">{profile.primary_color || '#4F46E5'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md"
                    style={{ backgroundColor: profile.secondary_color || '#9333EA' }}
                  ></div>
                  <span className="text-sm font-mono text-gray-700">{profile.secondary_color || '#9333EA'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Academic Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Academic Year */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <label className="block text-xs font-medium text-blue-700 mb-1">Academic Year</label>
                <p className="text-sm font-semibold text-gray-900">
                  {profile.academic_year_start && profile.academic_year_end
                    ? `${profile.academic_year_start} - ${profile.academic_year_end}`
                    : 'Not configured'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <label className="block text-xs font-medium text-green-700 mb-1">Total Subjects</label>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.available_subjects ? profile.available_subjects.length : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Available Subjects */}
          {profile.available_subjects && profile.available_subjects.length > 0 && (
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects Offered</h3>
              <div className="flex flex-wrap gap-2">
                {profile.available_subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg text-white shadow-sm"
                    style={{backgroundColor: '#1791C8'}}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grading Scale */}
          {profile.grading_scale && (
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading Scale</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {Object.entries(profile.grading_scale).map(([grade, range]) => (
                  <div
                    key={grade}
                    className="rounded-lg p-4 text-center shadow-sm"
                    style={{backgroundColor: '#E6F4F9'}}
                  >
                    <div className="text-2xl font-bold" style={{color: '#1791C8'}}>{grade}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {Array.isArray(range) ? `${range[0]}-${range[1]}` : range}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard/profile/edit')}
                className="px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-all hover:shadow-md"
                style={{backgroundColor: '#1791C8'}}
              >
                Edit Basic Information
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all border-2 hover:shadow-md"
                style={{borderColor: '#1791C8', color: '#1791C8', backgroundColor: 'white'}}
              >
                Manage Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
