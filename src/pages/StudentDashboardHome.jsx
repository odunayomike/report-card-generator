import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';

export default function StudentDashboardHome() {
  const [stats, setStats] = useState({
    total_exams: 0,
    available_exams: 0,
    completed_exams: 0,
    average_score: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const student = JSON.parse(localStorage.getItem('studentData') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cbt/student-exams?action=list`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const exams = data.exams || [];

        // Calculate stats
        const totalExams = exams.length;
        const availableExams = exams.filter(e => e.status === 'available' || e.status === 'in_progress').length;
        const completedExams = exams.filter(e => e.status === 'completed').length;

        const scores = exams.filter(e => e.status === 'completed' && e.score != null).map(e => {
          const percentage = (e.score / e.total_marks) * 100;
          return percentage;
        });

        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        setStats({
          total_exams: totalExams,
          available_exams: availableExams,
          completed_exams: completedExams,
          average_score: Math.round(averageScore)
        });

        // Get recent exams (latest 5)
        setRecentExams(exams.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {student.name}!</h1>
        <p className="text-gray-600 mt-2">Class: {student.class} | Admission No: {student.admission_no}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_exams}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.available_exams}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed_exams}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.average_score}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Exams</h2>
            <Link to="/student/exams" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View all →
            </Link>
          </div>
        </div>

        {recentExams.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No exams assigned yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentExams.map((exam) => (
              <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{exam.exam_title}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(exam.status)}`}>
                        {getStatusText(exam.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{exam.subject} • {exam.duration_minutes} minutes • {exam.total_marks} marks</p>
                    {exam.status === 'completed' && exam.score != null && (
                      <p className="text-sm text-green-600 mt-1 font-medium">
                        Score: {exam.score}/{exam.total_marks} ({Math.round((exam.score / exam.total_marks) * 100)}%)
                      </p>
                    )}
                  </div>

                  <div className="ml-4">
                    {(exam.status === 'available' || exam.status === 'in_progress') && (
                      <Link
                        to={`/student/take-exam/${exam.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block text-sm"
                      >
                        {exam.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Link>
                    )}
                    {exam.status === 'completed' && (
                      <Link
                        to={`/student/results/${exam.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-block text-sm"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
