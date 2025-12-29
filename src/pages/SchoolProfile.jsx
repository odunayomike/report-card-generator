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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{color: '#1791C8'}}>School Profile</h2>
        <button
          onClick={() => navigate('/dashboard/profile/edit')}
          className="px-3 py-2 text-white text-sm rounded-md transition-colors flex items-center gap-2"
          style={{backgroundColor: '#1791C8'}}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1478A6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1791C8'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{borderColor: '#1791C8'}}>
        {/* Header Section with Logo */}
        <div className="px-6 py-5" style={{backgroundColor: '#1791C8'}}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
              {profile.logo ? (
                <img src={profile.logo} alt="School Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold" style={{color: '#1791C8'}}>{profile.school_name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.school_name}</h1>
              {profile.motto && <p className="text-white opacity-90 text-sm italic">"{profile.motto}"</p>}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          {/* Basic Information */}
          <h2 className="text-lg font-bold mb-3" style={{color: '#1791C8'}}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-1" style={{color: '#1791C8'}}>Email</label>
              <p className="text-sm text-gray-900">{profile.email}</p>
            </div>
            <div className="border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-1" style={{color: '#1791C8'}}>Phone</label>
              <p className="text-sm text-gray-900">{profile.phone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-1" style={{color: '#1791C8'}}>Address</label>
              <p className="text-sm text-gray-900">{profile.address || 'N/A'}</p>
            </div>
          </div>

          {/* Branding Section */}
          <h2 className="text-lg font-bold mb-3 mt-6" style={{color: '#1791C8'}}>Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-2" style={{color: '#1791C8'}}>Primary Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border"
                  style={{ backgroundColor: profile.primary_color || '#4F46E5', borderColor: '#E5E7EB' }}
                ></div>
                <span className="text-sm text-gray-900">{profile.primary_color || '#4F46E5'}</span>
              </div>
            </div>
            <div className="border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-2" style={{color: '#1791C8'}}>Secondary Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border"
                  style={{ backgroundColor: profile.secondary_color || '#9333EA', borderColor: '#E5E7EB' }}
                ></div>
                <span className="text-sm text-gray-900">{profile.secondary_color || '#9333EA'}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <h2 className="text-lg font-bold mb-3 mt-6" style={{color: '#1791C8'}}>Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-1" style={{color: '#1791C8'}}>Academic Year</label>
              <p className="text-sm text-gray-900">
                {profile.academic_year_start && profile.academic_year_end
                  ? `${profile.academic_year_start} to ${profile.academic_year_end}`
                  : 'Not set'}
              </p>
            </div>
            <div className="border rounded-lg p-3" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-1" style={{color: '#1791C8'}}>Available Subjects</label>
              <p className="text-sm text-gray-900">
                {profile.available_subjects ? profile.available_subjects.length : 0} subjects
              </p>
            </div>
          </div>

          {/* Available Subjects List */}
          {profile.available_subjects && profile.available_subjects.length > 0 && (
            <div className="mb-6 border rounded-lg p-4" style={{borderColor: '#E5E7EB'}}>
              <label className="block text-xs font-medium mb-3" style={{color: '#1791C8'}}>Subject List</label>
              <div className="flex flex-wrap gap-2">
                {profile.available_subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-xs font-medium rounded-full text-white"
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
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 mt-6" style={{color: '#1791C8'}}>Grading Scale</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(profile.grading_scale).map(([grade, range]) => (
                  <div key={grade} className="border rounded-lg p-3 text-center" style={{borderColor: '#1791C8', backgroundColor: '#E6F4F9'}}>
                    <div className="text-lg font-bold" style={{color: '#1791C8'}}>{grade}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {Array.isArray(range) ? `${range[0]} - ${range[1]}` : range}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t" style={{borderColor: '#1791C8'}}>
            <h3 className="text-base font-semibold mb-3" style={{color: '#1791C8'}}>Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/dashboard/profile/edit')}
                className="px-4 py-2 text-white text-sm rounded-md transition-colors"
                style={{backgroundColor: '#1791C8'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1478A6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1791C8'}
              >
                Edit Basic Info
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="px-4 py-2 text-sm rounded-md transition-colors border"
                style={{borderColor: '#1791C8', color: '#1791C8', backgroundColor: 'white'}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#E6F4F9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
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
