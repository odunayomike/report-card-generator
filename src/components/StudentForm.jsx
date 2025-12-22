import { useState, useEffect, useCallback, useRef } from 'react';
import { subjects, affectiveDomains, psychomotorDomains } from '../data/subjects';
import { checkStudent } from '../services/api';

export default function StudentForm({ onSubmit, saving = false, school, initialData = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [studentExists, setStudentExists] = useState(false);
  const [checkingStudent, setCheckingStudent] = useState(false);
  const debounceTimer = useRef(null);

  const [formData, setFormData] = useState({
    // Student Info
    name: '',
    class: '',
    session: '',
    admissionNo: '',
    term: '',
    gender: '',
    guardianEmail: '',
    height: '',
    weight: '',
    clubSociety: '',
    favCol: '',
    photo: null,

    // Attendance
    noOfTimesSchoolOpened: '',
    noOfTimesPresent: '',
    noOfTimesAbsent: '',

    // Subjects with CA, Exam, and Total
    subjects: [],

    // Affective Domain ratings (1-5)
    affectiveDomain: {},

    // Psychomotor Domain ratings (1-5)
    psychomotorDomain: {},

    // Teacher and Principal remarks
    teacherName: '',
    teacherRemark: '',
    principalName: '',
    principalRemark: '',
    nextTermBegins: '',
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Set active subjects if editing
      if (initialData.subjects && initialData.subjects.length > 0) {
        setActiveSubjects(initialData.subjects.map(s => s.name));
      }
    }
  }, [initialData]);

  // Debounced function to check if student exists
  const checkExistingStudent = useCallback(async (admissionNo) => {
    if (admissionNo.length < 3) {
      setStudentExists(false);
      return;
    }

    setCheckingStudent(true);
    try {
      const response = await checkStudent(admissionNo);
      if (response.success && response.exists) {
        setStudentExists(true);
        // Auto-fill all student information if not editing
        if (!initialData) {
          setFormData(prev => ({
            ...prev,
            name: response.student.name || '',
            class: response.student.class || '',
            gender: response.student.gender || '',
            height: response.student.height || '',
            weight: response.student.weight || '',
            clubSociety: response.student.clubSociety || '',
            favCol: response.student.favCol || '',
            photo: response.student.photo || null
          }));
        }
      } else {
        setStudentExists(false);
      }
    } catch (error) {
      console.error('Error checking student:', error);
      setStudentExists(false);
    } finally {
      setCheckingStudent(false);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Debounced check for admission number
    if (name === 'admissionNo') {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer
      debounceTimer.current = setTimeout(() => {
        checkExistingStudent(value);
      }, 500);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubjectChange = (subjectName, field, value) => {
    setFormData(prev => {
      const subjects = [...(prev.subjects || [])];
      const index = subjects.findIndex(s => s.name === subjectName);

      // Validate CA and Exam scores
      let validatedValue = value;
      if (field === 'ca') {
        const numValue = parseFloat(value);
        if (numValue > 40) validatedValue = '40';
        if (numValue < 0) validatedValue = '0';
      } else if (field === 'exam') {
        const numValue = parseFloat(value);
        if (numValue > 60) validatedValue = '60';
        if (numValue < 0) validatedValue = '0';
      }

      let updatedSubject;
      if (index >= 0) {
        updatedSubject = { ...subjects[index], [field]: validatedValue };
      } else {
        updatedSubject = { name: subjectName, [field]: validatedValue };
      }

      // Auto-calculate total when CA or Exam is entered
      if (field === 'ca' || field === 'exam') {
        const ca = field === 'ca' ? parseFloat(validatedValue) || 0 : parseFloat(updatedSubject.ca) || 0;
        const exam = field === 'exam' ? parseFloat(validatedValue) || 0 : parseFloat(updatedSubject.exam) || 0;
        updatedSubject.total = (ca + exam).toString();
      }

      if (index >= 0) {
        subjects[index] = updatedSubject;
      } else {
        subjects.push(updatedSubject);
      }

      return { ...prev, subjects };
    });
  };

  const handleAffectiveChange = (domain, value) => {
    setFormData(prev => ({
      ...prev,
      affectiveDomain: { ...prev.affectiveDomain, [domain]: value }
    }));
  };

  const handlePsychomotorChange = (domain, value) => {
    setFormData(prev => ({
      ...prev,
      psychomotorDomain: { ...prev.psychomotorDomain, [domain]: value }
    }));
  };

  const addSubject = (subjectName) => {
    if (subjectName && !activeSubjects.includes(subjectName)) {
      setActiveSubjects(prev => [...prev, subjectName]);
    }
  };

  const removeSubject = (subjectName) => {
    setActiveSubjects(prev => prev.filter(s => s !== subjectName));
    // Also remove the subject data
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.name !== subjectName)
    }));
  };

  const addCustomSubject = () => {
    if (newSubjectName.trim() && !activeSubjects.includes(newSubjectName.trim())) {
      setActiveSubjects(prev => [...prev, newSubjectName.trim()]);
      setNewSubjectName('');
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      nextStep();
    } else {
      onSubmit(formData);
    }
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Step 1: Student Information & Attendance';
      case 2: return 'Step 2: Subject Grades (Cognitive Domain)';
      case 3: return 'Step 3: Affective & Psychomotor Domain';
      case 4: return 'Step 4: Remarks';
      default: return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
      {/* Left Side - Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-3">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Student Report Card Form</h2>

        {/* Progress Indicator */}
        <div className="mb-8">
          {/* Step numbers and connecting lines */}
          <div className="flex items-center mb-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center" style={{ flex: step < 4 ? '1 1 0%' : '0 0 40px' }}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold flex-shrink-0 ${
                  currentStep >= step
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          {/* Step labels - aligned with numbers above */}
          <div className="flex items-start">
            {[
              { step: 1, label: 'Info & Attendance' },
              { step: 2, label: 'Subjects' },
              { step: 3, label: 'Domains' },
              { step: 4, label: 'Remarks' }
            ].map((item) => (
              <div key={item.step} className="flex justify-start" style={{ flex: item.step < 4 ? '1 1 0%' : '0 0 40px' }}>
                <span className={`text-[10px] leading-tight whitespace-nowrap ${
                  currentStep === item.step ? 'font-semibold text-primary-600' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      <h3 className="text-lg font-semibold text-primary-600 mb-4">{getStepTitle()}</h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: Student Information & Attendance */}
        {currentStep === 1 && (
          <>
            {/* Student Information Section */}
            <section className="border-b pb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-3">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Session</label>
              <input
                type="text"
                name="session"
                placeholder="e.g., 2024/2025"
                value={formData.session}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Admission No.</label>
              <div className="relative">
                <input
                  type="text"
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
                {checkingStudent && (
                  <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                    Checking...
                  </div>
                )}
                {!checkingStudent && studentExists && formData.admissionNo.length >= 3 && (
                  <div className="absolute right-3 top-2.5 text-xs text-green-600 font-semibold">
                    ✓ Existing student
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Term</label>
              <select
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Select Term</option>
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="">Select Gender</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Guardian Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleInputChange}
                placeholder="parent@example.com or parent1@example.com, parent2@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Enter parent/guardian email. You can enter multiple emails separated by commas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Club/Society</label>
              <input
                type="text"
                name="clubSociety"
                value={formData.clubSociety}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fav. Col</label>
              <input
                type="text"
                name="favCol"
                value={formData.favCol}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Student Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>
        </section>

            {/* Attendance Section */}
            <section className="border-b pb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Attendance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">No of Times School Opened</label>
              <input
                type="number"
                name="noOfTimesSchoolOpened"
                value={formData.noOfTimesSchoolOpened}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">No of Times Present</label>
              <input
                type="number"
                name="noOfTimesPresent"
                value={formData.noOfTimesPresent}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">No of Times Absent</label>
              <input
                type="number"
                name="noOfTimesAbsent"
                value={formData.noOfTimesAbsent}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>
        </section>
          </>
        )}

        {/* STEP 2: Subjects and Grades Section */}
        {currentStep === 2 && (
          <section className="border-b pb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Subject Grades (Cognitive Domain)</h3>
          <p className="text-xs text-gray-600 mb-3">Enter CA (Continuous Assessment - max 40) and Exam (max 60). Total will be calculated automatically.</p>

          {/* Add Subjects Interface */}
          <div className="mb-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Select Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    type="button"
                    onClick={() => addSubject(subject.name)}
                    disabled={activeSubjects.includes(subject.name)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      activeSubjects.includes(subject.name)
                        ? 'bg-green-100 border-green-400 text-green-700 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-400'
                    }`}
                  >
                    {activeSubjects.includes(subject.name) ? '✓ ' : '+ '}{subject.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Subject */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Add Custom Subject</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                  placeholder="Enter subject name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
                <button
                  type="button"
                  onClick={addCustomSubject}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-xs"
                >
                  Add Subject
                </button>
              </div>
            </div>

            {activeSubjects.length > 0 && (
              <div className="text-xs text-gray-600">
                <strong>{activeSubjects.length}</strong> subject(s) selected
              </div>
            )}
          </div>

          {/* Subjects Table */}
          {activeSubjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r">Subject</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-r">CA (40)</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-r">Exam (60)</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700 border-r">Total (100)</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubjects.map((subjectName) => {
                    const subjectData = formData.subjects.find(s => s.name === subjectName);
                    return (
                      <tr key={subjectName} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-700 border-r font-medium">{subjectName}</td>
                        <td className="px-4 py-2 border-r">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            placeholder="CA"
                            value={subjectData?.ca || ''}
                            onChange={(e) => handleSubjectChange(subjectName, 'ca', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                          />
                        </td>
                        <td className="px-4 py-2 border-r">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            placeholder="Exam"
                            value={subjectData?.exam || ''}
                            onChange={(e) => handleSubjectChange(subjectName, 'exam', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                          />
                        </td>
                        <td className="px-4 py-2 border-r">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Total"
                            value={subjectData?.total || ''}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center bg-gray-100 font-semibold text-primary-600 cursor-not-allowed text-xs"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeSubject(subjectName)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No subjects selected. Please select subjects from above.</p>
            </div>
          )}
        </section>
        )}

        {/* STEP 3: Affective & Psychomotor Domain */}
        {currentStep === 3 && (
          <>
            {/* Affective Domain Section */}
            <section className="border-b pb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Affective Domain</h3>
          <p className="text-xs text-gray-600 mb-3">Rate each trait on a scale of 1-5 (1 = Poor, 5 = Excellent). Leave blank if not applicable.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {affectiveDomains.map((domain) => (
              <div key={domain}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{domain}</label>
                <select
                  onChange={(e) => handleAffectiveChange(domain, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Psychomotor Domain Section */}
        <section className="border-b pb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Psychomotor Domain</h3>
          <p className="text-xs text-gray-600 mb-3">Rate each skill on a scale of 1-5 (1 = Poor, 5 = Excellent). Leave blank if not applicable.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {psychomotorDomains.map((domain) => (
              <div key={domain}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{domain}</label>
                <select
                  onChange={(e) => handlePsychomotorChange(domain, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            ))}
          </div>
        </section>
          </>
        )}

        {/* STEP 4: Teacher and Principal Remarks */}
        {currentStep === 4 && (
          <section className="border-b pb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3">Remarks</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teacher's Name</label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teacher's Remark</label>
              <textarea
                name="teacherRemark"
                value={formData.teacherRemark}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Principal's Name</label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Principal's Remark</label>
              <textarea
                name="principalRemark"
                value={formData.principalRemark}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Next Term Begins</label>
              <input
                type="date"
                name="nextTermBegins"
                value={formData.nextTermBegins}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              />
            </div>
          </div>
        </section>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold shadow-md text-sm"
            >
              ← Previous
            </button>
          )}

          <div className={currentStep === 1 ? 'ml-auto' : ''}>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {saving ? 'Saving...' : (currentStep < 4 ? 'Next →' : 'Generate Report Card')}
            </button>
          </div>
        </div>
      </form>
      </div>

      {/* Right Side - Live Preview */}
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6 h-fit max-h-screen overflow-y-auto overflow-x-hidden lg:col-span-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Preview</h2>
        <div className="transform scale-[0.6] origin-top-left w-[167%]">
          <ReportCardPreview data={formData} activeSubjects={activeSubjects} school={school} />
        </div>
      </div>
    </div>
  );
}

// Mini Report Card Preview Component
function ReportCardPreview({ data, activeSubjects, school }) {
  const getGradeAndRemark = (total) => {
    const score = parseFloat(total) || 0;
    if (score >= 70) return { grade: 'A', remark: 'EXCELLENT' };
    if (score >= 60) return { grade: 'B', remark: 'VERY GOOD' };
    if (score >= 50) return { grade: 'C', remark: 'GOOD' };
    if (score >= 40) return { grade: 'D', remark: 'FAIR' };
    return { grade: 'F', remark: 'FAIL' };
  };

  const calculateOverallPerformance = () => {
    const validSubjects = data.subjects.filter(s => s.total);
    if (validSubjects.length === 0) return { total: 0, obtainable: 0, grade: 'N/A', remark: 'N/A' };

    const totalObtained = validSubjects.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
    const totalObtainable = validSubjects.length * 100;
    const average = totalObtained / validSubjects.length;

    return {
      total: totalObtained.toFixed(0),
      obtainable: totalObtainable,
      average: average.toFixed(2),
      ...getGradeAndRemark(average)
    };
  };

  const performance = calculateOverallPerformance();
  const subjectsWithGrades = data.subjects.filter(s => s.total);

  return (
    <div className="bg-white p-8 border-4 border-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
            {school?.logo ? (
              <img src={school.logo} alt="School Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold">LOGO</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">{school?.school_name?.toUpperCase() || 'SCHOOL NAME'}</h1>
            <p className="text-xs mt-1">{school?.address || 'School Address'}</p>
            <p className="text-xs">TEL: {school?.phone || 'N/A'}, Email: {school?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Student Photo */}
        <div className="w-24 h-28 border-2 border-black flex items-center justify-center bg-gray-100">
          {data.photo ? (
            <img src={data.photo} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500">PHOTO</span>
          )}
        </div>
      </div>

      {/* Report Title */}
      <div className="text-center mb-4 pb-2 border-b-2 border-black">
        <h2 className="text-sm font-bold">{data.term?.toUpperCase() || 'TERM'} STUDENT'S PERFORMANCE REPORT</h2>
      </div>

      {/* Student Information Grid */}
      <div className="grid grid-cols-2 gap-x-8 text-xs mb-4 pb-4 border-b-2 border-black">
        <div className="space-y-1">
          <div className="flex">
            <span className="font-bold w-32">NAME:</span>
            <span className="flex-1 border-b border-black">{data.name?.toUpperCase() || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-32">CLASS:</span>
            <span className="flex-1 border-b border-black">{data.class || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-32">AGE:</span>
            <span className="flex-1 border-b border-black">{data.age || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-32">CLUB/SOCIETY:</span>
            <span className="flex-1 border-b border-black">{data.clubSociety || ''}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex">
            <span className="font-bold w-32">GENDER:</span>
            <span className="flex-1 border-b border-black">{data.gender || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-32">SESSION:</span>
            <span className="flex-1 border-b border-black">{data.session || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-32">ADMISSION NO.:</span>
            <span className="flex-1 border-b border-black">{data.admissionNo || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">HT:</span>
            <span className="w-20 border-b border-black">{data.height || ''}</span>
            <span className="font-bold w-24 ml-2">WT:</span>
            <span className="w-20 border-b border-black">{data.weight || ''}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-32">FAV. COL:</span>
            <span className="flex-1 border-b border-black">{data.favCol || ''}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Column - Cognitive Domain */}
        <div className="col-span-2">
          <table className="w-full border-2 border-black text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-1 text-center font-bold" rowSpan="2">COGNITIVE DOMAIN</th>
                <th className="border border-black p-1 text-center font-bold" colSpan="3">SCORE</th>
                <th className="border border-black p-1 text-center font-bold" rowSpan="2">GRADE</th>
                <th className="border border-black p-1 text-center font-bold" rowSpan="2">REMARKS</th>
              </tr>
              <tr className="bg-gray-200">
                <th className="border border-black p-1 text-center text-[10px]">CA<br/>40</th>
                <th className="border border-black p-1 text-center text-[10px]">EXAM<br/>60</th>
                <th className="border border-black p-1 text-center text-[10px]">TOTAL<br/>100</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-1 font-bold bg-gray-100">SUBJECTS</td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
                <td className="border border-black"></td>
              </tr>
              {activeSubjects.length > 0 ? (
                activeSubjects.map((subjectName, index) => {
                  const subject = data.subjects.find(s => s.name === subjectName);
                  const { grade, remark } = getGradeAndRemark(subject?.total);
                  return (
                    <tr key={index}>
                      <td className="border border-black p-1 text-[10px]">{subjectName}</td>
                      <td className="border border-black p-1 text-center">{subject?.ca || ''}</td>
                      <td className="border border-black p-1 text-center">{subject?.exam || ''}</td>
                      <td className="border border-black p-1 text-center font-bold">{subject?.total || ''}</td>
                      <td className="border border-black p-1 text-center font-bold">{subject?.total ? grade : ''}</td>
                      <td className="border border-black p-1 text-center text-[10px]">{subject?.total ? remark : ''}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="border border-black p-2 text-center text-gray-400 italic">
                    No subjects selected yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Performance Summary */}
          <div className="mt-4 border-2 border-black">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-1 font-bold" colSpan="4">PERFORMANCE SUMMARY</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold">Total Obtained:</td>
                  <td className="border border-black p-1 text-center">{performance.total}</td>
                  <td className="border border-black p-1 font-bold">Total Obtainable:</td>
                  <td className="border border-black p-1 text-center">{performance.obtainable}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold" colSpan="2">GRADE:</td>
                  <td className="border border-black p-1 text-center font-bold text-lg" colSpan="2">{performance.grade}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold" colSpan="2">REMARK:</td>
                  <td className="border border-black p-1 text-center font-bold" colSpan="2">{performance.remark}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Attendance, Affective, and Psychomotor */}
        <div className="space-y-4">
          {/* Attendance Summary */}
          <div className="border-2 border-black">
            <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
              ATTENDANCE SUMMARY
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="border border-black p-1 text-[10px]">School Opened</td>
                  <td className="border border-black p-1 text-center">{data.noOfTimesSchoolOpened || ''}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-[10px]">Times Present</td>
                  <td className="border border-black p-1 text-center">{data.noOfTimesPresent || ''}</td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-[10px]">Times Absent</td>
                  <td className="border border-black p-1 text-center">{data.noOfTimesAbsent || ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Affective Domain */}
          {Object.keys(data.affectiveDomain || {}).length > 0 && (
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                AFFECTIVE DOMAIN
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-[10px]"></th>
                    <th className="border border-black p-1 text-center text-[10px]">1</th>
                    <th className="border border-black p-1 text-center text-[10px]">2</th>
                    <th className="border border-black p-1 text-center text-[10px]">3</th>
                    <th className="border border-black p-1 text-center text-[10px]">4</th>
                    <th className="border border-black p-1 text-center text-[10px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.affectiveDomain || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border border-black p-1 text-[9px]">{key}</td>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <td key={rating} className="border border-black p-1 text-center text-[10px]">
                          {value == rating ? '✓' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Psychomotor Domain */}
          {Object.keys(data.psychomotorDomain || {}).length > 0 && (
            <div className="border-2 border-black">
              <div className="bg-gray-200 border-b-2 border-black p-1 text-center font-bold text-xs">
                PSYCHOMOTOR DOMAIN
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-[10px]"></th>
                    <th className="border border-black p-1 text-center text-[10px]">1</th>
                    <th className="border border-black p-1 text-center text-[10px]">2</th>
                    <th className="border border-black p-1 text-center text-[10px]">3</th>
                    <th className="border border-black p-1 text-center text-[10px]">4</th>
                    <th className="border border-black p-1 text-center text-[10px]">5</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.psychomotorDomain || {}).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border border-black p-1 text-[9px]">{key}</td>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <td key={rating} className="border border-black p-1 text-center text-[10px]">
                          {value == rating ? '✓' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Teacher and Principal Remarks */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="border-2 border-black">
          <div className="flex">
            <span className="font-bold p-2 border-r-2 border-black w-32">Teacher's Remark:</span>
            <span className="p-2 flex-1 italic">{data.teacherRemark || ''}</span>
          </div>
        </div>

        <div className="border-2 border-black">
          <div className="flex">
            <span className="font-bold p-2 border-r-2 border-black w-32">Principal's Remark:</span>
            <span className="p-2 flex-1 italic">{data.principalRemark || ''}</span>
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <span className="font-bold">Next Term:</span>
            <span className="ml-2">{data.nextTermBegins || ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
