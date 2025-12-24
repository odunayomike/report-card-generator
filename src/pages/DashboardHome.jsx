import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../services/api';
import { API_BASE_URL } from '../config/env';

export default function DashboardHome({ school }) {
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [settlementInfo, setSettlementInfo] = useState(null);
  const [loadingSettlement, setLoadingSettlement] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    fetchSettlementInfo();
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

  const fetchSettlementInfo = async () => {
    try {
      setLoadingSettlement(true);
      const response = await fetch(`${API_BASE_URL}/accounting/admin/get-settlement-info`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSettlementInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching settlement info:', error);
    } finally {
      setLoadingSettlement(false);
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Settlement Setup Alert */}
      {!loadingSettlement && !settlementInfo?.has_subaccount && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Complete Settlement Setup to Collect School Fees
              </h3>
              <p className="text-sm text-orange-800 mb-4">
                To start collecting school fees through our platform, you need to set up your settlement account.
                This allows parents to pay fees directly from the parent mobile application, and you will receive the payment directly into the account you provide for settlement.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard/accounting/settlement-setup')}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Set Up Settlement Account
                </button>
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Takes less than 5 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Overall School Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.totalStudents || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.totalTeachers || 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.totalClasses || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.totalReports || 0}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.attendanceRate || 0}%</p>
              <p className="text-[10px] text-gray-500 mt-0.5">This Month</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Excellence Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.gradeDistribution?.A || 0}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Grade A's</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Class Performance Overview */}
      {analytics?.classPerformance?.length > 0 && (
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

      {/* Top Overall Students */}
      {analytics?.topOverall?.length > 0 && (
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
      {Object.keys(analytics?.topStudentsByClass || {}).length > 0 && (
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

      {/* Recent Activity */}
      {analytics?.recentActivity?.length > 0 && (
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
