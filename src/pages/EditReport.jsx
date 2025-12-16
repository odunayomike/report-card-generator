import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StudentForm from '../components/StudentForm';
import { getReportCard, saveReportCard } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function EditReport({ school }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToastContext();
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine if user is a teacher based on the current route
  const isTeacher = location.pathname.startsWith('/teacher');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await getReportCard(id);
      if (response.success) {
        setEditingStudent(response.data);
      } else {
        toast.error('Error loading report: ' + response.message);
        navigate(isTeacher ? '/teacher/students' : '/dashboard/students');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load report for editing. Please try again.');
      navigate(isTeacher ? '/teacher/students' : '/dashboard/students');
    } finally {
      setLoading(false);
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
        toast.success('Report card updated successfully!');
        // Navigate to view the updated report
        const basePath = isTeacher ? '/teacher' : '/dashboard';
        navigate(`${basePath}/reports/${response.student_id}`);
      } else {
        toast.error('Error updating report card: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update report card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!editingStudent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate(isTeacher ? '/teacher/students' : '/dashboard/students')}
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
  );
}
