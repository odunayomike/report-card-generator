import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentForm from './StudentForm';
import ReportCard from './ReportCard';
import { saveReportCard, getAllStudents, getReportCard, getStudentProfile, getAnalytics, addParentStudent } from '../services/api';
import { API_BASE_URL } from '../config/env';
import { useToastContext } from '../context/ToastContext';

export default function Dashboard({ school, onLogout }) {
  const { toast } = useToastContext();
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, create, students, view-report, edit-report, view-profile
  const [reportData, setReportData] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [filters, setFilters] = useState({ class: '', session: '', term: '', search: '' });
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const navigate = useNavigate();

  // Fetch all students and analytics on component mount
  useEffect(() => {
    fetchStudents();
    fetchAnalytics();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await getAllStudents();
      if (response.success) {
        setStudents(response.data);
      } else {
        console.error('Failed to load students:', response.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

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

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      // Add school_id to the data
      const dataWithSchool = { ...data, school_id: school.id };

      // Save to database
      const response = await saveReportCard(dataWithSchool);

      if (response.success) {
        // Link parent to student if parent info is provided
        if (data.parentEmail && data.parentName && response.student_id) {
          try {
            await addParentStudent({
              student_id: response.student_id,
              parent_email: data.parentEmail,
              parent_name: data.parentName,
              parent_phone: data.parentPhone || '',
              relationship: data.parentRelationship || 'guardian',
              is_primary: true
            });
            toast.success('Report card saved and parent account linked successfully!');
          } catch (parentError) {
            console.error('Error linking parent:', parentError);
            toast.success('Report card saved, but there was an issue linking the parent account.');
          }
        } else {
          toast.success('Report card saved successfully!');
        }

        const dataWithId = { ...data, id: response.student_id };
        setReportData(dataWithId);
        setCurrentView('view-report');
        // Refresh the students list
        fetchStudents();
      } else {
        toast.error('Error saving report card: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save report card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewReport = async (studentId) => {
    try {
      const response = await getReportCard(studentId);
      if (response.success) {
        setReportData(response.data);
        setCurrentView('view-report');
      } else {
        toast.error('Error loading report: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load report. Please try again.');
    }
  };

  const handleEditReport = async (studentId) => {
    try {
      const response = await getReportCard(studentId);
      if (response.success) {
        setEditingStudent(response.data);
        setCurrentView('edit-report');
      } else {
        toast.error('Error loading report: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load report for editing. Please try again.');
    }
  };

  const handleViewProfile = async (admissionNo) => {
    try {
      const response = await getStudentProfile(admissionNo);
      if (response.success) {
        setViewingProfile(response);
        setCurrentView('view-profile');
      } else {
        toast.error('Error loading profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: 'include'
      });
      onLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Dashboard Statistics
  const stats = {
    totalStudents: students.length,
    thisMonth: students.filter(s => {
      const created = new Date(s.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    recentStudents: students.slice(0, 5)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{school.school_name}</h1>
                <p className="text-xs text-gray-500">{school.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('create')}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Report
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 print:hidden flex flex-col">
          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setCurrentView('create')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'create'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Report
            </button>

            <button
              onClick={() => setCurrentView('students')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'students'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              All Students
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {students.length}
              </span>
            </button>
          </nav>

          {/* School Info at Bottom */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">
                  {school.school_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{school.school_name}</p>
                <p className="text-xs text-gray-500 truncate">{school.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {currentView === 'dashboard' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

              {loadingAnalytics ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : analytics && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Reports</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <div key={student.id} className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200">
                              <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-2">
                                  {student.photo ? (
                                    <img src={student.photo} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-white font-bold text-xl">{student.name.charAt(0)}</span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">{student.name}</h4>
                                <p className="text-xs text-gray-600 mb-2">{student.class}</p>
                                <div className="bg-white rounded-full px-3 py-1">
                                  <p className="text-lg font-bold text-indigo-600">{student.averageScore}%</p>
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
                          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="text-lg font-semibold text-gray-900">Top Students - {className}</h3>
                          </div>
                          <div className="p-6">
                            <div className="space-y-3">
                              {topStudents.map((student, index) => (
                                <div key={student.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    {student.photo ? (
                                      <img src={student.photo} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      <span className="text-indigo-600 font-semibold">{student.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                                    <p className="text-xs text-gray-600">{student.term} • {student.session}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-indigo-600">{student.averageScore}%</p>
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
                            <div key={classData.class} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition-colors">
                              <h4 className="font-semibold text-gray-900 mb-3">{classData.class}</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Average Score:</span>
                                  <span className="font-bold text-indigo-600">{classData.averageScore}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Students:</span>
                                  <span className="font-semibold text-gray-900">{classData.studentCount}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all"
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
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">
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
                </>
              )}
            </div>
          )}

          {currentView === 'create' && (
            <StudentForm onSubmit={handleFormSubmit} saving={saving} school={school} />
          )}

          {currentView === 'students' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
                <button
                  onClick={() => setCurrentView('create')}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Report
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Search Student</label>
                    <input
                      type="text"
                      placeholder="Name or Admission No..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Class</label>
                    <select
                      value={filters.class}
                      onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">All Classes</option>
                      {[...new Set(students.map(s => s.class))].sort().map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Session</label>
                    <select
                      value={filters.session}
                      onChange={(e) => setFilters(prev => ({ ...prev, session: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">All Sessions</option>
                      {[...new Set(students.map(s => s.session))].sort().reverse().map(session => (
                        <option key={session} value={session}>{session}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Term</label>
                    <select
                      value={filters.term}
                      onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">All Terms</option>
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>
                {(filters.search || filters.class || filters.session || filters.term) && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {students.filter(student => {
                        const matchesSearch = !filters.search ||
                          student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          student.admission_no.toLowerCase().includes(filters.search.toLowerCase());
                        const matchesClass = !filters.class || student.class === filters.class;
                        const matchesSession = !filters.session || student.session === filters.session;
                        const matchesTerm = !filters.term || student.term === filters.term;
                        return matchesSearch && matchesClass && matchesSession && matchesTerm;
                      }).length} of {students.length} report cards
                    </p>
                    <button
                      onClick={() => setFilters({ class: '', session: '', term: '', search: '' })}
                      className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {loadingStudents ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Get started by creating your first report card</p>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                  >
                    Create Report Card
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.filter(student => {
                        const matchesSearch = !filters.search ||
                          student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          student.admission_no.toLowerCase().includes(filters.search.toLowerCase());
                        const matchesClass = !filters.class || student.class === filters.class;
                        const matchesSession = !filters.session || student.session === filters.session;
                        const matchesTerm = !filters.term || student.term === filters.term;
                        return matchesSearch && matchesClass && matchesSession && matchesTerm;
                      }).map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.admission_no}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {student.class}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.term}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.session}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewProfile(student.admission_no)}
                              className="text-purple-600 hover:text-purple-900 mr-4"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => handleViewReport(student.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditReport(student.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {currentView === 'view-report' && reportData && (
            <div className="p-6">
              <div className="mb-4 print:hidden flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('students')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Students
                </button>
                <button
                  onClick={() => handleEditReport(reportData.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Report
                </button>
              </div>
              <ReportCard data={reportData} school={school} />
            </div>
          )}

          {currentView === 'edit-report' && editingStudent && (
            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={() => setCurrentView('students')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Students
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Report Card</h2>
              <StudentForm
                onSubmit={handleFormSubmit}
                saving={saving}
                school={school}
                initialData={editingStudent}
              />
            </div>
          )}

          {currentView === 'view-profile' && viewingProfile && (
            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={() => setCurrentView('students')}
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
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                          {viewingProfile.studentInfo.photo ? (
                            <img src={viewingProfile.studentInfo.photo} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-4xl font-bold text-indigo-600">{viewingProfile.studentInfo.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold text-white mb-1">{viewingProfile.studentInfo.name}</h1>
                          <p className="text-indigo-100 text-lg">Admission No: {viewingProfile.studentInfo.admissionNo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/20 rounded-lg px-4 py-2">
                          <p className="text-indigo-100 text-sm">Total Reports</p>
                          <p className="text-3xl font-bold text-white">{viewingProfile.totalReports}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                        <p className="text-lg text-gray-900">{viewingProfile.studentInfo.gender}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Height</label>
                        <p className="text-lg text-gray-900">{viewingProfile.studentInfo.height} cm</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Weight</label>
                        <p className="text-lg text-gray-900">{viewingProfile.studentInfo.weight} kg</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Club/Society</label>
                        <p className="text-lg text-gray-900">{viewingProfile.studentInfo.clubSociety || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Favorite Color</label>
                        <p className="text-lg text-gray-900">{viewingProfile.studentInfo.favCol || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Academic Journey / Class Progression */}
                    <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Academic Journey</h2>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">Class Progression</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(viewingProfile.reports.map(r => r.class))].map((cls, index, arr) => (
                          <div key={cls} className="flex items-center">
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-indigo-600 text-white">
                              {cls}
                            </span>
                            {index < arr.length - 1 && (
                              <svg className="w-6 h-6 text-indigo-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Total Classes: {[...new Set(viewingProfile.reports.map(r => r.class))].length} |
                        Sessions: {[...new Set(viewingProfile.reports.map(r => r.session))].length}
                      </p>
                    </div>

                    {/* All Report Cards Grouped by Session and Class */}
                    <h2 className="text-xl font-bold text-gray-900 mb-4">All Report Cards ({viewingProfile.totalReports})</h2>

                    {/* Group reports by session and class */}
                    {Object.entries(
                      viewingProfile.reports.reduce((acc, report) => {
                        const key = `${report.session} - ${report.class}`;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(report);
                        return acc;
                      }, {})
                    ).map(([sessionClass, reports]) => (
                      <div key={sessionClass} className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {sessionClass}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {reports.sort((a, b) => {
                            const termOrder = { 'First Term': 1, 'Second Term': 2, 'Third Term': 3 };
                            return termOrder[a.term] - termOrder[b.term];
                          }).map((report) => (
                            <div key={report.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-lg transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{report.term}</h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Created: {new Date(report.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  report.term === 'First Term' ? 'bg-green-100 text-green-800' :
                                  report.term === 'Second Term' ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {report.term.split(' ')[0]}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => handleViewReport(report.id)}
                                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditReport(report.id)}
                                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
