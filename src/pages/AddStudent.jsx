import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createStudent, generateAdmissionNumber, addParentStudent, getAllParents } from '../services/api';

const AddStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [generatingAdmission, setGeneratingAdmission] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parentPassword, setParentPassword] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [checkingParentEmail, setCheckingParentEmail] = useState(false);
  const [parentExists, setParentExists] = useState(false);
  const [existingParentData, setExistingParentData] = useState(null);
  const [useExistingParent, setUseExistingParent] = useState(false);

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
    parent_password: '',
    parent_relationship: 'guardian'
  });

  // Auto-generate admission number on component mount
  useEffect(() => {
    fetchAdmissionNumber();
  }, []);

  // Check parent email when checkbox is toggled
  useEffect(() => {
    if (useExistingParent && formData.parent_email && formData.parent_email.includes('@')) {
      checkParentEmail(formData.parent_email);
    }
  }, [useExistingParent]);

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

  const checkParentEmail = async (email) => {
    if (!email || !email.includes('@')) {
      setParentExists(false);
      setExistingParentData(null);
      return;
    }

    try {
      setCheckingParentEmail(true);
      console.log('Checking parent email:', email); // Debug

      // Use the getAllParents API function instead of direct fetch
      const data = await getAllParents();
      console.log('Response data:', data); // Debug

      if (data.success && data.parents) {
        console.log('Total parents:', data.parents.length); // Debug
        console.log('Searching for email:', email.toLowerCase()); // Debug

        const parent = data.parents.find(p => {
          console.log('Comparing:', p.email?.toLowerCase(), 'with', email.toLowerCase()); // Debug
          return p.email?.toLowerCase() === email.toLowerCase();
        });

        console.log('Found parent:', parent); // Debug

        if (parent) {
          setParentExists(true);
          setExistingParentData(parent);
          // Auto-fill parent information only if checkbox is checked
          if (useExistingParent) {
            setFormData(prev => ({
              ...prev,
              parent_name: parent.full_name || parent.name || '',
              parent_phone: parent.phone || ''
            }));
          }
        } else {
          console.log('No parent found with email:', email); // Debug
          setParentExists(false);
          setExistingParentData(null);
        }
      } else {
        console.log('API call failed or no parents returned'); // Debug
        setParentExists(false);
        setExistingParentData(null);
      }
    } catch (error) {
      console.error('Error checking parent email:', error);
      setParentExists(false);
      setExistingParentData(null);
    } finally {
      setCheckingParentEmail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');

    // Check if parent email exists when email field changes AND checkbox is checked
    if (name === 'parent_email' && useExistingParent && value.includes('@')) {
      // Clear existing parent data immediately while checking
      setParentExists(false);
      setExistingParentData(null);
      // Trigger check
      checkParentEmail(value);
    }
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

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
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
              parent_password: formData.parent_password,
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
    <div className="max-w-[1800px] mx-auto px-2 sm:px-4 py-2 sm:py-4">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-lg px-4 sm:px-6 py-3 sm:py-4 mb-2 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Add New Student</h1>
        <p className="text-primary-100 text-xs sm:text-sm mt-1">Fill in the student information to create a new profile</p>
      </div>
      <div className="bg-white rounded-b-lg shadow p-3 sm:p-4">

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

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Personal Information */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
            <div className="flex items-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., Primary 1A, JSS 2B"
                />
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., 35"
                />
              </div>

              {/* Parent/Guardian Information */}
              <div className="sm:col-span-2 lg:col-span-3 border-t border-gray-300 pt-3 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700">Parent/Guardian Information</h3>
                  </div>

                  {/* Checkbox to use existing parent */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useExistingParent}
                      onChange={(e) => {
                        setUseExistingParent(e.target.checked);
                        if (!e.target.checked) {
                          setParentExists(false);
                          setExistingParentData(null);
                          setFormData(prev => ({
                            ...prev,
                            parent_name: '',
                            parent_phone: '',
                            parent_password: ''
                          }));
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Link to existing parent</span>
                  </label>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${useExistingParent ? 'lg:grid-cols-1' : ''}`}>
                  {!useExistingParent && (
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
                        disabled={parentExists}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="e.g., John Doe"
                      />
                      {parentExists && (
                        <p className="text-xs text-gray-500 mt-1">Auto-filled from existing parent account</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="parent_email"
                        value={formData.parent_email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="parent@example.com"
                      />
                      {checkingParentEmail && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    {useExistingParent && parentExists && existingParentData && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-green-800">Parent Account Found: {existingParentData.full_name || existingParentData.name}</p>
                            <p className="text-xs text-green-700 mt-1">This student will be linked to the existing parent account</p>
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Email: {existingParentData.email}</p>
                              <p>Phone: {existingParentData.phone || 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {useExistingParent && formData.parent_email && !parentExists && !checkingParentEmail && formData.parent_email.includes('@') && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-amber-800">Parent not found. Please uncheck "Link to existing parent" to create a new account.</p>
                      </div>
                    )}
                  </div>

                  {!useExistingParent && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="parent_phone"
                          value={formData.parent_phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="+234812345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent App Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="parent_password"
                          value={formData.parent_password}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Enter password for parent app login"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This password will be used by the parent to login to the mobile app
                        </p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parent_relationship"
                      value={formData.parent_relationship}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
            </div>
          </div>

          {/* Academic Information */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
            <div className="flex items-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Academic Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
            <div className="flex items-center mb-2 sm:mb-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Additional Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club/Society
                </label>
                <input
                  type="text"
                  name="club_society"
                  value={formData.club_society}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., Blue"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Photo
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                  {/* Photo Preview */}
                  <div className="flex-shrink-0">
                    {formData.photo ? (
                      <div className="relative">
                        <img
                          src={formData.photo}
                          alt="Student preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-primary-200"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                          title="Remove photo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Upload Options */}
                  <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Capture from Camera */}
                      <div>
                        <input
                          type="file"
                          id="camera-capture"
                          accept="image/*"
                          capture
                          onChange={handleCameraCapture}
                          className="hidden"
                        />
                        <label
                          htmlFor="camera-capture"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">Take Photo</span>
                        </label>
                      </div>

                      {/* Upload from Files */}
                      <div>
                        <input
                          type="file"
                          id="file-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="font-medium">Choose from Files</span>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Take Photo:</strong> Opens camera to capture image directly. <strong>Choose from Files:</strong> Select existing photo from your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            {!parentPassword ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Student Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(isTeacher ? '/teacher/students' : '/dashboard/students')}
                  className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate(isTeacher ? '/teacher/students' : '/dashboard/students')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
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
