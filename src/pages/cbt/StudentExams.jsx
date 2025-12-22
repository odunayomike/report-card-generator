import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const StudentExams = () => {
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadExams();

    // Check for success message from navigation state
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cbt/student-exams?action=list`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setExams(data.exams);
      } else {
        setError(data.message || 'Failed to load exams');
      }
    } catch (err) {
      setError('Failed to load exams');
      console.error('Load exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      available: 'Available',
      upcoming: 'Upcoming',
      in_progress: 'In Progress',
      expired: 'Expired',
      completed: 'Completed'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My CBT Exams</h1>
        <p className="text-gray-600 mt-2">View and take your assigned computer-based tests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {/* Exams List */}
      <div className="grid grid-cols-1 gap-6">
        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No exams assigned yet.
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.exam_title}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(exam.status)}`}>
                      {getStatusText(exam.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{exam.subject}</span>
                    <span>•</span>
                    <span>{exam.total_marks} marks</span>
                    <span>•</span>
                    <span>{exam.duration_minutes} minutes</span>
                  </div>
                  {exam.start_datetime && (
                    <p className="text-sm text-gray-500 mt-2">
                      Available: {new Date(exam.start_datetime).toLocaleString()} - {new Date(exam.end_datetime).toLocaleString()}
                    </p>
                  )}
                  {exam.status === 'in_progress' && exam.time_remaining && (
                    <p className="text-sm text-orange-600 mt-2 font-medium">
                      ⏱ Time remaining: {exam.time_remaining} minutes
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  {(exam.status === 'available' || exam.status === 'in_progress') && (
                    <a
                      href={`/student/take-exam/${exam.id}`}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
                    >
                      {exam.status === 'in_progress' ? 'Continue Exam' : 'Start Exam'}
                    </a>
                  )}
                  {exam.status === 'upcoming' && (
                    <button
                      disabled
                      className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed inline-block"
                      title="Exam has not started yet"
                    >
                      Not Started
                    </button>
                  )}
                  {exam.status === 'expired' && (
                    <button
                      disabled
                      className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed inline-block"
                      title="Exam has expired"
                    >
                      Expired
                    </button>
                  )}
                  {exam.status === 'completed' && (
                    <a
                      href={`/student/results/${exam.id}`}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-block"
                    >
                      View Results
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentExams;
