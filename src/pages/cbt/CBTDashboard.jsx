import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const CBTDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cbt/analytics`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
      } else {
        setError(data.message || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">CBT Dashboard</h1>
        <p className="text-gray-600 mt-2">Computer-Based Testing Analytics & Overview</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Analytics Statistics */}
      {!loading && analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-600 rounded-lg border-2 border-green-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Questions</p>
                  <p className="text-3xl font-bold mt-2">{analytics.stats.total_questions}</p>
                </div>
                <div className="bg-green-700 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-primary-500 rounded-lg border-2 border-primary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium">Published Exams</p>
                  <p className="text-3xl font-bold mt-2">{analytics.stats.published_exams}</p>
                  <p className="text-primary-100 text-xs mt-1">{analytics.stats.draft_exams} drafts</p>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-600 rounded-lg border-2 border-green-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed Attempts</p>
                  <p className="text-3xl font-bold mt-2">{analytics.stats.completed_attempts}</p>
                  <p className="text-green-100 text-xs mt-1">{analytics.stats.in_progress_attempts} in progress</p>
                </div>
                <div className="bg-green-700 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-primary-500 rounded-lg border-2 border-primary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold mt-2">{analytics.stats.average_score}%</p>
                  <p className="text-primary-100 text-xs mt-1">{analytics.stats.total_students_participated} students</p>
                </div>
                <div className="bg-primary-600 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          {analytics.stats.completed_attempts > 0 && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Grade Distribution</h2>
              <div className="grid grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-green-600">{analytics.grade_distribution.grade_a}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Grade A</p>
                  <p className="text-xs text-gray-500">80-100%</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-primary-600">{analytics.grade_distribution.grade_b}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Grade B</p>
                  <p className="text-xs text-gray-500">70-79%</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-yellow-600">{analytics.grade_distribution.grade_c}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Grade C</p>
                  <p className="text-xs text-gray-500">60-69%</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-orange-600">{analytics.grade_distribution.grade_d}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Grade D</p>
                  <p className="text-xs text-gray-500">50-59%</p>
                </div>
                <div className="text-center">
                  <div className="bg-pink-100 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-pink-600">{analytics.grade_distribution.grade_e}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Grade E</p>
                  <p className="text-xs text-gray-500">40-49%</p>
                </div>
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-red-600">{analytics.grade_distribution.grade_f}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Grade F</p>
                  <p className="text-xs text-gray-500">0-39%</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Exams & Subject Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Exams */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Exams</h2>
              {analytics.recent_exams.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recent_exams.map((exam) => (
                    <div key={exam.id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{exam.exam_title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exam.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {exam.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span>{exam.subject}</span> • <span>{exam.class}</span> • <span>{exam.assessment_type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{exam.completed}/{exam.total_attempts} completed</span>
                        <span>Avg: {exam.avg_score}%</span>
                        <span>{exam.completion_rate}% completion</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No exams created yet</p>
              )}
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Subject</h2>
              {analytics.subject_performance.length > 0 ? (
                <div className="space-y-3">
                  {analytics.subject_performance.slice(0, 5).map((subject, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{subject.subject}</span>
                        <span className="text-sm font-semibold text-green-600">{subject.avg_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${subject.avg_score}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{subject.exam_count} exams</span>
                        <span>{subject.attempt_count} attempts</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No exam attempts yet</p>
              )}
            </div>
          </div>

          {/* Class Performance */}
          {analytics.class_performance.length > 0 && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {analytics.class_performance.map((classData, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{classData.class}</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        classData.avg_score >= 70 ? 'bg-green-600' :
                        classData.avg_score >= 50 ? 'bg-primary-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">{classData.avg_score}%</p>
                    <p className="text-xs text-gray-500">{classData.attempt_count} attempts</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Students */}
          {analytics.top_students && analytics.top_students.length > 0 && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Students</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams Taken</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Best Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.top_students.map((student, index) => (
                      <tr key={student.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index >= 3 && <span className="font-medium text-gray-900">{index + 1}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.admission_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.exams_taken}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded">
                            {student.avg_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-sm font-semibold bg-primary-100 text-primary-700 rounded">
                            {student.best_score}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          to="/teacher/cbt/questions"
          className="bg-green-50 border-2 border-green-600 rounded-lg p-6 block group hover:bg-green-100 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-green-900">Question Bank</h3>
            <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-700 mb-4">
            Create and manage reusable questions for your exams
          </p>
          <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
            Manage Questions
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>

        <Link
          to="/teacher/cbt/exams"
          className="bg-primary-50 border-2 border-primary-500 rounded-lg p-6 block group hover:bg-primary-100 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-primary-900">Exam Management</h3>
            <div className="bg-primary-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-primary-700 mb-4">
            Create, publish, and monitor your CBT exams
          </p>
          <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-2 transition-transform">
            Manage Exams
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CBTDashboard;
