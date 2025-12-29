import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getStudentProfile } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function StudentProfile() {
  const { admissionNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToastContext();
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine if user is a teacher based on the current route
  const isTeacher = location.pathname.startsWith('/teacher');

  useEffect(() => {
    loadProfile();
  }, [admissionNo]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getStudentProfile(admissionNo);
      if (response.success) {
        setViewingProfile(response);
      } else {
        toast.error('Error loading profile: ' + response.message);
        const basePath = isTeacher ? '/teacher' : '/dashboard';
        navigate(`${basePath}/students`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile. Please try again.');
      const basePath = isTeacher ? '/teacher' : '/dashboard';
      navigate(`${basePath}/students`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId) => {
    const basePath = isTeacher ? '/teacher' : '/dashboard';
    navigate(`${basePath}/reports/${reportId}`);
  };

  const handleEditReport = (reportId) => {
    const basePath = isTeacher ? '/teacher' : '/dashboard';
    navigate(`${basePath}/reports/${reportId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!viewingProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard/students')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Students
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                  {viewingProfile.studentInfo.photo ? (
                    <img src={viewingProfile.studentInfo.photo} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">{viewingProfile.studentInfo.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">{viewingProfile.studentInfo.name}</h1>
                  <p className="text-primary-100 text-sm">Admission No: {viewingProfile.studentInfo.admissionNo}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <p className="text-primary-100 text-xs">Total Reports</p>
                  <p className="text-2xl font-bold text-white">{viewingProfile.totalReports}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <p className="text-sm text-gray-900">{viewingProfile.studentInfo.gender}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                <p className="text-sm text-gray-900">{viewingProfile.studentInfo.height} cm</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
                <p className="text-sm text-gray-900">{viewingProfile.studentInfo.weight} kg</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Club/Society</label>
                <p className="text-sm text-gray-900">{viewingProfile.studentInfo.clubSociety || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Favorite Color</label>
                <p className="text-sm text-gray-900">{viewingProfile.studentInfo.favCol || 'N/A'}</p>
              </div>
            </div>

            {/* Academic Journey / Class Progression */}
            <h2 className="text-lg font-bold text-gray-900 mb-3 mt-6">Academic Journey</h2>
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Class Progression</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...new Set(viewingProfile.reports.map(r => r.class))].map((cls, index, arr) => (
                  <div key={cls} className="flex items-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-600 text-white">
                      {cls}
                    </span>
                    {index < arr.length - 1 && (
                      <svg className="w-5 h-5 text-primary-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Total Classes: {[...new Set(viewingProfile.reports.map(r => r.class))].length} |
                Sessions: {[...new Set(viewingProfile.reports.map(r => r.session))].length}
              </p>
            </div>

            {/* All Report Cards Grouped by Session and Class */}
            <h2 className="text-lg font-bold text-gray-900 mb-3">All Report Cards ({viewingProfile.totalReports})</h2>

            {/* Check if student has any valid reports */}
            {!viewingProfile.reports || viewingProfile.reports.length === 0 || viewingProfile.totalReports === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Cards Generated</h3>
                <p className="text-sm text-gray-500 mb-4">This student doesn't have any report cards yet.</p>
                <button
                  onClick={() => navigate('/dashboard/create')}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                >
                  Create Report Card
                </button>
              </div>
            ) : (
              /* Group reports by session and class */
              Object.entries(
              viewingProfile.reports.reduce((acc, report) => {
                const key = `${report.session} - ${report.class}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(report);
                return acc;
              }, {})
            ).map(([sessionClass, reports]) => (
              <div key={sessionClass} className="mb-5">
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {sessionClass}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {reports.sort((a, b) => {
                    const termOrder = { 'First Term': 1, 'Second Term': 2, 'Third Term': 3 };
                    return termOrder[a.term] - termOrder[b.term];
                  }).map((report) => (
                    <div key={report.id} className="border-2 border-gray-200 rounded-lg p-3 hover:border-primary-500 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{report.term}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          report.term === 'First Term' ? 'bg-green-100 text-green-800' :
                          report.term === 'Second Term' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {report.term.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleViewReport(report.id)}
                          className="flex-1 px-2 py-1.5 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleEditReport(report.id)}
                          className="flex-1 px-2 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
