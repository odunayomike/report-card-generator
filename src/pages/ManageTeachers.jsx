import React, { useState, useEffect } from 'react';
import { getAllTeachers, createTeacher, assignTeacherClasses, unassignTeacherClass, getClassSubjects, getSchoolClasses, getSchoolProfile } from '../services/api';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [unassignData, setUnassignData] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState('');
  const [assignmentType, setAssignmentType] = useState('full_class'); // 'full_class' or 'subject'

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    classes: []
  });

  const [assignmentData, setAssignmentData] = useState({
    class_name: '',
    session: '',
    term: '',
    subject: ''
  });

  const [selectedSubjects, setSelectedSubjects] = useState([]); // For multiple subject selection

  useEffect(() => {
    loadTeachers();
    loadClassesAndSessions();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const response = await getAllTeachers();
      if (response.success) {
        setTeachers(response.teachers || []);
      } else {
        setError('Failed to load teachers');
      }
    } catch (err) {
      setError('Error loading teachers');
      console.error('Load teachers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClassesAndSessions = async () => {
    try {
      // Load classes
      const classesResponse = await getSchoolClasses();
      if (classesResponse.success) {
        const uniqueClasses = [...new Set((classesResponse.classes || []).map(c => c.class_name))];
        const uniqueSessions = [...new Set((classesResponse.classes || []).map(c => c.session))];
        setAvailableClasses(uniqueClasses);
        setAvailableSessions(uniqueSessions);
      }

      // Load current session from school profile
      const profileResponse = await getSchoolProfile();
      if (profileResponse.success && profileResponse.data.current_session) {
        setCurrentSession(profileResponse.data.current_session);

        // Add current session to available sessions if not already there
        setAvailableSessions(prev => {
          if (!prev.includes(profileResponse.data.current_session)) {
            return [profileResponse.data.current_session, ...prev];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error loading classes and sessions:', err);
    }
  };

  const handleCreateChange = (e) => {
    setNewTeacher({
      ...newTeacher,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await createTeacher(newTeacher);
      if (response.success) {
        setSuccess('Teacher created successfully!');
        setShowCreateForm(false);
        setNewTeacher({
          name: '',
          email: '',
          password: '',
          phone: '',
          classes: []
        });
        loadTeachers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to create teacher');
      }
    } catch (err) {
      setError('Error creating teacher');
      console.error('Create teacher error:', err);
    }
  };

  const handleAssignClass = (teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignForm(true);
    setAssignmentType('full_class');
    setAvailableSubjects([]);
    setSelectedSubjects([]);
    setAssignmentData({
      class_name: '',
      session: currentSession || '', // Pre-fill with current session
      term: '',
      subject: ''
    });
  };

  const handleAssignmentChange = async (e) => {
    const { name, value } = e.target;
    setAssignmentData({
      ...assignmentData,
      [name]: value
    });

    // Load subjects when class name changes and assignment type is 'subject'
    if (name === 'class_name' && value && assignmentType === 'subject') {
      setLoading(true);
      try {
        const response = await getClassSubjects(value);
        if (response.success) {
          setAvailableSubjects(response.data.subjects || []);
        } else {
          setAvailableSubjects([]);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
        setAvailableSubjects([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignmentTypeChange = async (type) => {
    setAssignmentType(type);
    setAssignmentData({
      ...assignmentData,
      subject: ''
    });
    setSelectedSubjects([]);

    // Load subjects if switching to subject mode and class is selected
    if (type === 'subject' && assignmentData.class_name) {
      setLoading(true);
      try {
        const response = await getClassSubjects(assignmentData.class_name);
        if (response.success) {
          setAvailableSubjects(response.data.subjects || []);
        } else {
          setAvailableSubjects([]);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
        setAvailableSubjects([]);
      } finally {
        setLoading(false);
      }
    } else if (type === 'full_class') {
      // Clear subjects when switching to full class mode
      setAvailableSubjects([]);
    }
  };

  const handleToggleSubject = (subjectName) => {
    if (selectedSubjects.includes(subjectName)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectName]);
    }
  };

  const handleSelectAllSubjects = () => {
    const allSubjectNames = availableSubjects.map(s => s.name);
    setSelectedSubjects(allSubjectNames);
  };

  const handleDeselectAllSubjects = () => {
    setSelectedSubjects([]);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate subjects if in subject mode
    if (assignmentType === 'subject' && selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    try {
      let classesToAssign = [];

      if (assignmentType === 'full_class') {
        // Single assignment for full class
        classesToAssign = [assignmentData];
      } else {
        // Multiple assignments, one for each selected subject
        classesToAssign = selectedSubjects.map(subject => ({
          class_name: assignmentData.class_name,
          session: assignmentData.session,
          term: assignmentData.term,
          subject: subject
        }));
      }

      const response = await assignTeacherClasses({
        teacher_id: selectedTeacher.id,
        classes: classesToAssign
      });

      if (response.success) {
        const subjectCount = assignmentType === 'subject' ? selectedSubjects.length : 0;
        const message = assignmentType === 'subject'
          ? `Class assigned successfully with ${subjectCount} subject(s)!`
          : 'Class assigned successfully!';
        setSuccess(message);
        setShowAssignForm(false);
        setSelectedTeacher(null);
        setSelectedSubjects([]);
        loadTeachers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to assign class');
      }
    } catch (err) {
      setError('Error assigning class');
      console.error('Assign class error:', err);
    }
  };

  const handleUnassignClass = (teacher, classAssignment) => {
    setUnassignData({ teacher, classAssignment });
    setShowUnassignConfirm(true);
  };

  const confirmUnassign = async () => {
    if (!unassignData) return;

    const { teacher, classAssignment } = unassignData;
    setShowUnassignConfirm(false);
    setError('');
    setSuccess('');

    try {
      const response = await unassignTeacherClass({
        teacher_id: teacher.id,
        class_name: classAssignment.class_name,
        session: classAssignment.session,
        term: classAssignment.term,
        subject: classAssignment.subject || null
      });

      if (response.success) {
        setSuccess('Class unassigned successfully!');
        loadTeachers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to unassign class');
      }
    } catch (err) {
      setError('Error unassigning class');
      console.error('Unassign class error:', err);
    } finally {
      setUnassignData(null);
    }
  };

  const cancelUnassign = () => {
    setShowUnassignConfirm(false);
    setUnassignData(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Teachers</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Teacher
        </button>
      </div>

      {/* Main Content */}
      <div>
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Create Teacher Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Teacher</h2>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={newTeacher.name}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter teacher's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={newTeacher.email}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="teacher@school.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={newTeacher.password}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newTeacher.phone}
                      onChange={handleCreateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Create Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Class Modal */}
        {showAssignForm && selectedTeacher && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Class to {selectedTeacher.name}
                </h2>
              </div>
              <form onSubmit={handleAssignSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Assignment Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAssignmentTypeChange('full_class')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          assignmentType === 'full_class'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Full Class
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignmentTypeChange('subject')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          assignmentType === 'subject'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Specific Subject
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {assignmentType === 'full_class'
                        ? 'Teacher will see all students in the class'
                        : 'Teacher will only see students enrolled in the selected subject'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name *
                    </label>
                    <select
                      name="class_name"
                      required
                      value={assignmentData.class_name}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select class</option>
                      {availableClasses.map((cls, idx) => (
                        <option key={idx} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session *
                    </label>
                    <select
                      name="session"
                      required
                      value={assignmentData.session}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select session</option>
                      {availableSessions.map((session, idx) => (
                        <option key={idx} value={session}>
                          {session}
                          {session === currentSession ? ' (Current)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term (Optional)
                    </label>
                    <select
                      name="term"
                      value={assignmentData.term}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Terms</option>
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave as "All Terms" to assign across all terms
                    </p>
                  </div>

                  {/* Subject Selection (only shown when assignment type is 'subject') */}
                  {assignmentType === 'subject' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Subjects * (Select one or more)
                        </label>
                        {selectedSubjects.length > 0 && (
                          <span className="text-xs text-primary-600 font-medium">
                            {selectedSubjects.length} selected
                          </span>
                        )}
                      </div>

                      {loading && assignmentData.class_name ? (
                        <p className="text-sm text-gray-500 italic">Loading subjects...</p>
                      ) : availableSubjects.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          {assignmentData.class_name
                            ? 'No subjects configured for this class. Please configure class subjects first.'
                            : 'Select class name first to load available subjects'}
                        </p>
                      ) : (
                        <>
                          {/* Select All / Deselect All */}
                          <div className="flex gap-2 mb-2 text-xs">
                            <button
                              type="button"
                              onClick={handleSelectAllSubjects}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={handleDeselectAllSubjects}
                              className="text-gray-600 hover:text-gray-700 font-medium"
                            >
                              Deselect All
                            </button>
                          </div>

                          {/* Subject Checkboxes */}
                          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                            {availableSubjects.map((subject, idx) => {
                              const isSelected = selectedSubjects.includes(subject.name);
                              return (
                                <label
                                  key={idx}
                                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-primary-50 border border-primary-500'
                                      : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSubject(subject.name)}
                                    className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                  />
                                  <div className="flex-1">
                                    <span className="text-gray-900 font-medium text-sm">{subject.name}</span>
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
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
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignForm(false);
                      setSelectedTeacher(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Assign {assignmentType === 'full_class' ? 'Class' : 'Subject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Teachers</h2>
          </div>

          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading teachers...</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No teachers found</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create your first teacher
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-3">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">{teacher.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 truncate">{teacher.email}</p>
                          <p className="text-xs text-gray-500">{teacher.phone || 'N/A'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                          teacher.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Assigned Classes</p>
                        {teacher.classes && teacher.classes.length > 0 ? (
                          <div className="space-y-1">
                            {teacher.classes.map((cls, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                <div className="flex-1 min-w-0">
                                  <span className="text-gray-900">{cls.class_name}</span>
                                  {cls.subject && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                                      {cls.subject}
                                    </span>
                                  )}
                                  <div className="text-gray-500 text-xs mt-0.5">{cls.session} - {cls.term || 'All Terms'}</div>
                                </div>
                                <button
                                  onClick={() => handleUnassignClass(teacher, cls)}
                                  className="ml-2 text-red-600 hover:text-red-700 text-xs font-medium whitespace-nowrap"
                                >
                                  Unassign Class
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No classes assigned</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAssignClass(teacher)}
                        className="w-full text-center py-2 px-3 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 font-medium text-sm"
                      >
                        Assign Class/Subject
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Classes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {teacher.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {teacher.classes && teacher.classes.length > 0 ? (
                              <div className="space-y-1">
                                {teacher.classes.map((cls, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                                    <div className="flex-1">
                                      <span className="text-gray-900">{cls.class_name}</span>
                                      {cls.subject && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                                          {cls.subject}
                                        </span>
                                      )}
                                      <span className="text-gray-500"> ({cls.session} - {cls.term || 'All Terms'})</span>
                                    </div>
                                    <button
                                      onClick={() => handleUnassignClass(teacher, cls)}
                                      className="ml-2 text-red-600 hover:text-red-700 text-xs font-medium whitespace-nowrap"
                                    >
                                      Unassign Class
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No classes assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              teacher.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {teacher.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <button
                              onClick={() => handleAssignClass(teacher)}
                              className="text-primary-600 hover:text-primary-900 font-medium"
                            >
                              Assign Class/Subject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unassign Confirmation Modal */}
      {showUnassignConfirm && unassignData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Unassignment</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to unassign{' '}
                <span className="font-semibold">
                  {unassignData.classAssignment.class_name}
                  {unassignData.classAssignment.subject && ` - ${unassignData.classAssignment.subject}`}
                </span>
                {' '}from{' '}
                <span className="font-semibold">{unassignData.teacher.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Session: {unassignData.classAssignment.session} | Term: {unassignData.classAssignment.term || 'All Terms'}
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end rounded-b-lg">
              <button
                type="button"
                onClick={cancelUnassign}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnassign}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
              >
                Unassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
