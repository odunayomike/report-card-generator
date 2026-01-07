import { useState, useEffect } from 'react';
import { X, FileText, Search } from 'lucide-react';
import { assignExamToExternalStudents } from '../services/externalStudentApi';
import { API_BASE_URL } from '../config/env';
import { useToastContext } from '../context/ToastContext';

const AssignExamModal = ({ studentIds, school, onClose, onSuccess }) => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingExams, setFetchingExams] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToastContext();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setFetchingExams(true);
      const response = await fetch(`${API_BASE_URL}/cbt/exams?action=list`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Filter only published exams
        const publishedExams = data.exams.filter(exam => exam.is_published === 1);
        setExams(publishedExams || []);
      }
    } catch (error) {
      toast.error('Failed to load exams');
      console.error('Fetch exams error:', error);
    } finally {
      setFetchingExams(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExamId) {
      toast.error('Please select an exam');
      return;
    }

    setLoading(true);

    try {
      const response = await assignExamToExternalStudents(parseInt(selectedExamId), studentIds);

      if (response.success) {
        toast.success(`Exam assigned to ${response.data.assigned_count} student(s)`);

        if (response.data.skipped_count > 0) {
          toast.warning(`${response.data.skipped_count} student(s) skipped (already assigned or invalid)`);
        }

        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to assign exam');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedExam = exams.find(e => e.id === parseInt(selectedExamId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign Exam</h2>
            <p className="text-gray-600 mt-1">
              Assigning to {studentIds.length} student{studentIds.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Exams
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, subject, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Exam Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exam <span className="text-red-500">*</span>
            </label>

            {fetchingExams ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-600">Loading exams...</p>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {searchTerm ? 'No exams match your search' : 'No published exams available'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-500 mt-1">
                    Create and publish exams in the CBT Management section
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                {filteredExams.map((exam) => (
                  <label
                    key={exam.id}
                    className={`flex items-start gap-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedExamId === exam.id.toString() ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="exam"
                      value={exam.id}
                      checked={selectedExamId === exam.id.toString()}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{exam.exam_title}</h4>
                          <p className="text-sm text-gray-600">{exam.subject}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {exam.class_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Total Marks: {exam.total_marks}</span>
                        <span>Duration: {exam.duration_minutes} mins</span>
                        <span>Questions: {exam.question_count || 'N/A'}</span>
                      </div>
                      {exam.start_datetime && exam.end_datetime && (
                        <div className="mt-2 text-xs text-gray-500">
                          Available: {new Date(exam.start_datetime).toLocaleDateString()} - {new Date(exam.end_datetime).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Exam Summary */}
          {selectedExam && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Exam</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Title:</strong> {selectedExam.exam_title}</p>
                <p><strong>Subject:</strong> {selectedExam.subject}</p>
                <p><strong>Class:</strong> {selectedExam.class_name}</p>
                <p><strong>Total Marks:</strong> {selectedExam.total_marks}</p>
                <p><strong>Duration:</strong> {selectedExam.duration_minutes} minutes</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedExamId}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Assign Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignExamModal;
