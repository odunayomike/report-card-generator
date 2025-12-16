import React, { useState, useEffect } from 'react';
import { getAllTeachers, createTeacher, assignTeacherClasses } from '../services/api';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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
    term: ''
  });

  useEffect(() => {
    loadTeachers();
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
    setAssignmentData({
      class_name: '',
      session: '',
      term: ''
    });
  };

  const handleAssignmentChange = (e) => {
    setAssignmentData({
      ...assignmentData,
      [e.target.name]: e.target.value
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await assignTeacherClasses({
        teacher_id: selectedTeacher.id,
        classes: [assignmentData]
      });

      if (response.success) {
        setSuccess('Class assigned successfully!');
        setShowAssignForm(false);
        setSelectedTeacher(null);
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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Teachers</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      name="class_name"
                      required
                      value={assignmentData.class_name}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., JSS 1, SSS 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session *
                    </label>
                    <input
                      type="text"
                      name="session"
                      required
                      value={assignmentData.session}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 2023/2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term *
                    </label>
                    <select
                      name="term"
                      required
                      value={assignmentData.term}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select term</option>
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Assign Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Teachers</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading teachers...</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No teachers found</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create your first teacher
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                                <div key={idx} className="text-xs">
                                  {cls.class_name} ({cls.session} - {cls.term})
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
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Assign Class
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTeachers;
