import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchoolProfile } from '../services/api';

export default function SchoolProfile() {
  const navigate = useNavigate();
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
        alert('Error loading profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section with Logo */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
              {profile.logo ? (
                <img src={profile.logo} alt="School Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-indigo-600">{profile.school_name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{profile.school_name}</h1>
              {profile.motto && <p className="text-indigo-100 text-lg italic">"{profile.motto}"</p>}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8">
          {/* Basic Information */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-lg text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <p className="text-lg text-gray-900">{profile.phone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <p className="text-lg text-gray-900">{profile.address || 'N/A'}</p>
            </div>
          </div>

          {/* Branding Section */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-md border-2 border-gray-300"
                  style={{ backgroundColor: profile.primary_color || '#4F46E5' }}
                ></div>
                <span className="text-lg text-gray-900">{profile.primary_color || '#4F46E5'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-md border-2 border-gray-300"
                  style={{ backgroundColor: profile.secondary_color || '#9333EA' }}
                ></div>
                <span className="text-lg text-gray-900">{profile.secondary_color || '#9333EA'}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Academic Year</label>
              <p className="text-lg text-gray-900">
                {profile.academic_year_start && profile.academic_year_end
                  ? `${profile.academic_year_start} to ${profile.academic_year_end}`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Available Subjects</label>
              <p className="text-lg text-gray-900">
                {profile.available_subjects ? profile.available_subjects.length : 0} subjects
              </p>
            </div>
          </div>

          {/* Available Subjects List */}
          {profile.available_subjects && profile.available_subjects.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-600 mb-2">Subject List</label>
              <div className="flex flex-wrap gap-2">
                {profile.available_subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grading Scale */}
          {profile.grading_scale && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Grading Scale</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(profile.grading_scale).map(([grade, range]) => (
                  <div key={grade} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-600">{grade}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {Array.isArray(range) ? `${range[0]} - ${range[1]}` : range}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard/profile/edit')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Edit Basic Info
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
