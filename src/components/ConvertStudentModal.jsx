import { useState } from 'react';
import { X, UserCheck, AlertTriangle } from 'lucide-react';
import { convertExternalStudent } from '../services/externalStudentApi';
import { useToastContext } from '../context/ToastContext';

const ConvertStudentModal = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    admission_no: '',
    current_class: student.applying_for_class || '',
    session: '',
    term: 'First Term',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToastContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await convertExternalStudent(student.id, formData.admission_no, {
        current_class: formData.current_class,
        session: formData.session,
        term: formData.term,
      });

      if (response.success) {
        toast.success('Student converted successfully!');
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to convert student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Convert to Regular Student</h2>
            <p className="text-gray-600 mt-1">{student.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Warning Notice */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important</p>
              <p>
                Converting this student will:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create a regular student account with the provided admission number</li>
                <li>Create a parent account if it doesn't exist (using parent phone as username)</li>
                <li>Transfer all exam results to the new student account</li>
                <li>Mark the external student record as converted</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Information Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium text-gray-900">{student.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Exam Code:</span>
                <span className="ml-2 font-mono font-medium text-gray-900">{student.exam_code}</span>
              </div>
              <div>
                <span className="text-gray-500">Parent Name:</span>
                <span className="ml-2 font-medium text-gray-900">{student.parent_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Parent Phone:</span>
                <span className="ml-2 font-medium text-gray-900">{student.parent_phone}</span>
              </div>
            </div>
          </div>

          {/* Admission Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Admission Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="admission_no"
                  value={formData.admission_no}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2024/001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be the student's login username
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="current_class"
                  value={formData.current_class}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select class</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SSS 1">SSS 1</option>
                  <option value="SSS 2">SSS 2</option>
                  <option value="SSS 3">SSS 3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Session <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="session"
                  value={formData.session}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2023/2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term <span className="text-red-500">*</span>
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>
          </div>

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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Converting...
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  Convert Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertStudentModal;
