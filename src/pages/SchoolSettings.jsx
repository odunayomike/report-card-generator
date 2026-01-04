import { useState, useEffect } from 'react';
import { getSchoolProfile, updateSchoolSettings, updateSchoolSession } from '../services/api';
import { useToastContext } from '../context/ToastContext';

export default function SchoolSettings() {
  const { toast } = useToastContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('grading');

  const [gradingScale, setGradingScale] = useState({
    A: [75, 100],
    B: [65, 74],
    C: [55, 64],
    D: [45, 54],
    F: [0, 44]
  });

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');

  const [assessmentTypes, setAssessmentTypes] = useState(['CA', 'Exam']);
  const [newAssessmentType, setNewAssessmentType] = useState('');

  const [assessmentConfig, setAssessmentConfig] = useState({
    ca_max_marks: 40,
    exam_max_marks: 60
  });

  const [academicYear, setAcademicYear] = useState({
    start: '',
    end: ''
  });

  const [reportSettings, setReportSettings] = useState({
    show_logo_on_report: true,
    show_motto_on_report: true,
    header_text: '',
    footer_text: ''
  });

  const [currentSession, setCurrentSession] = useState('');
  const [currentTerm, setCurrentTerm] = useState('First Term');
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getSchoolProfile();
      if (response.success) {
        setProfile(response.data);

        if (response.data.grading_scale) {
          setGradingScale(response.data.grading_scale);
        }

        if (response.data.available_subjects) {
          // Convert all subjects to uppercase
          const uppercaseSubjects = response.data.available_subjects.map(s => s.toUpperCase());
          setSubjects(uppercaseSubjects);
        }

        if (response.data.assessment_types) {
          setAssessmentTypes(response.data.assessment_types);
        }

        if (response.data.ca_max_marks !== undefined || response.data.exam_max_marks !== undefined) {
          setAssessmentConfig({
            ca_max_marks: response.data.ca_max_marks || 40,
            exam_max_marks: response.data.exam_max_marks || 60
          });
        }

        if (response.data.academic_year_start && response.data.academic_year_end) {
          setAcademicYear({
            start: response.data.academic_year_start,
            end: response.data.academic_year_end
          });
        }

        setReportSettings({
          show_logo_on_report: response.data.show_logo_on_report !== false,
          show_motto_on_report: response.data.show_motto_on_report !== false,
          header_text: response.data.header_text || '',
          footer_text: response.data.footer_text || ''
        });

        // Load current session and term
        if (response.data.current_session) {
          setCurrentSession(response.data.current_session);
        }
        if (response.data.current_term) {
          setCurrentTerm(response.data.current_term);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!currentSession.trim()) {
      toast.error('Please enter a session (e.g., 2024/2025)');
      return;
    }

    try {
      setSavingSession(true);
      const response = await updateSchoolSession(currentSession, currentTerm);

      if (response.success) {
        toast.success('Current session updated successfully!');
        loadSettings(); // Reload to get updated data
      } else {
        toast.error(response.message || 'Failed to update session');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update session');
    } finally {
      setSavingSession(false);
    }
  };

  const handleGradingChange = (grade, index, value) => {
    setGradingScale(prev => ({
      ...prev,
      [grade]: [
        index === 0 ? parseInt(value) || 0 : prev[grade][0],
        index === 1 ? parseInt(value) || 0 : prev[grade][1]
      ]
    }));
  };

  const validateGradingScale = () => {
    const grades = ['A', 'B', 'C', 'D', 'F'];
    const errors = [];

    // Check each grade range
    for (const grade of grades) {
      const [min, max] = gradingScale[grade];

      // Check if min is less than max
      if (min >= max) {
        errors.push(`Grade ${grade}: Minimum (${min}) must be less than maximum (${max})`);
      }

      // Check if values are within 0-100
      if (min < 0 || max > 100) {
        errors.push(`Grade ${grade}: Values must be between 0 and 100`);
      }
    }

    // Check for gaps and overlaps
    const sortedGrades = Object.entries(gradingScale).sort((a, b) => b[1][0] - a[1][0]);
    for (let i = 0; i < sortedGrades.length - 1; i++) {
      const [currentGrade, [currentMin, currentMax]] = sortedGrades[i];
      const [nextGrade, [nextMin, nextMax]] = sortedGrades[i + 1];

      // Check for overlap
      if (currentMin <= nextMax) {
        errors.push(`Overlap detected: Grade ${currentGrade} (${currentMin}-${currentMax}) overlaps with ${nextGrade} (${nextMin}-${nextMax})`);
      }

      // Check for gap
      if (currentMin > nextMax + 1) {
        errors.push(`Gap detected between Grade ${currentGrade} and ${nextGrade}: ${nextMax + 1} to ${currentMin - 1} is not covered`);
      }
    }

    return errors;
  };

  const handleSaveGrading = async () => {
    // Validate grading scale before saving
    const validationErrors = validateGradingScale();
    if (validationErrors.length > 0) {
      toast.error('Please fix the following errors:\n\n' + validationErrors.join('\n'), 8000);
      return;
    }

    setSaving(true);
    try {
      const response = await updateSchoolSettings({ grading_scale: gradingScale });
      if (response.success) {
        toast.success('Grading scale updated successfully!');
      } else {
        toast.error('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save grading scale.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = () => {
    const uppercaseSubject = newSubject.trim().toUpperCase();
    if (uppercaseSubject && !subjects.includes(uppercaseSubject)) {
      setSubjects(prev => [...prev, uppercaseSubject]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (index) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSubjects = async () => {
    setSaving(true);
    try {
      const response = await updateSchoolSettings({ available_subjects: subjects });
      if (response.success) {
        toast.success('Subjects updated successfully!');
      } else {
        toast.error('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save subjects.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAssessmentType = () => {
    if (newAssessmentType.trim() && !assessmentTypes.includes(newAssessmentType.trim())) {
      setAssessmentTypes(prev => [...prev, newAssessmentType.trim()]);
      setNewAssessmentType('');
    }
  };

  const handleRemoveAssessmentType = (index) => {
    const typeToRemove = assessmentTypes[index];
    if (typeToRemove === 'CA' || typeToRemove === 'Exam') {
      toast.warning('Cannot remove default assessment types (CA and Exam)');
      return;
    }
    setAssessmentTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAssessmentTypes = async () => {
    setSaving(true);
    try {
      const response = await updateSchoolSettings({ assessment_types: assessmentTypes });
      if (response.success) {
        toast.success('Assessment types updated successfully!');
      } else {
        toast.error('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save assessment types.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssessmentConfigChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setAssessmentConfig(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const validateAssessmentConfig = () => {
    const errors = [];

    if (assessmentConfig.ca_max_marks > 40) {
      errors.push('CA maximum marks cannot exceed 40');
    }
    if (assessmentConfig.exam_max_marks > 60) {
      errors.push('Exam maximum marks cannot exceed 60');
    }
    if (assessmentConfig.ca_max_marks < 0) {
      errors.push('CA maximum marks cannot be negative');
    }
    if (assessmentConfig.exam_max_marks < 0) {
      errors.push('Exam maximum marks cannot be negative');
    }
    if (assessmentConfig.ca_max_marks + assessmentConfig.exam_max_marks !== 100) {
      errors.push(`Total marks must equal 100 (currently: ${assessmentConfig.ca_max_marks + assessmentConfig.exam_max_marks})`);
    }

    return errors;
  };

  const handleSaveAssessmentConfig = async () => {
    const errors = validateAssessmentConfig();
    if (errors.length > 0) {
      toast.error('Please fix the following errors:\n\n' + errors.join('\n'), 8000);
      return;
    }

    setSaving(true);
    try {
      const response = await updateSchoolSettings(assessmentConfig);
      if (response.success) {
        toast.success('Assessment configuration updated successfully!');
      } else {
        toast.error('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save assessment configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademicYear = async () => {
    if (!academicYear.start || !academicYear.end) {
      toast.warning('Please select both start and end dates');
      return;
    }

    setSaving(true);
    try {
      const response = await updateSchoolSettings({
        academic_year_start: academicYear.start,
        academic_year_end: academicYear.end
      });
      if (response.success) {
        toast.success('Academic year updated successfully!');
      } else {
        toast.error('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save academic year.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReportSettings = async () => {
    setSaving(true);
    try {
      const response = await updateSchoolSettings(reportSettings);
      if (response.success) {
        toast.success('Report settings updated successfully!');
      } else {
        toast.error('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save report settings.');
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">School Settings</h2>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Section Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveSection('grading')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'grading'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Grading Scale
            </button>
            <button
              onClick={() => setActiveSection('subjects')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'subjects'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Subjects
            </button>
            <button
              onClick={() => setActiveSection('assessments')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'assessments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Assessment Configuration
            </button>
            <button
              onClick={() => setActiveSection('calendar')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'calendar'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Academic Calendar
            </button>
            <button
              onClick={() => setActiveSection('report')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === 'report'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Report Customization
            </button>
          </nav>
        </div>

        {/* Section Content */}
        <div className="p-8">
          {/* Grading Scale Section */}
          {activeSection === 'grading' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Grading Scale</h3>
              <p className="text-sm text-gray-600 mb-6">Set the score ranges for each grade</p>

              <div className="space-y-4 max-w-2xl">
                {Object.entries(gradingScale).map(([grade, range]) => (
                  <div key={grade} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{grade}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <input
                        type="number"
                        value={range[0]}
                        onChange={(e) => handleGradingChange(grade, 0, e.target.value)}
                        min="0"
                        max="100"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        value={range[1]}
                        onChange={(e) => handleGradingChange(grade, 1, e.target.value)}
                        min="0"
                        max="100"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <span className="text-gray-500 text-sm">({range[0]} - {range[1]})</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveGrading}
                disabled={saving}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Grading Scale'}
              </button>
            </div>
          )}

          {/* Subjects Section */}
          {activeSection === 'subjects' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Available Subjects</h3>
              <p className="text-sm text-gray-600 mb-6">Add or remove subjects offered by your school</p>

              {/* Add Subject */}
              <div className="flex gap-3 mb-6 max-w-md">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="Enter subject name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Subject List */}
              <div className="space-y-2 mb-6">
                {subjects.length === 0 ? (
                  <p className="text-gray-500 text-sm">No subjects added yet</p>
                ) : (
                  subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">{subject}</span>
                      <button
                        onClick={() => handleRemoveSubject(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={handleSaveSubjects}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Subjects'}
              </button>
            </div>
          )}

          {/* Assessment Configuration Section */}
          {activeSection === 'assessments' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Configuration</h3>
              <p className="text-sm text-gray-600 mb-6">
                Manage assessment types and configure scoring limits.
              </p>

              {/* Assessment Types Management */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Assessment Types</h4>
                <p className="text-sm text-gray-600 mb-4">
                  CA and Exam are default types. Add custom types like "Quiz", "Project", "Mid-Term", etc.
                </p>

                {/* Add Assessment Type */}
                <div className="flex gap-3 mb-4 max-w-md">
                  <input
                    type="text"
                    value={newAssessmentType}
                    onChange={(e) => setNewAssessmentType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAssessmentType()}
                    placeholder="Enter assessment type name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddAssessmentType}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Assessment Type List */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {assessmentTypes.map((type, index) => {
                    const isDefault = type === 'CA' || type === 'Exam';
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDefault ? 'bg-indigo-100 border border-indigo-300' : 'bg-white border border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{type}</span>
                          {isDefault && (
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        {!isDefault && (
                          <button
                            onClick={() => handleRemoveAssessmentType(index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveAssessmentTypes}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Assessment Types'}
                </button>
              </div>

              {/* Scoring Configuration */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Scoring Limits for CA and Exam</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Configure the maximum marks for CA and Exam. CA cannot exceed 40 marks and Exam cannot exceed 60 marks. Total must equal 100.
                </p>
              </div>

              <div className="max-w-2xl space-y-6">
                {/* CA Maximum Marks */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Continuous Assessment (CA)</h4>
                      <p className="text-sm text-gray-600 mt-1">Maximum: 40 marks</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={assessmentConfig.ca_max_marks}
                        onChange={(e) => handleAssessmentConfigChange('ca_max_marks', e.target.value)}
                        min="0"
                        max="40"
                        className="w-24 px-4 py-2 text-2xl font-bold text-center border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-2xl font-bold text-gray-600">marks</span>
                    </div>
                  </div>
                  {assessmentConfig.ca_max_marks > 40 && (
                    <p className="text-sm text-red-600 mt-2">⚠ CA marks cannot exceed 40</p>
                  )}
                </div>

                {/* Exam Maximum Marks */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">End of Term Exam</h4>
                      <p className="text-sm text-gray-600 mt-1">Maximum: 60 marks</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={assessmentConfig.exam_max_marks}
                        onChange={(e) => handleAssessmentConfigChange('exam_max_marks', e.target.value)}
                        min="0"
                        max="60"
                        className="w-24 px-4 py-2 text-2xl font-bold text-center border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-2xl font-bold text-gray-600">marks</span>
                    </div>
                  </div>
                  {assessmentConfig.exam_max_marks > 60 && (
                    <p className="text-sm text-red-600 mt-2">⚠ Exam marks cannot exceed 60</p>
                  )}
                </div>

                {/* Total Display */}
                <div className={`p-6 rounded-lg border-2 ${
                  assessmentConfig.ca_max_marks + assessmentConfig.exam_max_marks === 100
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Marks</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold ${
                        assessmentConfig.ca_max_marks + assessmentConfig.exam_max_marks === 100
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {assessmentConfig.ca_max_marks + assessmentConfig.exam_max_marks}
                      </span>
                      <span className="text-2xl text-gray-600">/ 100</span>
                    </div>
                  </div>
                  {assessmentConfig.ca_max_marks + assessmentConfig.exam_max_marks !== 100 && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠ Total must equal 100. Adjust CA or Exam marks.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveAssessmentConfig}
                disabled={saving}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Assessment Configuration'}
              </button>
            </div>
          )}

          {/* Academic Calendar Section */}
          {activeSection === 'calendar' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Calendar</h3>
              <p className="text-sm text-gray-600 mb-6">Set your academic year dates</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year Start</label>
                  <input
                    type="date"
                    value={academicYear.start}
                    onChange={(e) => setAcademicYear(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year End</label>
                  <input
                    type="date"
                    value={academicYear.end}
                    onChange={(e) => setAcademicYear(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAcademicYear}
                disabled={saving}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Academic Year'}
              </button>

              {/* Current Session/Term Section */}
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session & Term</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Set the current academic session and term. This will be used as the default throughout the system.
                  Update this when the session or term changes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Session <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentSession}
                      onChange={(e) => setCurrentSession(e.target.value)}
                      placeholder="e.g., 2024/2025"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: YYYY/YYYY (e.g., 2024/2025)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Term <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentTerm}
                      onChange={(e) => setCurrentTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveSession}
                  disabled={savingSession}
                  className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                >
                  {savingSession ? 'Saving...' : 'Save Session & Term'}
                </button>

                {currentSession && currentTerm && (
                  <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm text-primary-900">
                      <strong>Current:</strong> {currentSession} - {currentTerm}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Customization Section */}
          {activeSection === 'report' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Card Customization</h3>
              <p className="text-sm text-gray-600 mb-6">Customize how report cards are displayed</p>

              <div className="space-y-6 max-w-2xl">
                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Show Logo on Report</h4>
                      <p className="text-sm text-gray-600">Display school logo on printed reports</p>
                    </div>
                    <button
                      onClick={() => setReportSettings(prev => ({ ...prev, show_logo_on_report: !prev.show_logo_on_report }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reportSettings.show_logo_on_report ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          reportSettings.show_logo_on_report ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Show Motto on Report</h4>
                      <p className="text-sm text-gray-600">Display school motto on printed reports</p>
                    </div>
                    <button
                      onClick={() => setReportSettings(prev => ({ ...prev, show_motto_on_report: !prev.show_motto_on_report }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reportSettings.show_motto_on_report ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          reportSettings.show_motto_on_report ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Header and Footer Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Header Text</label>
                  <textarea
                    value={reportSettings.header_text}
                    onChange={(e) => setReportSettings(prev => ({ ...prev, header_text: e.target.value }))}
                    rows={2}
                    placeholder="Optional text to appear at the top of reports"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Text</label>
                  <textarea
                    value={reportSettings.footer_text}
                    onChange={(e) => setReportSettings(prev => ({ ...prev, footer_text: e.target.value }))}
                    rows={2}
                    placeholder="Optional text to appear at the bottom of reports"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={handleSaveReportSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Report Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
