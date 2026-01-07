import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, User, Mail, Phone } from 'lucide-react';
import { getExternalStudentExams } from '../../services/externalStudentApi';
import { useToastContext } from '../../contexts/ToastContext';

const ExternalStudentDashboardHome = ({ externalStudent }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    completed: 0,
    pending: 0,
    upcoming: 0,
  });
  const { toast } = useToastContext();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getExternalStudentExams();

      if (response.success) {
        setExams(response.exams || []);

        // Calculate stats
        const total = response.exams?.length || 0;
        const available = response.exams?.filter(e => e.status === 'available').length || 0;
        const completed = response.exams?.filter(e => e.status === 'completed').length || 0;
        const upcoming = response.exams?.filter(e => e.status === 'upcoming').length || 0;
        const pending = available + upcoming;

        setStats({ total, available, completed, pending, upcoming });
      }
    } catch (error) {
      toast.error('Failed to load exams');
      console.error('Fetch exams error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Available', icon: CheckCircle },
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming', icon: Clock },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed', icon: CheckCircle },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired', icon: AlertCircle },
    };

    const badge = badges[status] || badges.available;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg text-white p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {externalStudent?.name || 'Student'}!
            </h1>
            <p className="text-primary-100 text-lg">
              Entrance Examination Portal
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-primary-100 text-sm mb-1">Exam Code</p>
            <p className="text-2xl font-bold">{externalStudent?.exam_code || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Exams</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Available</p>
          <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <p className="text-base font-medium text-gray-900">
                {externalStudent?.name || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Applying For</p>
              <p className="text-base font-medium text-gray-900">
                {externalStudent?.applying_for_class || 'N/A'}
              </p>
            </div>
          </div>

          {externalStudent?.email && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-base font-medium text-gray-900">
                  {externalStudent.email}
                </p>
              </div>
            </div>
          )}

          {externalStudent?.phone && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Phone className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="text-base font-medium text-gray-900">
                  {externalStudent.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Exams</h2>
          <Link
            to="/external-student/exams"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No exams assigned yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Your entrance exams will appear here once assigned by the school
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.slice(0, 5).map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{exam.exam_title}</h3>
                    {getStatusBadge(exam.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {exam.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.duration_minutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(exam.start_datetime)}
                    </span>
                  </div>
                </div>
                {exam.status === 'available' && (
                  <Link
                    to={`/external-student/take-exam/${exam.id}`}
                    className="ml-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Start Exam
                  </Link>
                )}
                {exam.status === 'completed' && (
                  <Link
                    to={`/external-student/results/${exam.id}`}
                    className="ml-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View Results
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Important Instructions</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Ensure you have a stable internet connection before starting any exam</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Read all instructions carefully before beginning the exam</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Once started, exams must be completed within the allocated time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Your answers are auto-saved as you progress through the exam</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExternalStudentDashboardHome;
