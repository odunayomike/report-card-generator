import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getStudentsForAttendance, markDailyAttendance, getDailyAttendance } from '../services/api';

const AttendanceMarker = () => {
  const { classes: teacherClasses } = useOutletContext();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (teacherClasses) {
      setClasses(teacherClasses);
    }
  }, [teacherClasses]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  const loadStudentsAndAttendance = async () => {
    if (!selectedClass) return;

    setLoading(true);
    setError('');
    try {
      const [studentsResponse, attendanceResponse] = await Promise.all([
        getStudentsForAttendance({
          class_name: selectedClass.class_name,
          session: selectedClass.session,
          term: selectedClass.term
        }),
        getDailyAttendance({
          date: selectedDate,
          class_name: selectedClass.class_name,
          session: selectedClass.session,
          term: selectedClass.term
        })
      ]);

      if (studentsResponse.success) {
        setStudents(studentsResponse.students || []);

        // Initialize attendance state
        const initialAttendance = {};
        (studentsResponse.students || []).forEach(student => {
          initialAttendance[student.id] = 'present';
        });

        // Update with existing attendance if available
        if (attendanceResponse.success && attendanceResponse.data) {
          attendanceResponse.students.forEach(record => {
            initialAttendance[record.student_id] = record.status;
          });
        }

        setAttendance(initialAttendance);
      } else {
        setError('Failed to load students');
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = parseInt(e.target.value);
    const selected = classes.find(c => c.id === classId);
    setSelectedClass(selected || null);
    setStudents([]);
    setAttendance({});
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    if (students.length === 0) {
      setError('No students to mark attendance for');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        status: attendance[student.id] || 'present'
      }));

      const response = await markDailyAttendance({
        date: selectedDate,
        attendance: attendanceRecords
      });

      if (response.success) {
        setSuccess('Attendance marked successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to mark attendance');
      }
    } catch (err) {
      setError('Error marking attendance');
      console.error('Mark attendance error:', err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-2">
          Record daily student attendance for your classes
        </p>
      </div>

      <div>
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass?.id || ''}
                onChange={handleClassChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select a class --</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.class_name} - {classItem.session} ({classItem.term})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Attendance Form */}
        {selectedClass && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedClass.class_name} - {selectedDate}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total: {students.length} | Present: {presentCount} | Absent: {absentCount}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAll('present')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('absent')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading students...</p>
                  </div>
                ) : students.length === 0 ? (
                  <p className="text-gray-600 text-center py-12">
                    No students found for this class
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.admission_no}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.gender}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center gap-4">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student.id}`}
                                    value="present"
                                    checked={attendance[student.id] === 'present'}
                                    onChange={() => handleAttendanceChange(student.id, 'present')}
                                    className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Present</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`attendance-${student.id}`}
                                    value="absent"
                                    checked={attendance[student.id] === 'absent'}
                                    onChange={() => handleAttendanceChange(student.id, 'absent')}
                                    className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Absent</span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {students.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 rounded-md text-white font-medium ${
                    saving
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarker;
