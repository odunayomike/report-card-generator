import { useState, useEffect } from 'react';
import { getStudentsWithIds, addParentStudent, getStudentParents, removeParentStudent, getAllParents } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function ManageParents() {
  const { toast } = useToastContext();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [existingParents, setExistingParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [allParents, setAllParents] = useState([]);
  const [loadingAllParents, setLoadingAllParents] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [showAddNewParent, setShowAddNewParent] = useState(false);

  const [parentForm, setParentForm] = useState({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    relationship: 'guardian',
    is_primary: true
  });

  useEffect(() => {
    fetchStudents();
    fetchAllParents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudentsWithIds();
      if (response.success) {
        setStudents(response.data || []);
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllParents = async () => {
    try {
      setLoadingAllParents(true);
      const response = await getAllParents();
      if (response.success) {
        setAllParents(response.parents || []);
      }
    } catch (error) {
      console.error('Error fetching all parents:', error);
    } finally {
      setLoadingAllParents(false);
    }
  };

  const fetchStudentParents = async (studentId) => {
    try {
      setLoadingParents(true);
      const response = await getStudentParents(studentId);
      if (response.success) {
        setExistingParents(response.parents || []);
      } else {
        setExistingParents([]);
      }
    } catch (error) {
      console.error('Error fetching student parents:', error);
      setExistingParents([]);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
    setShowAddNewParent(false);
    setParentSearchTerm('');
    // Fetch existing parents for this student
    fetchStudentParents(student.id);
    // Reset form
    setParentForm({
      parent_name: '',
      parent_email: '',
      parent_phone: '',
      relationship: 'guardian',
      is_primary: true
    });
  };

  const handleLinkExistingParent = async (parent, relationship = 'guardian', isPrimary = false) => {
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    try {
      setSubmitting(true);
      const response = await addParentStudent({
        student_id: selectedStudent.id,
        parent_email: parent.email,
        parent_name: parent.name,
        parent_phone: parent.phone || '',
        relationship: relationship,
        is_primary: isPrimary
      });

      if (response.success) {
        toast.success(`${parent.name} linked to ${selectedStudent.name} successfully!`);
        // Refresh the parents list
        fetchStudentParents(selectedStudent.id);
        setParentSearchTerm('');
      } else {
        toast.error(response.message || 'Failed to link parent');
      }
    } catch (error) {
      console.error('Error linking parent:', error);
      toast.error('An error occurred while linking parent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRemoveParent = async (parentId, parentName) => {
    if (!confirm(`Are you sure you want to unlink ${parentName} from ${selectedStudent?.name}?`)) {
      return;
    }

    try {
      const response = await removeParentStudent(selectedStudent.id, parentId);
      if (response.success) {
        toast.success('Parent unlinked successfully!');
        // Refresh the parents list
        fetchStudentParents(selectedStudent.id);
      } else {
        toast.error(response.message || 'Failed to unlink parent');
      }
    } catch (error) {
      console.error('Error unlinking parent:', error);
      toast.error('An error occurred while unlinking parent');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }

    if (!parentForm.parent_name || !parentForm.parent_email) {
      toast.error('Parent name and email are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await addParentStudent({
        student_id: selectedStudent.id,
        parent_email: parentForm.parent_email,
        parent_name: parentForm.parent_name,
        parent_phone: parentForm.parent_phone || '',
        relationship: parentForm.relationship,
        is_primary: parentForm.is_primary
      });

      if (response.success) {
        toast.success('Parent created and linked successfully!');
        // Refresh both lists
        fetchStudentParents(selectedStudent.id);
        fetchAllParents(); // Refresh all parents list
        // Switch back to selection mode
        setShowAddNewParent(false);
        // Reset form
        setParentForm({
          parent_name: '',
          parent_email: '',
          parent_phone: '',
          relationship: 'guardian',
          is_primary: existingParents.length === 0
        });
      } else {
        toast.error(response.message || 'Failed to link parent');
      }
    } catch (error) {
      console.error('Error linking parent:', error);
      toast.error('An error occurred while linking parent');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter available parents based on search term and exclude already linked parents
  const availableParents = allParents.filter(parent => {
    // Check if this parent is already linked to the selected student
    const isAlreadyLinked = existingParents.some(ep => ep.parent_id === parent.id);

    // Exclude if already linked
    if (isAlreadyLinked) return false;

    // Include if matches search term
    return (
      parent.name?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
      parent.email?.toLowerCase().includes(parentSearchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Manage Parent-Student Relationships</h1>
            <p className="text-primary-100">Link parents/guardians to students for portal access</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Student List */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Select Student</h2>

                  {/* Search Box */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, admission no, or class..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <svg
                      className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Student List */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                      <p className="mt-2 text-gray-600">Loading students...</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p>No students found</p>
                      {searchTerm && (
                        <p className="text-sm mt-1">Try a different search term</p>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors ${
                            selectedStudent?.id === student.id ? 'bg-primary-100 border-l-4 border-primary-600' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{student.name}</h3>
                              <div className="flex gap-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  <span className="font-medium">Admission:</span> {student.admission_no}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <span className="font-medium">Class:</span> {student.class}
                                </span>
                              </div>
                              {student.guardian_email && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Email: {student.guardian_email}
                                </p>
                              )}
                            </div>
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Parent Form */}
              <div>
                {!showForm ? (
                  <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center p-8">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
                      <p className="text-gray-600">Select a student from the list to link a parent/guardian</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Manage Parents for Student</h2>
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-primary-900">Selected Student:</p>
                        <p className="text-lg font-bold text-primary-800">{selectedStudent?.name}</p>
                        <p className="text-sm text-primary-700">
                          {selectedStudent?.admission_no} • {selectedStudent?.class}
                        </p>
                      </div>
                    </div>

                    {/* Existing Parents Section */}
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center justify-between">
                        <span>Linked Parents/Guardians</span>
                        {existingParents.length > 0 && (
                          <span className="text-sm font-normal text-gray-600">
                            ({existingParents.length} {existingParents.length === 1 ? 'parent' : 'parents'})
                          </span>
                        )}
                      </h3>

                      {loadingParents ? (
                        <div className="text-center py-4">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading parents...</p>
                        </div>
                      ) : existingParents.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                          <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-sm text-gray-600">No parents linked yet</p>
                          <p className="text-xs text-gray-500 mt-1">Add a parent below to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {existingParents.map((parent) => (
                            <div key={parent.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{parent.name}</h4>
                                    {parent.is_primary && (
                                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full font-medium">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {parent.email}
                                  </p>
                                  {parent.phone && (
                                    <p className="text-sm text-gray-600">
                                      <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      {parent.phone}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1 capitalize">
                                    Relationship: {parent.relationship}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParent(parent.id, parent.name)}
                                  className="ml-3 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                >
                                  Unlink
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Select or Add Parent Section */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-semibold text-gray-800">
                          {showAddNewParent ? 'Add New Parent/Guardian' : 'Select Existing Parent'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddNewParent(!showAddNewParent);
                            setParentSearchTerm('');
                          }}
                          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                          {showAddNewParent ? '← Back to Selection' : '+ Add New Parent'}
                        </button>
                      </div>

                      {!showAddNewParent ? (
                        /* Select Existing Parent Interface */
                        <div className="space-y-3">
                          {/* Search Parents */}
                          <div>
                            <input
                              type="text"
                              placeholder="Search parents by name or email..."
                              value={parentSearchTerm}
                              onChange={(e) => setParentSearchTerm(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Available Parents List */}
                          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                            {loadingAllParents ? (
                              <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                                <p className="text-sm text-gray-600 mt-3">Loading parents...</p>
                              </div>
                            ) : availableParents.length === 0 ? (
                              <div className="text-center py-12 px-4">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-900 mb-1">No parents found</p>
                                <p className="text-xs text-gray-500 mb-4">
                                  {parentSearchTerm ? 'Try a different search term or add a new parent' : 'No parents in the system yet'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setShowAddNewParent(true)}
                                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add New Parent
                                </button>
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-200">
                                {availableParents.map((parent) => (
                                  <div key={parent.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{parent.name}</h4>
                                        <p className="text-xs text-gray-600 mt-1 truncate">
                                          <svg className="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          {parent.email}
                                        </p>
                                        {parent.phone && (
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            <svg className="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {parent.phone}
                                          </p>
                                        )}
                                        {parent.student_count > 0 && (
                                          <p className="text-xs text-primary-600 mt-1.5 font-medium">
                                            Already linked to {parent.student_count} student{parent.student_count > 1 ? 's' : ''}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleLinkExistingParent(parent, 'guardian', existingParents.length === 0)}
                                        disabled={submitting}
                                        className="shrink-0 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                      >
                                        Link
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-3 text-center">
                            Can't find the parent? Click "Add New Parent" above to create a new parent account.
                          </p>
                        </div>
                      ) : (
                        /* Add New Parent Form */
                        <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Parent/Guardian Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="parent_name"
                          value={parentForm.parent_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="parent_email"
                          value={parentForm.parent_email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="parent@example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This email will be used for parent portal login
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="parent_phone"
                          value={parentForm.parent_phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="+234812345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="relationship"
                          value={parentForm.relationship}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="guardian">Guardian</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="is_primary"
                          checked={parentForm.is_primary}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          <span className="font-medium">Set as primary contact</span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Primary contacts receive important notifications and updates
                          </p>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Linking...
                              </span>
                            ) : (
                              'Link Parent to Student'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowForm(false);
                              setSelectedStudent(null);
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                        </form>

                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex">
                            <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                              <p className="text-sm text-yellow-700 mt-1">
                                This will create a new parent account and link them to {selectedStudent?.name}.
                              </p>
                            </div>
                          </div>
                        </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
