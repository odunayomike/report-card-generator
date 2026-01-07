import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Calendar, CheckCircle, AlertCircle, Trophy, TrendingUp } from 'lucide-react';
import { getExternalStudentExams } from '../../services/externalStudentApi';
import { useToastContext } from '../../contexts/ToastContext';

const ExternalStudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available, upcoming, completed
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
      }
    } catch (error) {
      toast.error('Failed to load exams');
      console.error('Fetch exams error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === 'all') return true;
    return exam.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      available: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Available Now',
        icon: CheckCircle,
      },
      upcoming: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Upcoming',
        icon: Clock,
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Completed',
        icon: CheckCircle,
      },
      expired: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Expired',
        icon: AlertCircle,
      },
    };

    const badge = badges[status] || badges.available;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-4 h-4" />
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

  const getFilterCount = (status) => {
    if (status === 'all') return exams.length;
    return exams.filter((e) => e.status === status).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Exams</h1>
        <p className="text-gray-600">
          View and take your entrance examination exams
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Exams' },
            { value: 'available', label: 'Available' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.value
                    ? 'bg-white/20'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {getFilterCount(tab.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Exams List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading your exams...</p>
          </div>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Exams Assigned' : `No ${filter} exams`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Your entrance exams will appear here once assigned by the school'
                : `You don't have any ${filter} exams at the moment`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {exam.exam_title}
                      </h3>
                      <p className="text-gray-600">{exam.subject}</p>
                    </div>
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
              </div>

              {/* Exam Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Marks</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {exam.total_marks} marks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {exam.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Starts</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(exam.start_datetime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ends</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(exam.end_datetime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {exam.instructions && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{exam.instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {exam.status === 'available' && (
                  <Link
                    to={`/external-student/take-exam/${exam.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Start Exam
                  </Link>
                )}

                {exam.status === 'completed' && (
                  <Link
                    to={`/external-student/results/${exam.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Trophy className="w-5 h-5" />
                    View Results
                  </Link>
                )}

                {exam.status === 'upcoming' && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-600 font-medium rounded-lg cursor-not-allowed">
                    <Clock className="w-5 h-5" />
                    Not Yet Available
                  </div>
                )}

                {exam.status === 'expired' && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 font-medium rounded-lg cursor-not-allowed">
                    <AlertCircle className="w-5 h-5" />
                    Exam Expired
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExternalStudentExams;
