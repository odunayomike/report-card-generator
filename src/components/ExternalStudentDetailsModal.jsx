import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, FileText, TrendingUp, Clock } from 'lucide-react';
import { getExternalStudentResultsAdmin } from '../services/externalStudentApi';
import { useToastContext } from '../context/ToastContext';

const ExternalStudentDetailsModal = ({ student, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToastContext();

  useEffect(() => {
    fetchResults();
  }, [student.id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await getExternalStudentResultsAdmin(student.id);

      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      toast.error('Failed to load student results');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-600 mt-1">External Student Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{student.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam Code</p>
                  <code className="font-mono font-medium text-gray-900">{student.exam_code}</code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applying For</p>
                  <p className="font-medium text-gray-900">{student.applying_for_class}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(student.status)}</div>
                </div>
              </div>

              {student.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{student.email}</p>
                  </div>
                </div>
              )}

              {student.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{student.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Name</p>
                  <p className="font-medium text-gray-900">{student.parent_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Parent Phone</p>
                  <p className="font-medium text-gray-900">{student.parent_phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Date</p>
                  <p className="font-medium text-gray-900">{formatDate(student.application_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          ) : results && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Total Assigned</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {results.statistics.total_exams_assigned}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-900">
                      {results.statistics.total_exams_completed}
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {results.statistics.pending_exams}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Overall %</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {results.statistics.overall_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Exam Results */}
              {results.exam_results && results.exam_results.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Results</h3>
                  <div className="space-y-3">
                    {results.exam_results.map((exam) => (
                      <div
                        key={exam.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exam.exam_title}</h4>
                            <p className="text-sm text-gray-500">{exam.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {exam.percentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-500">
                              {exam.total_score}/{exam.total_marks}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Correct</p>
                            <p className="font-medium text-green-600">{exam.correct_answers}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Wrong</p>
                            <p className="font-medium text-red-600">{exam.wrong_answers}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Time Taken</p>
                            <p className="font-medium text-gray-900">{exam.time_taken_minutes} min</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          Submitted: {formatDate(exam.submitted_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.exam_results && results.exam_results.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No exams completed yet</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalStudentDetailsModal;
