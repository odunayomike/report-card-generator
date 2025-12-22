import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const QuestionBank = () => {
  const { classes: teacherClasses } = useOutletContext();
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState({
    subject: '',
    question_type: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [batchQuestions, setBatchQuestions] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    subject: '',
    class: '',
    topic: '',
    difficulty: 'medium',
    marks: 1,
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    subject: '',
    class: '',
    topic: '',
    difficulty: 'medium',
    marks: 1,
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  useEffect(() => {
    if (teacherClasses) {
      setClasses(teacherClasses);
    }
  }, [teacherClasses]);

  useEffect(() => {
    loadQuestions();
    loadSchoolSettings();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filter]);

  const loadSchoolSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-session`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated && data.school && data.school.available_subjects) {
        // Convert all subjects to uppercase
        const uppercaseSubjects = data.school.available_subjects.map(s => s.toUpperCase());
        setAvailableSubjects(uppercaseSubjects);
      }
    } catch (err) {
      console.error('Failed to load school settings:', err);
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
        setFormData({
          ...formData,
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

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.subject) params.append('subject', filter.subject);
      if (filter.question_type) params.append('question_type', filter.question_type);

      const response = await fetch(`${API_BASE_URL}/cbt/questions?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        setTotalQuestions(data.total || data.questions.length);
      } else {
        setError(data.message || 'Failed to load questions');
      }
    } catch (err) {
      setError('Failed to load questions');
      console.error('Load questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      setError('Please select questions to delete');
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    setShowDeleteConfirm(false);

    try {
      const response = await fetch(`${API_BASE_URL}/cbt/questions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selectedQuestions })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Successfully deleted ${selectedQuestions.length} question(s)`);
        setTimeout(() => setSuccessMessage(''), 3000);
        setSelectedQuestions([]);
        loadQuestions();
      } else {
        setError(data.message || 'Failed to delete questions');
      }
    } catch (err) {
      setError('Failed to delete questions');
      console.error('Delete error:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === paginatedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(paginatedQuestions.map(q => q.id));
    }
  };

  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const addQuestionToBatch = () => {
    setError('');

    // Validate
    if (!formData.question_text || !formData.subject || !formData.class) {
      setError('Question text, subject, and class are required');
      return;
    }

    const correctCount = formData.options.filter(opt => opt.is_correct).length;
    if (correctCount !== 1) {
      setError('Exactly one option must be marked as correct');
      return;
    }

    const emptyOptions = formData.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      setError('All option fields must be filled');
      return;
    }

    // Add to batch
    setBatchQuestions([...batchQuestions, { ...formData }]);

    // Save current subject and class
    const savedSubject = formData.subject;
    const savedClass = formData.class;

    // Reset form but keep subject and class
    resetForm();
    setFormData(prev => ({
      ...prev,
      subject: savedSubject,
      class: savedClass
    }));

    setSuccessMessage(`Question added to batch! (${batchQuestions.length + 1} questions ready)`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const removeQuestionFromBatch = (index) => {
    const newBatch = batchQuestions.filter((_, i) => i !== index);
    setBatchQuestions(newBatch);
  };

  const handleSubmitBatch = async () => {
    if (batchQuestions.length === 0) {
      setError('No questions to submit. Add at least one question to the batch.');
      return;
    }

    setError('');

    try {
      // Submit all questions using batch endpoint
      const response = await fetch(`${API_BASE_URL}/cbt/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questions: batchQuestions })
      });

      const data = await response.json();

      if (data.success) {
        const count = data.count || batchQuestions.length;
        setSuccessMessage(`Successfully added ${count} question(s)!`);
        setTimeout(() => setSuccessMessage(''), 5000);

        // Clear batch and close form
        setBatchQuestions([]);
        setShowForm(false);
        resetForm();
        loadQuestions();
      } else {
        setError(data.message || 'Failed to add questions. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit questions');
      console.error('Submit batch error:', err);
    }
  };

  const validateCurrentQuestion = () => {
    setError('');

    // Validate
    if (!formData.question_text || !formData.subject || !formData.class) {
      setError('Question text, subject, and class are required');
      return false;
    }

    const correctCount = formData.options.filter(opt => opt.is_correct).length;
    if (correctCount !== 1) {
      setError('Exactly one option must be marked as correct');
      return false;
    }

    const emptyOptions = formData.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      setError('All option fields must be filled');
      return false;
    }

    return true;
  };

  const handleSubmitNow = async () => {
    if (!validateCurrentQuestion()) return;

    // Combine current question with batch
    const allQuestions = [...batchQuestions, { ...formData }];

    try {
      // Use batch upload endpoint for multiple questions, single endpoint for one
      const response = await fetch(`${API_BASE_URL}/cbt/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          allQuestions.length > 1
            ? { questions: allQuestions }
            : allQuestions[0]
        )
      });

      const data = await response.json();

      if (data.success) {
        const count = data.count || 1;
        setSuccessMessage(`Successfully added ${count} question(s)!`);
        setTimeout(() => setSuccessMessage(''), 5000);

        // Clear batch and close form
        setBatchQuestions([]);
        setShowForm(false);
        resetForm();
        loadQuestions();
      } else {
        setError(data.message || 'Failed to add questions. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit questions');
      console.error('Submit now error:', err);
    }
  };

  const handleAddToBatch = () => {
    if (!validateCurrentQuestion()) return;

    // Add to batch
    setBatchQuestions([...batchQuestions, { ...formData }]);

    // Save current subject and class
    const savedSubject = formData.subject;
    const savedClass = formData.class;

    // Reset form but keep subject and class
    resetForm();
    setFormData(prev => ({
      ...prev,
      subject: savedSubject,
      class: savedClass
    }));

    setSuccessMessage(`Question added to batch! (${batchQuestions.length + 1} questions ready)`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If editing, submit single question
    if (editingQuestion) {
      if (!validateCurrentQuestion()) return;

      try {
        const response = await fetch(`${API_BASE_URL}/cbt/questions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...formData, id: editingQuestion.id })
        });

        const data = await response.json();

        if (data.success) {
          setShowForm(false);
          setEditingQuestion(null);
          resetForm();
          setSuccessMessage('Question updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          loadQuestions();
        } else {
          setError(data.message || 'Failed to save question');
        }
      } catch (err) {
        setError('Failed to save question');
        console.error('Save question error:', err);
      }
    }
    // For new questions, we don't use submit anymore - use explicit buttons instead
  };

  const [questionToDelete, setQuestionToDelete] = useState(null);

  const handleDelete = (questionId) => {
    setQuestionToDelete(questionId);
  };

  const confirmSingleDelete = async () => {
    const questionId = questionToDelete;
    setQuestionToDelete(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cbt/questions?id=${questionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Question deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadQuestions();
      } else {
        setError(data.message || 'Failed to delete question');
      }
    } catch (err) {
      setError('Failed to delete question');
      console.error('Delete question error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'multiple_choice',
      subject: '',
      class: '',
      topic: '',
      difficulty: 'medium',
      marks: 1,
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    });
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      subject: question.subject,
      class: question.class || '',
      topic: question.topic || '',
      difficulty: question.difficulty,
      marks: question.marks,
      options: question.options || [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    });
    setShowForm(true);
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === 'is_correct' && value) {
      // Uncheck all others
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      newOptions[index][field] = value;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const handleFileImport = async (e) => {
    e.preventDefault();

    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    setImportProgress('Preparing upload...');

    // Use XMLHttpRequest for upload progress
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
        if (percentComplete < 100) {
          setImportProgress(`Uploading file... ${percentComplete}%`);
        } else {
          setImportProgress('Processing file...');
        }
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);

          if (data.success) {
            setSuccessMessage(`Successfully imported ${data.count} question(s)!`);
            setTimeout(() => setSuccessMessage(''), 5000);
            setShowImportModal(false);
            setImportFile(null);
            setImportProgress('');
            setUploadProgress(0);
            setIsUploading(false);
            loadQuestions();
          } else {
            setError(data.message || 'Failed to import questions');
            setImportProgress('');
            setUploadProgress(0);
            setIsUploading(false);
          }
        } catch (err) {
          setError('Failed to process server response');
          setImportProgress('');
          setUploadProgress(0);
          setIsUploading(false);
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.message || 'Failed to import questions');
        } catch (err) {
          setError('Failed to import questions. Server error.');
        }
        setImportProgress('');
        setUploadProgress(0);
        setIsUploading(false);
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      setError('Network error. Please check your connection and try again.');
      setImportProgress('');
      setUploadProgress(0);
      setIsUploading(false);
    });

    // Handle abort
    xhr.addEventListener('abort', () => {
      setError('Upload cancelled');
      setImportProgress('');
      setUploadProgress(0);
      setIsUploading(false);
    });

    // Open and send request
    xhr.open('POST', `${API_BASE_URL}/cbt/import-questions`);
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  // Calculate pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const paginatedQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-2">Create and manage your CBT questions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Questions
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingQuestion(null);
              resetForm();
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Question
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingQuestion(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Batch Questions Summary */}
              {!editingQuestion && batchQuestions.length > 0 && (
                <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-primary-900">
                      Questions Ready to Submit ({batchQuestions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleSubmitBatch}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm font-medium"
                    >
                      Submit All Questions
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {batchQuestions.map((q, index) => (
                      <div key={index} className="flex items-start justify-between bg-white p-3 rounded border border-primary-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {index + 1}. {q.question_text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {q.subject} • {q.class} • {q.marks} mark(s)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestionFromBatch(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Remove from batch"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">-- Select a class --</option>
                  {classes.filter(c => c.class_name && c.session && c.term).map((classItem) => (
                    <option key={classItem.id} value={classItem.class_name}>
                      {classItem.class_name} - {classItem.session} ({classItem.term})
                    </option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">No classes available. Please add students first.</p>
                )}
              </div>

              {/* Subject and Topic */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewSubject}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Difficulty and Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options *
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={option.is_correct}
                        onChange={() => updateOption(index, 'is_correct', true)}
                        className="w-4 h-4 text-green-600"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingQuestion(null);
                    setBatchQuestions([]);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {editingQuestion ? 'Cancel' : 'Close'}
                </button>

                {/* For editing questions - single Update button */}
                {editingQuestion ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update Question
                  </button>
                ) : (
                  /* For new questions - two choice buttons */
                  <div className="flex gap-3 items-center">
                    <button
                      type="button"
                      onClick={handleAddToBatch}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add to Batch & Continue
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitNow}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Now {batchQuestions.length > 0 && `(${batchQuestions.length + 1})`}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Bulk Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Questions</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete {selectedQuestions.length} question(s)? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete {selectedQuestions.length} Question(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Single Delete */}
      {questionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Question</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete this question? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setQuestionToDelete(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSingleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Questions Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Import Questions from File</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportProgress('');
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFileImport} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Import Instructions</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p className="font-semibold">Currently, we only support TXT (text) format.</p>
                  <p>Your text file should follow this format:</p>
                  <div className="bg-white p-3 rounded mt-2 font-mono text-xs">
                    <p>Subject: MATHEMATICS</p>
                    <p>Class: JSS 1</p>
                    <p>Topic: Algebra (optional)</p>
                    <p>Difficulty: medium (optional)</p>
                    <p>Marks: 1 (optional)</p>
                    <p className="mt-2">Question 1: What is 2 + 2?</p>
                    <p>A. 3</p>
                    <p>B. 4 (correct)</p>
                    <p>C. 5</p>
                    <p>D. 6</p>
                    <p className="mt-2">Question 2: What is 3 x 3?</p>
                    <p>A. 6</p>
                    <p>B. 8</p>
                    <p>C. 9 (correct)</p>
                    <p>D. 12</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p>• Mark correct answers with (correct) or *</p>
                    <p>• Only TXT format is supported for now</p>
                    <p>• PDF and DOCX support coming soon</p>
                    <p>• All questions will use the same subject, class, and settings</p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select TXT File *
                </label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                {importFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {importFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Only .txt files are accepted
                </p>
              </div>

              {/* Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary-700">{importProgress}</span>
                      <span className="text-sm font-bold text-primary-700">{uploadProgress}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-primary-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportProgress('');
                    setUploadProgress(0);
                    setIsUploading(false);
                    setError('');
                  }}
                  disabled={isUploading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importFile || isUploading}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Import Questions'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
            <select
              value={filter.subject}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filter.question_type}
              onChange={(e) => setFilter({ ...filter, question_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ subject: '', question_type: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {questions.length > 0 && (
                <input
                  type="checkbox"
                  checked={selectedQuestions.length === paginatedQuestions.length && paginatedQuestions.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                All Questions ({questions.length})
              </h2>
              {selectedQuestions.length > 0 && (
                <span className="text-sm text-gray-600">
                  ({selectedQuestions.length} selected)
                </span>
              )}
            </div>
            {selectedQuestions.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedQuestions.length})
              </button>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No questions found. Click "Add Question" to create your first question.
            </div>
          ) : (
            <>
              {paginatedQuestions.map((question) => (
                <div key={question.id} className={`p-6 hover:bg-gray-50 transition-colors ${selectedQuestions.includes(question.id) ? 'bg-green-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleSelectQuestion(question.id)}
                      className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {question.subject}
                            </span>
                            {question.class && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                {question.class}
                              </span>
                            )}
                            {question.topic && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {question.topic}
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded ${
                              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">{question.marks} mark(s)</span>
                          </div>
                          <p className="text-gray-900 font-medium">{question.question_text}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(question)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, questions.length)} of {questions.length} questions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage = pageNum === 1 ||
                                          pageNum === totalPages ||
                                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                          const showEllipsis = (pageNum === currentPage - 2 && currentPage > 3) ||
                                              (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                          }

                          if (!showPage) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm ${
                                currentPage === pageNum
                                  ? 'bg-green-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
