import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../services/api';

export default function DashboardHome({ school }) {
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await getAnalytics();
      if (response.success) {
        setAnalytics(response.analytics);
      } else {
        console.error('Failed to load analytics:', response.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/dashboard/reports/${reportId}`);
  };

  if (loadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.recentActivity.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{Object.keys(analytics.classCounts).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.classPerformance.length > 0
                  ? (analytics.classPerformance.reduce((sum, c) => sum + c.averageScore, 0) / analytics.classPerformance.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellence Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.gradeDistribution.A || 0} A's
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top Overall Students */}
      {analytics.topOverall.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {analytics.topOverall.map((student, index) => (
                <div key={student.id} className="relative bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-4 border-2 border-primary-200">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-2">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xl">{student.name.charAt(0)}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{student.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{student.class}</p>
                    <div className="bg-white rounded-full px-3 py-1">
                      <p className="text-lg font-bold text-primary-600">{student.averageScore}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Students by Class */}
      {Object.keys(analytics.topStudentsByClass).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {Object.entries(analytics.topStudentsByClass).slice(0, 4).map(([className, topStudents]) => (
            <div key={className} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
                <h3 className="text-lg font-semibold text-gray-900">Top Students - {className}</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div key={student.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-primary-600 font-semibold">{student.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                        <p className="text-xs text-gray-600">{student.term} • {student.session}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-primary-600">{student.averageScore}%</p>
                        <p className="text-xs text-gray-500">{student.subjectCount} subjects</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Performance Overview */}
      {analytics.classPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Class Performance Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.classPerformance.map((classData) => (
                <div key={classData.class} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-3">{classData.class}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score:</span>
                      <span className="font-bold text-primary-600">{classData.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Students:</span>
                      <span className="font-semibold text-gray-900">{classData.studentCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${classData.averageScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {analytics.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {analytics.recentActivity.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleViewReport(activity.id)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {activity.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{activity.name}</h4>
                    <p className="text-sm text-gray-500">{activity.class} • {activity.term}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
