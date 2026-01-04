import React, { useState, useEffect } from 'react';
import {
  getAllStudents,
  getClassSubjects,
  getStudentSubjects,
  enrollStudent,
  bulkEnrollStudents,
  getSchoolClasses,
  getSchoolProfile
} from '../services/api';

const ManageStudentSubjects = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [currentSessionFromSettings, setCurrentSessionFromSettings] = useState(''); // Track the "official" current session
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]); // For bulk selection
  const [bulkMode, setBulkMode] = useState(false); // Toggle between single and bulk mode
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await getSchoolClasses();
      if (response.success) {
        // Extract unique class names and sessions from the response
        const uniqueClasses = [...new Set((response.classes || []).map(c => c.class_name))];
        const uniqueSessions = [...new Set((response.classes || []).map(c => c.session))];

        setAvailableClasses(uniqueClasses);
        setAvailableSessions(uniqueSessions);

        // Try to get current session from school profile first
        try {
          const profileResponse = await getSchoolProfile();
          if (profileResponse.success && profileResponse.data.current_session) {
            const currentSession = profileResponse.data.current_session;

            // Store the official current session
            setCurrentSessionFromSettings(currentSession);

            // Add current_session to available sessions if it's not already there
            if (!uniqueSessions.includes(currentSession)) {
              uniqueSessions.unshift(currentSession); // Add to beginning of array
              setAvailableSessions(uniqueSessions);
            }

            setSelectedSession(currentSession);
          } else if (uniqueSessions.length > 0) {
            // Fallback to most recent session if no current_session is set
            setSelectedSession(uniqueSessions[0]);
          }
        } catch (err) {
          // If profile fetch fails, just use the first available session
          if (uniqueSessions.length > 0) {
            setSelectedSession(uniqueSessions[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const loadStudents = async (className) => {
    if (!className) return;

    setLoading(true);
    try {
      const response = await getAllStudents();
      if (response.success) {
        // Filter students by selected class
        const classStudents = response.data.filter(
          s => s.current_class?.toLowerCase() === className.toLowerCase()
        );
        setStudents(classStudents);
      }
    } catch (err) {
      setError('Error loading students');
      console.error('Load students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async (className) => {
    if (!className) return;

    try {
      const response = await getClassSubjects(className);
      if (response.success) {
        setAvailableSubjects(response.data.subjects || []);
      }
    } catch (err) {
      console.error('Error loading class subjects:', err);
    }
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    setSelectedStudent(null);
    setSelectedStudents([]);
    setStudents([]);
    setAvailableSubjects([]);
    setEnrolledSubjects([]);

    if (className) {
      loadStudents(className);
      loadClassSubjects(className);
    }
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setError('');

    if (!selectedSession) {
      setError('Please select a session first');
      return;
    }

    setLoading(true);
    try {
      const response = await getStudentSubjects(student.id, selectedSession);
      if (response.success) {
        const subjectNames = response.data.subjects.map(s => s.subject_name);
        setEnrolledSubjects(subjectNames);
      }
    } catch (err) {
      console.error('Error loading student subjects:', err);
      setEnrolledSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStudentToggle = (student) => {
    const isSelected = selectedStudents.some(s => s.id === student.id);
    if (isSelected) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents([...students]);
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedStudent(null);
    setSelectedStudents([]);
    setEnrolledSubjects([]);
  };

  const handleToggleSubject = (subjectName) => {
    if (enrolledSubjects.includes(subjectName)) {
      setEnrolledSubjects(enrolledSubjects.filter(s => s !== subjectName));
    } else {
      setEnrolledSubjects([...enrolledSubjects, subjectName]);
    }
  };

  const handleSelectAll = () => {
    const allSubjectNames = availableSubjects.map(s => s.name);
    setEnrolledSubjects(allSubjectNames);
  };

  const handleDeselectAll = () => {
    setEnrolledSubjects([]);
  };

  const handleSaveEnrollment = async () => {
    if (bulkMode) {
      // Bulk enrollment
      if (selectedStudents.length === 0) {
        setError('Please select at least one student');
        return;
      }

      if (!selectedSession) {
        setError('Please select a session first');
        return;
      }

      if (enrolledSubjects.length === 0) {
        setError('Please select at least one subject');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
        // Prepare enrollments array
        const enrollments = selectedStudents.map(student => ({
          student_id: student.id,
          subjects: enrolledSubjects
        }));

        const response = await bulkEnrollStudents(
          enrollments,
          selectedSession,
          selectedClass
        );

        if (response.success) {
          setSuccess(`Successfully enrolled ${selectedStudents.length} student(s) in ${enrolledSubjects.length} subject(s)!`);
          setTimeout(() => setSuccess(''), 3000);
          setSelectedStudents([]);
          setEnrolledSubjects([]);
        } else {
          setError(response.message || 'Failed to enroll students');
        }
      } catch (err) {
        setError('Error saving bulk enrollment');
        console.error('Save bulk enrollment error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Single student enrollment
      if (!selectedStudent) {
        setError('Please select a student');
        return;
      }

      if (!selectedSession) {
        setError('Please select a session first');
        return;
      }

      if (enrolledSubjects.length === 0) {
        setError('Please select at least one subject');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await enrollStudent(
          selectedStudent.id,
          enrolledSubjects,
          selectedSession
        );

        if (response.success) {
          setSuccess(`Successfully enrolled ${selectedStudent.name} in ${enrolledSubjects.length} subject(s)!`);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.message || 'Failed to enroll student');
        }
      } catch (err) {
        setError('Error saving enrollment');
        console.error('Save enrollment error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="px-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Manage Student Subjects</h2>
        <p className="text-gray-600">Enroll students in their subjects for {selectedSession || 'a session'}</p>
      </div>

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

      {/* Session and Class Selection - Combined in one row */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Session Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a session...</option>
              {availableSessions.map((session, idx) => (
                <option key={idx} value={session}>
                  {session}
                  {session === currentSessionFromSettings ? ' (Current)' : ''}
                </option>
              ))}
            </select>
            {currentSessionFromSettings && selectedSession === currentSessionFromSettings && (
              <p className="text-xs text-primary-600 mt-1 font-medium">
                ✓ Using current session from school settings
              </p>
            )}
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a class...</option>
              {availableClasses.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content - Three column layout */}
      {selectedClass && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Students in {selectedClass}
                </h3>
                <button
                  onClick={handleToggleBulkMode}
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    bulkMode
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {bulkMode ? 'Bulk Mode' : 'Single'}
                </button>
              </div>

              {/* Bulk mode controls */}
              {bulkMode && students.length > 0 && (
                <div className="flex gap-2 mb-3 text-xs">
                  <button
                    onClick={handleSelectAllStudents}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAllStudents}
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Deselect All
                  </button>
                  {selectedStudents.length > 0 && (
                    <span className="ml-auto text-primary-600 font-medium">
                      {selectedStudents.length} selected
                    </span>
                  )}
                </div>
              )}

              {loading && students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No students found</div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {students.map((student) => {
                    const isSelected = bulkMode
                      ? selectedStudents.some(s => s.id === student.id)
                      : selectedStudent?.admission_no === student.admission_no;

                    return bulkMode ? (
                      <label
                        key={student.admission_no}
                        className={`flex items-center w-full p-2 rounded-md border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary-50 border-primary-500'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBulkStudentToggle(student)}
                          className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.admission_no}</div>
                        </div>
                      </label>
                    ) : (
                      <button
                        key={student.admission_no}
                        onClick={() => handleStudentSelect(student)}
                        className={`w-full text-left p-2 rounded-md border transition-colors ${
                          isSelected
                            ? 'bg-primary-50 border-primary-500'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.admission_no}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="lg:col-span-2">
            {(selectedStudent || (bulkMode && selectedStudents.length > 0)) ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Subject Enrollment
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bulkMode
                        ? `${selectedStudents.length} student(s) selected`
                        : `${selectedStudent?.name} - ${selectedStudent?.admission_no}`
                      }
                    </p>
                  </div>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
                    <p className="text-sm text-primary-900">
                      <strong>{enrolledSubjects.length}</strong> selected
                    </p>
                  </div>
                </div>

                {availableSubjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No subjects configured for this class. Please configure class subjects first.
                  </div>
                ) : (
                  <>
                    {/* Select All / Deselect All buttons */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={handleDeselectAll}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Deselect All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                      {availableSubjects.map((subject, index) => {
                        const isEnrolled = enrolledSubjects.includes(subject.name);
                        return (
                          <label
                            key={index}
                            className={`flex items-center p-2 rounded-md border cursor-pointer transition-colors ${
                              isEnrolled
                                ? 'bg-primary-50 border-primary-500'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isEnrolled}
                              onChange={() => handleToggleSubject(subject.name)}
                              className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-900 font-medium text-sm block truncate">{subject.name}</span>
                              <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
                                subject.is_core
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {subject.is_core ? 'Core' : 'Elective'}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveEnrollment}
                      disabled={loading || enrolledSubjects.length === 0}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save Enrollment'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-center py-12 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>
                    {bulkMode
                      ? 'Select student(s) to manage their subject enrollment'
                      : 'Select a student to manage their subject enrollment'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      {selectedClass && (
        <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-primary-900 mb-1">Instructions:</h4>
          <ul className="text-sm text-primary-800 space-y-0.5">
            <li>• Select a session (academic year) first</li>
            <li>• Select a class to view students in that class</li>
            <li>• Use "Bulk Mode" to assign the same subjects to multiple students at once</li>
            <li>• In single mode, click on a student to manage their subject enrollment individually</li>
            <li>• Check/uncheck subjects to enroll or unenroll the student(s)</li>
            <li>• Core subjects are recommended but not enforced - students have full liberty to choose</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ManageStudentSubjects;
