import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  RefreshCw,
  Copy,
  Check,
  Edit2,
  X
} from 'lucide-react';
import { getExternalStudents, getExternalStudentResultsAdmin } from '../services/externalStudentApi';
import { useToastContext } from '../context/ToastContext';
import { API_BASE_URL } from '../config/env';
import EnrollExternalStudentModal from '../components/EnrollExternalStudentModal';
import ExternalStudentDetailsModal from '../components/ExternalStudentDetailsModal';
import AssignExamModal from '../components/AssignExamModal';
import ConvertStudentModal from '../components/ConvertStudentModal';

const ManageExternalStudents = ({ school }) => {
  const [externalStudents, setExternalStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEditSlugModal, setShowEditSlugModal] = useState(false);
  const [customSlug, setCustomSlug] = useState(school?.registration_slug || '');
  const [savingSlug, setSavingSlug] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    exam_assigned: 0,
    exam_completed: 0,
    converted: 0,
  });
  const { toast } = useToastContext();

  // Get registration link - use slug if available, otherwise school ID
  const getRegistrationLink = () => {
    const slug = school?.registration_slug || customSlug;
    if (slug) {
      return `${window.location.origin}/register/${slug}`;
    }
    return `${window.location.origin}/register?school=${school?.id || 1}`;
  };

  const copyRegistrationLink = async () => {
    try {
      await navigator.clipboard.writeText(getRegistrationLink());
      setCopiedLink(true);
      toast.success('Registration link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleUpdateSlug = async () => {
    if (!customSlug || customSlug.trim().length < 3) {
      toast.error('Slug must be at least 3 characters long');
      return;
    }

    setSavingSlug(true);
    try {
      const response = await fetch(`${API_BASE_URL}/school/update-registration-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug: customSlug.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration link updated successfully!');
        setShowEditSlugModal(false);
        // Update school object if possible
        if (school) {
          school.registration_slug = customSlug.trim();
        }
      } else {
        toast.error(data.message || 'Failed to update link');
      }
    } catch (error) {
      toast.error('Failed to update registration link');
    } finally {
      setSavingSlug(false);
    }
  };

  useEffect(() => {
    fetchExternalStudents();
  }, [statusFilter, classFilter]);

  const fetchExternalStudents = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (statusFilter !== 'all') filters.status = statusFilter;
      if (classFilter !== 'all') filters.class = classFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await getExternalStudents(filters);

      if (response.success) {
        setExternalStudents(response.data || []);
        calculateStats(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load external students');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (students) => {
    const stats = {
      total: students.length,
      pending: students.filter(s => s.status === 'pending').length,
      exam_assigned: students.filter(s => s.status === 'exam_assigned').length,
      exam_completed: students.filter(s => s.status === 'exam_completed').length,
      converted: students.filter(s => s.status === 'converted').length,
    };
    setStats(stats);
  };

  const handleSearch = () => {
    fetchExternalStudents();
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleAssignExam = (student) => {
    setSelectedStudents([student.id]);
    setShowAssignModal(true);
  };

  const handleBulkAssignExam = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    setShowAssignModal(true);
  };

  const handleConvert = (student) => {
    setSelectedStudent(student);
    setShowConvertModal(true);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === externalStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(externalStudents.map(s => s.id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
      exam_assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Exam Assigned' },
      exam_completed: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Completed' },
      passed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Passed' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      converted: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Converted' },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredStudents = externalStudents.filter(student => {
    const matchesSearch = searchTerm === '' ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.exam_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">External Students</h1>
          <p className="text-gray-600 mt-1">
            Manage prospective students for entrance examinations
          </p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Enroll Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.exam_assigned}</p>
          <p className="text-sm text-gray-600">Exam Assigned</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.exam_completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
          <p className="text-sm text-gray-600">Converted</p>
        </div>
      </div>

      {/* Registration Link */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Public Registration Link
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Share this link with parents to allow them to register their children for entrance examinations.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 overflow-x-auto">
                {getRegistrationLink()}
              </code>
              <button
                onClick={() => setShowEditSlugModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                <Edit2 className="w-4 h-4" />
                Customize
              </button>
              <button
                onClick={copyRegistrationLink}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, exam code, or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="exam_assigned">Exam Assigned</option>
            <option value="exam_completed">Exam Completed</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="converted">Converted</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="JSS 1">JSS 1</option>
            <option value="JSS 2">JSS 2</option>
            <option value="JSS 3">JSS 3</option>
            <option value="SSS 1">SSS 1</option>
            <option value="SSS 2">SSS 2</option>
            <option value="SSS 3">SSS 3</option>
          </select>

          <button
            onClick={fetchExternalStudents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedStudents.length} student(s) selected
            </p>
            <button
              onClick={handleBulkAssignExam}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Assign Exam to Selected
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading external students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No external students found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || classFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by enrolling prospective students for entrance examinations'}
            </p>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Enroll First Student
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === externalStudents.length && externalStudents.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Exam Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Applying For
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Parent Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Exams
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        {student.email && (
                          <p className="text-sm text-gray-500">{student.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                        {student.exam_code}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {student.applying_for_class}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{student.parent_name}</p>
                        <p className="text-gray-500">{student.parent_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {student.completed_exams}/{student.assigned_exams}
                        </p>
                        {student.average_score > 0 && (
                          <p className="text-gray-500">
                            Avg: {student.average_score.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {student.status !== 'converted' && (
                          <>
                            <button
                              onClick={() => handleAssignExam(student)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Assign Exam"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {student.completed_exams > 0 && (
                              <button
                                onClick={() => handleConvert(student)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Convert to Regular Student"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEnrollModal && (
        <EnrollExternalStudentModal
          school={school}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={() => {
            setShowEnrollModal(false);
            fetchExternalStudents();
          }}
        />
      )}

      {showDetailsModal && selectedStudent && (
        <ExternalStudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {showAssignModal && (
        <AssignExamModal
          studentIds={selectedStudents}
          school={school}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedStudents([]);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedStudents([]);
            fetchExternalStudents();
          }}
        />
      )}

      {showConvertModal && selectedStudent && (
        <ConvertStudentModal
          student={selectedStudent}
          school={school}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            setShowConvertModal(false);
            setSelectedStudent(null);
            fetchExternalStudents();
          }}
        />
      )}

      {/* Edit Slug Modal */}
      {showEditSlugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Customize Registration Link</h2>
              <button
                onClick={() => setShowEditSlugModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Link Slug
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">{window.location.origin}/register/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ''))}
                    placeholder="my-school-name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Only letters, numbers, hyphens, and underscores allowed. Minimum 3 characters.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong><br />
                  <code className="text-xs">{getRegistrationLink()}</code>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditSlugModal(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSlug}
                disabled={savingSlug || !customSlug || customSlug.trim().length < 3}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingSlug ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExternalStudents;
