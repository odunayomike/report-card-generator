import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents } from '../services/api';

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [filters, setFilters] = useState({ class: '', session: '', term: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
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

  const handleViewProfile = (admissionNo) => {
    navigate(`/dashboard/students/${admissionNo}`);
  };

  const handleViewReport = (studentId) => {
    navigate(`/dashboard/reports/${studentId}`);
  };

  const handleEditReport = (studentId) => {
    navigate(`/dashboard/reports/${studentId}/edit`);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !filters.search ||
      student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.admission_no.toLowerCase().includes(filters.search.toLowerCase());
    const matchesClass = !filters.class || student.class === filters.class;
    const matchesSession = !filters.session || student.session === filters.session;
    const matchesTerm = !filters.term || student.term === filters.term;
    return matchesSearch && matchesClass && matchesSession && matchesTerm;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard/add-student')}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Report
          </button>
        </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Class</label>
            <select
              value={filters.class}
              onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
              Showing {filteredStudents.length} of {students.length} report cards
            </p>
            <button
              onClick={() => setFilters({ class: '', session: '', term: '', search: '' })}
              className="text-sm text-primary-600 hover:text-primary-900 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loadingStudents ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
          <p className="text-sm text-gray-500 mb-4">Get started by creating your first report card</p>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
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
                      className="text-primary-600 hover:text-primary-900 mr-4"
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
  );
}
