import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createStudent, generateAdmissionNumber, addParentStudent } from '../services/api';

const AddStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [generatingAdmission, setGeneratingAdmission] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parentPassword, setParentPassword] = useState(null);

  // Determine if user is a teacher based on the current route
  const isTeacher = location.pathname.startsWith('/teacher');

  const [formData, setFormData] = useState({
    name: '',
    admission_no: '',
    class: '',
    session: '',
    term: '',
    gender: '',
    height: '',
    weight: '',
    club_society: '',
    fav_col: '',
    photo: '',
    // Parent/Guardian Info
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    parent_relationship: 'guardian'
  });

  // Auto-generate admission number on component mount
  useEffect(() => {
    fetchAdmissionNumber();
  }, []);

  const fetchAdmissionNumber = async () => {
    try {
      setGeneratingAdmission(true);
      const response = await generateAdmissionNumber();
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          admission_no: response.admission_number
        }));
      }
    } catch (error) {
      console.error('Error generating admission number:', error);
    } finally {
      setGeneratingAdmission(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Create the student
      const response = await createStudent(formData);

      if (response.success) {
        // Step 2: Link parent to student if parent info is provided
        if (formData.parent_email && formData.parent_name && response.student?.id) {
          try {
            const parentResponse = await addParentStudent({
              student_id: response.student.id,
              parent_email: formData.parent_email,
              parent_name: formData.parent_name,
              parent_phone: formData.parent_phone || '',
              relationship: formData.parent_relationship,
              is_primary: true
            });

            // Check if a new parent was created with default password
            if (parentResponse.data?.is_new_parent && parentResponse.data?.default_password) {
              setParentPassword(parentResponse.data.default_password);
              setSuccess('Student profile created and parent account created successfully!');
            } else {
              setSuccess('Student profile created and linked to existing parent account!');
            }
          } catch (parentError) {
            console.error('Error linking parent:', parentError);
            setSuccess('Student created, but there was an issue linking the parent account. You can add parent details later.');
          }
        } else {
          setSuccess('Student profile created successfully!');
        }

        // Don't auto-navigate if we need to show parent password
        if (!parentPassword) {
          setTimeout(() => {
            navigate(isTeacher ? '/teacher/students' : '/dashboard/students');
          }, 2000);
        }
      } else {
        setError(response.message || 'Failed to create student profile');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      setError('An error occurred while creating the student profile');
    } finally {
      setLoading(false);
    }
  };

  const currentSession = new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Student</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
            <p className="text-sm text-green-700 font-semibold">{success}</p>
            {parentPassword && (
              <div className="mt-3 p-3 bg-white border border-green-300 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Parent Login Credentials
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span> {formData.parent_email}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Default Password:</span>{' '}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-green-700 font-semibold">
                      {parentPassword}
                    </span>
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  Please share these credentials with the parent. They can use this to login to the parent portal.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Email: ${formData.parent_email}\nPassword: ${parentPassword}`);
                    alert('Credentials copied to clipboard!');
                  }}
                  className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Copy Credentials
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="admission_no"
                    value={formData.admission_no}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Generating..."
                  />
                  <button
                    type="button"
                    onClick={fetchAdmissionNumber}
                    disabled={generatingAdmission}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate new admission number"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated. Click refresh to generate a new number.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Primary 1A, JSS 2B"
                />
              </div>

              {/* Parent/Guardian Information */}
              <div className="md:col-span-2 border-t pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="parent_name"
                      value={formData.parent_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="parent_email"
                      value={formData.parent_email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="parent@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="parent_phone"
                      value={formData.parent_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+234812345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parent_relationship"
                      value={formData.parent_relationship}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This information will be used to create a parent account for accessing student reports online.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 35"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="session"
                  value={formData.session}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`e.g., ${currentSession}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term <span className="text-red-500">*</span>
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club/Society
                </label>
                <input
                  type="text"
                  name="club_society"
                  value={formData.club_society}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Science Club"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Favorite Color
                </label>
                <input
                  type="text"
                  name="fav_col"
                  value={formData.fav_col}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Blue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.photo && (
                  <div className="mt-2">
                    <img
                      src={formData.photo}
                      alt="Student preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!parentPassword ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Student Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(isTeacher ? '/teacher/students' : '/dashboard/students')}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate(isTeacher ? '/teacher/students' : '/dashboard/students')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Done - Go to Students List
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
