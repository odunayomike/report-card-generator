import React, { useState, useEffect } from 'react';
import { getDefaultSubjects, getClassSubjects, configureClassSubjects, getSchoolClasses, getTeacherAssignedClasses } from '../services/api';

const ManageClassSubjects = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      // Check if user is a teacher by checking localStorage
      const userType = localStorage.getItem('userType');
      const isTeacherUser = userType === 'teacher';
      setIsTeacher(isTeacherUser);

      let response;
      if (isTeacherUser) {
        // Load only assigned classes for teachers
        response = await getTeacherAssignedClasses();
        if (response.success) {
          setAvailableClasses(response.classes || []);
        }
      } else {
        // Load all school classes for admins
        response = await getSchoolClasses();
        if (response.success) {
          // Extract unique class names from the response
          const uniqueClasses = [...new Set((response.classes || []).map(c => c.class_name))];
          setAvailableClasses(uniqueClasses);
        }
      }
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const loadClassSubjects = async (className) => {
    if (!className) return;

    setLoading(true);
    setError('');

    try {
      // Try to get configured subjects first
      const configuredResponse = await getClassSubjects(className);

      if (configuredResponse.success && configuredResponse.data.subjects.length > 0) {
        // Class has configured subjects
        setSubjects(configuredResponse.data.subjects);
      } else {
        // Load default subjects as template
        const defaultResponse = await getDefaultSubjects(className);
        if (defaultResponse.success) {
          setSubjects(defaultResponse.data.subjects || []);
        }
      }
    } catch (err) {
      setError('Error loading subjects');
      console.error('Load subjects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    setSubjects([]);
    if (className) {
      loadClassSubjects(className);
    }
  };

  const handleToggleCore = (index) => {
    const updated = [...subjects];
    updated[index].is_core = !updated[index].is_core;
    setSubjects(updated);
  };

  const handleRemoveSubject = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
  };

  const handleAddCustomSubject = () => {
    if (!customSubject.trim()) return;

    const newSubject = {
      name: customSubject.trim(),
      is_core: false
    };

    setSubjects([...subjects, newSubject]);
    setCustomSubject('');
  };

  const handleSaveConfiguration = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    if (subjects.length === 0) {
      setError('Please add at least one subject');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await configureClassSubjects(selectedClass, subjects);

      if (response.success) {
        setSuccess('Class subjects configured successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to configure subjects');
      }
    } catch (err) {
      setError('Error saving configuration');
      console.error('Save configuration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Manage Class Subjects</h2>
        <p className="text-gray-600">
          {isTeacher
            ? 'Configure subjects for your assigned classes'
            : 'Configure which subjects are offered for each class'}
        </p>
      </div>

      {/* Teacher Info Banner */}
      {isTeacher && availableClasses.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">No Classes Assigned</h4>
              <p className="text-sm text-blue-700 mt-1">
                You don't have any classes assigned yet. Please contact your school administrator to assign classes to you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass}
          onChange={handleClassChange}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose a class...</option>
          {availableClasses.map((cls, idx) => (
            <option key={idx} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Subjects Management */}
      {selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Subject List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Subjects for {selectedClass}
              </h3>

              {/* Subject List */}
              {loading && subjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Loading subjects...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 max-h-[calc(100vh-380px)] overflow-y-auto">
                    {subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="text-gray-900 font-medium text-sm truncate">{subject.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                            subject.is_core
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {subject.is_core ? 'Core' : 'Elective'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleToggleCore(index)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                          >
                            {subject.is_core ? 'Elective' : 'Core'}
                          </button>
                          <button
                            onClick={() => handleRemoveSubject(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {subjects.length === 0 && !loading && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No subjects configured. Add custom subjects or load defaults.
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveConfiguration}
                    disabled={loading || subjects.length === 0}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Configuration'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Add Custom Subject - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Add Custom Subject
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSubject()}
                  placeholder="Enter subject name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Subject
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-primary-900 mb-1">How it works:</h4>
                <ul className="text-sm text-primary-800 space-y-0.5">
                  <li>• Configure subjects for each class</li>
                  <li>• Mark as "Core" or "Elective"</li>
                  <li>• New students auto-enrolled in all subjects</li>
                  <li>• Students can modify enrollment later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClassSubjects;
