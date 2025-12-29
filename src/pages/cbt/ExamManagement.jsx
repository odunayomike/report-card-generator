import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const ExamManagement = () => {
  const { classes: teacherClasses } = useOutletContext();
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState(['CA', 'Exam']);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingExam, setEditingExam] = useState(null);

  const [examForm, setExamForm] = useState({
    exam_title: '',
    subject: '',
    class_name: '',
    session: '',
    term: '',
    assessment_type: 'ca',
    duration_minutes: 30,
    total_score: 10,
    instructions: 'Answer all questions to the best of your ability.',
    shuffle_questions: true,
    shuffle_options: true,
    show_results: false,
    start_datetime: '',
    end_datetime: '',
    questions: []
  });

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAddAssessmentType, setShowAddAssessmentType] = useState(false);
  const [newAssessmentTypeName, setNewAssessmentTypeName] = useState('');
  const [assessmentTypeError, setAssessmentTypeError] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [questionFilter, setQuestionFilter] = useState({
    subject: '',
    difficulty: '',
    topic: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(6);
  const [maxScores, setMaxScores] = useState({
    ca: 30,
    exam: 70
  });
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [examToPublish, setExamToPublish] = useState(null);
  const [examToDelete, setExamToDelete] = useState(null);

  useEffect(() => {
    if (teacherClasses) {
      setClasses(teacherClasses);
    }
  }, [teacherClasses]);

  useEffect(() => {
    loadExams();
    loadSchoolSettings();
  }, []);

  const loadSchoolSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-session`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated && data.school) {
        if (data.school.assessment_types) {
          setAssessmentTypes(data.school.assessment_types);
        }
        if (data.school.available_subjects) {
          // Convert all subjects to uppercase
          const uppercaseSubjects = data.school.available_subjects.map(s => s.toUpperCase());
          setAvailableSubjects(uppercaseSubjects);
        }
        // Load max scores for CA and Exam from Assessment Configuration
        if (data.school.ca_max_marks !== undefined && data.school.exam_max_marks !== undefined) {
          setMaxScores({
            ca: data.school.ca_max_marks,
            exam: data.school.exam_max_marks
          });
        }
      }
    } catch (err) {
      console.error('Failed to load school settings:', err);
      // Use defaults if loading fails
    }
  };

  const getMaxScoreForAssessment = () => {
    const type = examForm.assessment_type.toLowerCase();
    if (type === 'ca') return maxScores.ca;
    if (type === 'exam') return maxScores.exam;
    // For custom assessment types, default to CA max
    return maxScores.ca;
  };

  const getPerQuestionScore = () => {
    if (examForm.questions.length === 0) return 0;
    return (examForm.total_score / examForm.questions.length).toFixed(2);
  };

  const handleAddNewAssessmentType = async () => {
    setAssessmentTypeError('');

    if (!newAssessmentTypeName.trim()) {
      return;
    }

    const trimmedName = newAssessmentTypeName.trim();

    // Check if already exists
    if (assessmentTypes.some(type => type.toLowerCase() === trimmedName.toLowerCase())) {
      setAssessmentTypeError('This assessment type already exists');
      return;
    }

    try {
      const updatedTypes = [...assessmentTypes, trimmedName];

      const response = await fetch(`${API_BASE_URL}/school/update-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assessment_types: updatedTypes })
      });

      const data = await response.json();

      if (data.success) {
        setAssessmentTypes(updatedTypes);
        setExamForm({
          ...examForm,
          assessment_type: trimmedName.toLowerCase().replace(/\s+/g, '_')
        });
        setNewAssessmentTypeName('');
        setShowAddAssessmentType(false);
        setAssessmentTypeError('');
      } else {
        setAssessmentTypeError('Failed to add assessment type: ' + data.message);
      }
    } catch (err) {
      console.error('Error adding assessment type:', err);
      setAssessmentTypeError('Failed to add assessment type. Please try again.');
    }
  };

  const handleAddNewSubject = async () => {
    setSubjectError('');

    if (!newSubjectName.trim()) {
      return;
    }

    const uppercaseSubject = newSubjectName.trim().toUpperCase();

    // Check if already exists
    if (availableSubjects.includes(uppercaseSubject)) {
      setSubjectError('This subject already exists');
      return;
    }

    try {
      const updatedSubjects = [...availableSubjects, uppercaseSubject];

      const response = await fetch(`${API_BASE_URL}/school/update-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ available_subjects: updatedSubjects })
      });

      const data = await response.json();

      if (data.success) {
        setAvailableSubjects(updatedSubjects);
        setExamForm({
          ...examForm,
          subject: uppercaseSubject
        });
        setNewSubjectName('');
        setShowAddSubject(false);
        setSubjectError('');
      } else {
        setSubjectError('Failed to add subject: ' + data.message);
      }
    } catch (err) {
      console.error('Error adding subject:', err);
      setSubjectError('Failed to add subject. Please try again.');
    }
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cbt/exams`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setExams(data.exams);
      } else {
        setError(data.message || 'Failed to load exams');
      }
    } catch (err) {
      setError('Failed to load exams');
      console.error('Load exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForSubject = async (subject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cbt/questions?subject=${encodeURIComponent(subject)}`, {
        credentials: 'include'
      });
      const data = await response.json();


      if (data.success) {
        setAvailableQuestions(data.questions);
      } else {
        console.error('Failed to load questions:', data.message);
      }
    } catch (err) {
      console.error('Load questions error:', err);
    }
  };

  const loadStudentsForClass = async (className, session, term) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cbt/get-students?class_name=${encodeURIComponent(className)}&session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`,
        { credentials: 'include' }
      );
      const data = await response.json();


      if (data.success) {
        setStudents(data.students);
      } else {
        console.error('Failed to load students:', data.message);
        setStudents([]);
      }
    } catch (err) {
      console.error('Load students error:', err);
      setStudents([]);
    }
  };

  const handleStepChange = async (newStep) => {
    if (newStep === 2 && examForm.subject) {
      await loadQuestionsForSubject(examForm.subject);
    }
    if (newStep === 3 && examForm.class_name && examForm.session && examForm.term) {
      await loadStudentsForClass(examForm.class_name, examForm.session, examForm.term);
    }
    setCurrentStep(newStep);
  };

  const handleCreateExam = async () => {
    setError('');
    setIsCreatingExam(true);

    try {
      if (editingExam) {
        // Update existing exam
        const updateResponse = await fetch(`${API_BASE_URL}/cbt/exams`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: editingExam,
            action: 'update',
            exam_title: examForm.exam_title,
            instructions: examForm.instructions,
            duration_minutes: examForm.duration_minutes,
            total_score: examForm.total_score,
            shuffle_questions: examForm.shuffle_questions ? 1 : 0,
            shuffle_options: examForm.shuffle_options ? 1 : 0,
            show_results_immediately: examForm.show_results ? 0 : 1, // Checkbox is "Hide results", so checked=0 (hide), unchecked=1 (show)
            start_datetime: examForm.start_datetime,
            end_datetime: examForm.end_datetime
          })
        });

        const updateData = await updateResponse.json();

        if (updateData.success) {
          // Update questions if changed
          if (examForm.questions.length > 0) {
            await fetch(`${API_BASE_URL}/cbt/exams`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                id: editingExam,
                action: 'add_questions',
                questions: examForm.questions
              })
            });
          }

          // Update student assignments
          if (selectedStudents.length > 0) {
            await fetch(`${API_BASE_URL}/cbt/exams`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                id: editingExam,
                action: 'assign_students',
                student_ids: selectedStudents
              })
            });
          }

          setShowWizard(false);
          setEditingExam(null);
          resetForm();
          loadExams();
        } else {
          setError(updateData.message || 'Failed to update exam');
        }
      } else {
        // Create new exam
        const response = await fetch(`${API_BASE_URL}/cbt/exams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...examForm,
            shuffle_questions: examForm.shuffle_questions ? 1 : 0,
            shuffle_options: examForm.shuffle_options ? 1 : 0,
            show_results: examForm.show_results ? 0 : 1 // Checkbox is "Hide results", so checked=0 (hide), unchecked=1 (show)
          })
        });

        const data = await response.json();

        if (data.success) {
          const examId = data.exam_id;

          // Assign students
          if (selectedStudents.length > 0) {
            const assignResponse = await fetch(`${API_BASE_URL}/cbt/exams`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                id: examId,
                action: 'assign_students',
                student_ids: selectedStudents
              })
            });

            const assignData = await assignResponse.json();

            if (!assignData.success) {
              console.error('Failed to assign students:', assignData.message);
              setError('Exam created but failed to assign students: ' + assignData.message);
            }
          } else {
            console.warn('No students selected for assignment');
          }

          setShowWizard(false);
          resetForm();
          loadExams();
        } else {
          setError(data.message || 'Failed to create exam');
        }
      }
    } catch (err) {
      setError(editingExam ? 'Failed to update exam' : 'Failed to create exam');
      console.error('Create/Update exam error:', err);
    } finally {
      setIsCreatingExam(false);
    }
  };

  const handlePublishExam = (examId) => {
    setExamToPublish(examId);
  };

  const confirmPublishExam = async () => {
    const examId = examToPublish;
    setExamToPublish(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cbt/exams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: examId, action: 'publish' })
      });

      const data = await response.json();

      if (data.success) {
        loadExams();
      } else {
        setError(data.message || 'Failed to publish exam');
      }
    } catch (err) {
      setError('Failed to publish exam');
      console.error('Publish exam error:', err);
    }
  };

  const handleEditExam = async (examId) => {
    try {
      // Fetch exam details
      const response = await fetch(`${API_BASE_URL}/cbt/exams?id=${examId}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const exam = data.exam;

        // Fetch questions for this exam
        const questionsResponse = await fetch(`${API_BASE_URL}/cbt/questions?exam_id=${examId}`, {
          credentials: 'include'
        });
        const questionsData = await questionsResponse.json();

        // Extract question IDs
        const questionIds = questionsData.success ? questionsData.questions.map(q => q.id) : [];

        // Extract assigned student IDs
        const studentIds = exam.assigned_students_list ? exam.assigned_students_list.map(s => s.student_id) : [];

        // Populate form with exam data
        setExamForm({
          exam_title: exam.exam_title || '',
          subject: exam.subject || '',
          class_name: exam.class || '',
          session: exam.session || '',
          term: exam.term || '',
          assessment_type: exam.assessment_type || 'ca',
          duration_minutes: exam.duration_minutes || 30,
          total_score: exam.total_score || 10,
          instructions: exam.instructions || '',
          shuffle_questions: exam.shuffle_questions == 1 || exam.shuffle_questions === true,
          shuffle_options: exam.shuffle_options == 1 || exam.shuffle_options === true,
          show_results: exam.show_results_immediately == 0, // Checkbox is "Hide results", so 0=checked, 1=unchecked
          start_datetime: exam.start_datetime || '',
          end_datetime: exam.end_datetime || '',
          questions: questionIds
        });

        setEditingExam(examId);
        setSelectedStudents(studentIds);

        // Load questions and students for the selected class
        if (exam.subject) {
          loadQuestionsForSubject(exam.subject);
        }
        if (exam.class && exam.session && exam.term) {
          loadStudentsForClass(exam.class, exam.session, exam.term);
        }

        setShowWizard(true);
        setCurrentStep(1);
      } else {
        setError(data.message || 'Failed to load exam');
      }
    } catch (err) {
      setError('Failed to load exam for editing');
      console.error('Edit exam error:', err);
    }
  };

  const handleDeleteExam = (examId) => {
    setExamToDelete(examId);
  };

  const confirmDeleteExam = async () => {
    const examId = examToDelete;
    setExamToDelete(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cbt/exams?id=${examId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        loadExams();
      } else {
        setError(data.message || 'Failed to delete exam');
      }
    } catch (err) {
      setError('Failed to delete exam');
      console.error('Delete exam error:', err);
    }
  };

  const resetForm = () => {
    setExamForm({
      exam_title: '',
      subject: '',
      class_name: '',
      session: '',
      term: '',
      assessment_type: 'ca',
      duration_minutes: 30,
      total_score: 10,
      instructions: 'Answer all questions to the best of your ability.',
      shuffle_questions: true,
      shuffle_options: true,
      show_results: false,
      start_datetime: '',
      end_datetime: '',
      questions: []
    });
    setCurrentStep(1);
    setSelectedStudents([]);
    setAvailableQuestions([]);
    setStudents([]);
    setEditingExam(null);
  };

  const toggleQuestion = (questionId) => {
    if (examForm.questions.includes(questionId)) {
      setExamForm({
        ...examForm,
        questions: examForm.questions.filter(id => id !== questionId)
      });
    } else {
      setExamForm({
        ...examForm,
        questions: [...examForm.questions, questionId]
      });
    }
  };

  const selectAllQuestions = () => {
    const filteredQuestions = getFilteredQuestions();
    const filteredQuestionIds = filteredQuestions.map(q => q.id);

    // Check if all filtered questions are already selected
    const allSelected = filteredQuestionIds.every(id => examForm.questions.includes(id));

    if (allSelected) {
      // Deselect all filtered questions
      setExamForm({
        ...examForm,
        questions: examForm.questions.filter(id => !filteredQuestionIds.includes(id))
      });
    } else {
      // Select all filtered questions (add only those not already selected)
      const newQuestions = [...examForm.questions];
      filteredQuestionIds.forEach(id => {
        if (!newQuestions.includes(id)) {
          newQuestions.push(id);
        }
      });
      setExamForm({
        ...examForm,
        questions: newQuestions
      });
    }
  };

  const getFilteredQuestions = () => {
    return availableQuestions.filter(question => {
      if (questionFilter.subject && question.subject !== questionFilter.subject) {
        return false;
      }
      if (questionFilter.difficulty && question.difficulty !== questionFilter.difficulty) {
        return false;
      }
      if (questionFilter.topic && !question.topic?.toLowerCase().includes(questionFilter.topic.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const toggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-100 border-t-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  CBT Exam Management
                </h1>
                <p className="text-sm text-gray-500">Create, manage and publish computer-based tests</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowWizard(true);
              resetForm();
            }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Exam
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Publish Exam Confirmation Modal */}
      {examToPublish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full border border-gray-200">
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Publish Exam</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to publish this exam? Students will be able to take it once published.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setExamToPublish(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPublishExam}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium"
                >
                  Publish Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full border border-gray-200">
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Delete Exam</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete this exam? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setExamToDelete(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteExam}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium"
                >
                  Delete Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Creation Wizard */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Wizard Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-primary-200 px-5 py-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingExam ? 'Edit Exam' : 'Create New Exam'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowWizard(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-white/50 p-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Steps */}
              <div className="flex items-center justify-between">
                {['Exam Details', 'Select Questions', 'Assign Students', 'Review'].map((step, idx) => (
                  <div key={idx} className="flex items-center flex-1">
                    <div className={`flex items-center ${idx < 3 ? 'flex-1' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        currentStep > idx + 1 ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white' :
                        currentStep === idx + 1 ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white ring-2 ring-primary-200' :
                        'bg-white text-gray-400 border-2 border-gray-200'
                      }`}>
                        {currentStep > idx + 1 ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`ml-2 text-xs ${currentStep === idx + 1 ? 'font-semibold text-primary-700' : 'text-gray-600'}`}>
                        {step}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${currentStep > idx + 1 ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 1: Exam Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title *</label>
                    <input
                      type="text"
                      value={examForm.exam_title}
                      onChange={(e) => setExamForm({ ...examForm, exam_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Mathematics CA Test 1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <div className="flex gap-2">
                        <select
                          value={examForm.subject}
                          onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">-- Select a subject --</option>
                          {availableSubjects.map((subject, index) => (
                            <option key={index} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddSubject(!showAddSubject)}
                          className="px-4 py-2 bg-primary-50 text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-100 transition-colors whitespace-nowrap"
                          title="Add new subject"
                        >
                          + Add New
                        </button>
                      </div>

                      {/* Inline Add Subject Form */}
                      {showAddSubject && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Add New Subject</h5>
                          {subjectError && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                              {subjectError}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSubjectName}
                              onChange={(e) => {
                                setNewSubjectName(e.target.value);
                                setSubjectError('');
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewSubject();
                                }
                              }}
                              placeholder="e.g., Mathematics, Physics"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={handleAddNewSubject}
                              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow transition-colors"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddSubject(false);
                                setNewSubjectName('');
                                setSubjectError('');
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Subject will be saved in UPPERCASE and available for all exams and questions.
                          </p>
                        </div>
                      )}

                      {availableSubjects.length === 0 && !showAddSubject && (
                        <p className="mt-1 text-sm text-gray-500">No subjects configured. Click "+ Add New" to add subjects.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type *</label>
                      <div className="flex gap-2">
                        <select
                          value={examForm.assessment_type}
                          onChange={(e) => setExamForm({ ...examForm, assessment_type: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {assessmentTypes.map((type) => (
                            <option key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddAssessmentType(!showAddAssessmentType)}
                          className="px-4 py-2 bg-primary-50 text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-100 transition-colors whitespace-nowrap"
                          title="Add new assessment type"
                        >
                          + Add New
                        </button>
                      </div>

                      {/* Inline Add Assessment Type Form */}
                      {showAddAssessmentType && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Add New Assessment Type</h5>
                          {assessmentTypeError && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                              {assessmentTypeError}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newAssessmentTypeName}
                              onChange={(e) => {
                                setNewAssessmentTypeName(e.target.value);
                                setAssessmentTypeError('');
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewAssessmentType();
                                }
                              }}
                              placeholder="e.g., Quiz, Project, Mid-Term"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={handleAddNewAssessmentType}
                              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow transition-colors"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddAssessmentType(false);
                                setNewAssessmentTypeName('');
                                setAssessmentTypeError('');
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            This will be saved to your school settings and available for all exams.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                      <select
                        value={examForm.class_name}
                        onChange={(e) => setExamForm({ ...examForm, class_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">-- Select class --</option>
                        {[...new Set(classes.map(c => c.class_name))].filter(Boolean).map((className, idx) => (
                          <option key={idx} value={className}>
                            {className}
                          </option>
                        ))}
                      </select>
                      {classes.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">No classes available.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session *</label>
                      <select
                        value={examForm.session}
                        onChange={(e) => setExamForm({ ...examForm, session: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">-- Select session --</option>
                        {[...new Set(classes.map(c => c.session))].filter(Boolean).map((session, idx) => (
                          <option key={idx} value={session}>
                            {session}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                      <select
                        value={examForm.term}
                        onChange={(e) => setExamForm({ ...examForm, term: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">-- Select term --</option>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={examForm.start_datetime}
                        onChange={(e) => setExamForm({ ...examForm, start_datetime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={examForm.end_datetime}
                        onChange={(e) => setExamForm({ ...examForm, end_datetime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                      <input
                        type="number"
                        value={examForm.duration_minutes}
                        onChange={(e) => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) || 0 })}
                        min="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Score (Max: {getMaxScoreForAssessment()}) *
                      </label>
                      <input
                        type="number"
                        value={examForm.total_score}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const maxScore = getMaxScoreForAssessment();
                          setExamForm({
                            ...examForm,
                            total_score: Math.min(value, maxScore)
                          });
                        }}
                        min="1"
                        max={getMaxScoreForAssessment()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Each question will be worth {examForm.questions.length > 0 ? getPerQuestionScore() : '—'} marks
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <textarea
                      value={examForm.instructions}
                      onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={examForm.shuffle_questions}
                        onChange={(e) => setExamForm({ ...examForm, shuffle_questions: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Shuffle question order for each student</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={examForm.shuffle_options}
                        onChange={(e) => setExamForm({ ...examForm, shuffle_options: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Shuffle answer options</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={examForm.show_results}
                        onChange={(e) => setExamForm({ ...examForm, show_results: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Hide results after submission (students cannot view results)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Select Questions */}
              {currentStep === 2 && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Select questions for this exam. {examForm.questions.length} question(s) selected.
                    </p>
                    {availableQuestions.length > 0 && (
                      <button
                        onClick={selectAllQuestions}
                        className="text-sm text-green-600 hover:underline font-medium"
                      >
                        {getFilteredQuestions().every(q => examForm.questions.includes(q.id)) && getFilteredQuestions().length > 0
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    )}
                  </div>

                  {availableQuestions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No questions found for {examForm.subject}.</p>
                      <Link to="/teacher/cbt/questions" className="text-green-600 hover:underline mt-2 inline-block">
                        Go to Question Bank to create questions
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Filters */}
                      <div className="mb-4 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Subject</label>
                          <select
                            value={questionFilter.subject}
                            onChange={(e) => setQuestionFilter({ ...questionFilter, subject: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">All Subjects</option>
                            {[...new Set(availableQuestions.map(q => q.subject))].map((subject, idx) => (
                              <option key={idx} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Difficulty</label>
                          <select
                            value={questionFilter.difficulty}
                            onChange={(e) => setQuestionFilter({ ...questionFilter, difficulty: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Search by Topic</label>
                          <input
                            type="text"
                            value={questionFilter.topic}
                            onChange={(e) => setQuestionFilter({ ...questionFilter, topic: e.target.value })}
                            placeholder="Type to filter..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      {/* Clear Filters */}
                      {(questionFilter.subject || questionFilter.difficulty || questionFilter.topic) && (
                        <div className="mb-3 flex justify-between items-center">
                          <p className="text-xs text-gray-600">
                            Showing {getFilteredQuestions().length} of {availableQuestions.length} questions
                          </p>
                          <button
                            onClick={() => setQuestionFilter({ subject: '', difficulty: '', topic: '' })}
                            className="text-xs text-gray-600 hover:text-gray-800 underline"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}

                      {/* Questions List */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {getFilteredQuestions().length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No questions match the current filters.</p>
                          </div>
                        ) : (
                          getFilteredQuestions().map((question) => (
                            <label
                              key={question.id}
                              className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={examForm.questions.includes(question.id)}
                                onChange={() => toggleQuestion(question.id)}
                                className="w-4 h-4 text-green-600 rounded mt-1"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                    {question.subject}
                                  </span>
                                  {question.topic && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                      {question.topic}
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 text-xs rounded ${
                                    question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {question.difficulty}
                                  </span>
                                  <span className="text-xs text-gray-500">{question.marks} mark(s)</span>
                                </div>
                                <p className="text-sm text-gray-900">{question.question_text}</p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Assign Students */}
              {currentStep === 3 && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Select students who will take this exam. {selectedStudents.length} student(s) selected.
                    </p>
                    <button
                      onClick={selectAllStudents}
                      className="text-sm text-green-600 hover:underline"
                    >
                      {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {students.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No students found for {examForm.class_name}.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.admission_number}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Exam Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Title:</span>
                        <span className="ml-2 font-medium">{examForm.exam_title}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Subject:</span>
                        <span className="ml-2 font-medium">{examForm.subject}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Class:</span>
                        <span className="ml-2 font-medium">{examForm.class_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Assessment:</span>
                        <span className="ml-2 font-medium">{examForm.assessment_type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{examForm.duration_minutes} minutes</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Score:</span>
                        <span className="ml-2 font-medium">{examForm.total_score} marks</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Questions:</span>
                        <span className="ml-2 font-medium">{examForm.questions.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Per Question:</span>
                        <span className="ml-2 font-medium">{getPerQuestionScore()} marks</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Students:</span>
                        <span className="ml-2 font-medium">{selectedStudents.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ This exam will be created as a draft. You can publish it when ready.
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      ✓ Scores will automatically update student report cards upon submission.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-between border-t">
              <button
                onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => handleStepChange(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!examForm.exam_title || !examForm.subject || !examForm.class_name || !examForm.session || !examForm.term)) ||
                    (currentStep === 2 && examForm.questions.length === 0) ||
                    (currentStep === 3 && selectedStudents.length === 0)
                  }
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreateExam}
                  disabled={isCreatingExam}
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingExam && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isCreatingExam
                    ? (editingExam ? 'Updating...' : 'Creating...')
                    : (editingExam ? 'Update Exam' : 'Create Exam')
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exams List */}
      <div className="grid grid-cols-1 gap-4">
        {exams.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No exams yet</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by creating your first CBT exam</p>
            <button
              onClick={() => {
                setShowWizard(true);
                resetForm();
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Exam
            </button>
          </div>
        ) : (
          (() => {
            // Pagination calculations
            const indexOfLastExam = currentPage * examsPerPage;
            const indexOfFirstExam = indexOfLastExam - examsPerPage;
            const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);

            return currentExams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{exam.exam_title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            (exam.is_published == 1 || exam.is_published === true) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {(exam.is_published == 1 || exam.is_published === true) ? '✓ Published' : '○ Draft'}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
                            {exam.assessment_type?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {exam.subject}
                      </span>
                      <span>•</span>
                      <span>{exam.class_name}</span>
                      <span>•</span>
                      <span>{exam.session}</span>
                      <span>•</span>
                      <span>{exam.term}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditExam(exam.id)}
                      className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs font-medium"
                    >
                      Edit
                    </button>
                    {(exam.is_published != 1 && exam.is_published !== true) && (
                      <>
                        <button
                          onClick={() => handlePublishExam(exam.id)}
                          className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-all ${
                            exam.question_count == 0 || exam.assigned_students == 0
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                          disabled={exam.question_count == 0 || exam.assigned_students == 0}
                          title={
                            exam.question_count == 0
                              ? 'Cannot publish: No questions added'
                              : exam.assigned_students == 0
                              ? 'Cannot publish: No students assigned'
                              : 'Publish this exam to make it available to students'
                          }
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs font-medium">Questions</p>
                    </div>
                    <p className="text-xl font-bold text-blue-900">{exam.question_count}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-1.5 text-purple-700 mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-xs font-medium">Assigned</p>
                    </div>
                    <p className="text-xl font-bold text-purple-900">{exam.assigned_students}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center gap-1.5 text-green-700 mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs font-medium">Completed</p>
                    </div>
                    <p className="text-xl font-bold text-green-900">{exam.completed_count}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-1.5 text-orange-700 mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs font-medium">Duration</p>
                    </div>
                    <p className="text-xl font-bold text-orange-900">{exam.duration_minutes} min</p>
                  </div>
                </div>
              </div>
            </div>
          ));
          })()
        )}
      </div>

      {/* Pagination */}
      {exams.length > examsPerPage && (
        <div className="mt-4 bg-white rounded-lg px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 hover:bg-primary-50 border-gray-300 hover:border-primary-300'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(exams.length / examsPerPage)))}
              disabled={currentPage === Math.ceil(exams.length / examsPerPage)}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                currentPage === Math.ceil(exams.length / examsPerPage)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 hover:bg-primary-50 border-gray-300 hover:border-primary-300'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-semibold text-primary-600">{((currentPage - 1) * examsPerPage) + 1}</span> to{' '}
                <span className="font-semibold text-primary-600">{Math.min(currentPage * examsPerPage, exams.length)}</span> of{' '}
                <span className="font-semibold text-primary-600">{exams.length}</span> exams
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-lg border text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-white text-gray-500 hover:bg-primary-50 border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.ceil(exams.length / examsPerPage) }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                      currentPage === number
                        ? 'z-10 bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-300'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(exams.length / examsPerPage)))}
                  disabled={currentPage === Math.ceil(exams.length / examsPerPage)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-lg border text-sm font-medium transition-colors ${
                    currentPage === Math.ceil(exams.length / examsPerPage)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-white text-gray-500 hover:bg-primary-50 border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
