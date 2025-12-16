import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentForm from '../components/StudentForm';
import { saveReportCard } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function CreateReport({ school }) {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToastContext();

  const handleFormSubmit = async (data) => {
    setSaving(true);
    try {
      // Add school_id to the data
      const dataWithSchool = { ...data, school_id: school.id };

      // Save to database
      const response = await saveReportCard(dataWithSchool);

      if (response.success) {
        toast.success('Report card saved successfully!');
        // Navigate to view the created report
        navigate(`/dashboard/reports/${response.student_id}`);
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

  return (
    <div>
      <StudentForm onSubmit={handleFormSubmit} saving={saving} school={school} />
    </div>
  );
}
