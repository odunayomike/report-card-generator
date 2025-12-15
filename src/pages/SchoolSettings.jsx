import { useState, useEffect } from 'react';
import { getSchoolProfile, updateSchoolSettings } from '../services/api';

export default function SchoolSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('grading');

  const [gradingScale, setGradingScale] = useState({
    A: [90, 100],
    B: [80, 89],
    C: [70, 79],
    D: [60, 69],
    F: [0, 59]
  });

  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');

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
          setSubjects(response.data.available_subjects);
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
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load settings.');
    } finally {
      setLoading(false);
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

  const handleSaveGrading = async () => {
    setSaving(true);
    try {
      const response = await updateSchoolSettings({ grading_scale: gradingScale });
      if (response.success) {
        alert('Grading scale updated successfully!');
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save grading scale.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects(prev => [...prev, newSubject.trim()]);
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
        alert('Subjects updated successfully!');
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save subjects.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademicYear = async () => {
    if (!academicYear.start || !academicYear.end) {
      alert('Please select both start and end dates');
      return;
    }

    setSaving(true);
    try {
      const response = await updateSchoolSettings({
        academic_year_start: academicYear.start,
        academic_year_end: academicYear.end
      });
      if (response.success) {
        alert('Academic year updated successfully!');
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save academic year.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReportSettings = async () => {
    setSaving(true);
    try {
      const response = await updateSchoolSettings(reportSettings);
      if (response.success) {
        alert('Report settings updated successfully!');
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save report settings.');
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
