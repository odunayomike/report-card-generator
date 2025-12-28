import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const autoSaveTimeout = useRef(null);
  const timerInterval = useRef(null);
  const attemptIdRef = useRef(null);

  useEffect(() => {
    startExam();
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [examId]);

  useEffect(() => {
    if (exam && exam.started_at) {
      const startTime = new Date(exam.started_at).getTime();
      const durationMs = exam.duration_minutes * 60 * 1000;
      const endTime = startTime + durationMs;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(Math.floor(remaining / 1000));

        if (remaining <= 0) {
          handleAutoSubmit();
        }
      };

      updateTimer();
      timerInterval.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerInterval.current) clearInterval(timerInterval.current);
      };
    }
  }, [exam]);

  const startExam = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cbt/student-exams?action=start&exam_id=${examId}`,
        { credentials: 'include' }
      );
      const data = await response.json();

      console.log('Start exam response:', data);

      if (data.success) {
        setExam(data.exam);
        setAttemptId(data.attempt_id);
        attemptIdRef.current = data.attempt_id; // Store in ref for callbacks
        setQuestions(data.questions);
        setResponses(data.saved_answers || {});
        console.log('Attempt ID set to:', data.attempt_id);
      } else {
        setError(data.message || 'Failed to start exam');
      }
    } catch (err) {
      setError('Failed to load exam');
      console.error('Start exam error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId, optionId) => {
    const newResponses = { ...responses, [questionId]: optionId };
    setResponses(newResponses);

    // Auto-save with debounce
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(async () => {
      try {
        if (!attemptIdRef.current) {
          console.error('No attempt ID available for saving');
          return;
        }

        const payload = {
          action: 'save_answer',
          attempt_id: attemptIdRef.current,
          question_id: questionId,
          selected_option_id: optionId
        };
        console.log('Saving answer with payload:', payload);

        const response = await fetch(`${API_BASE_URL}/cbt/student-exams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Save answer response:', data);
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/cbt/student-exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'submit',
          attempt_id: attemptId,
          answers: responses
        })
      });

      const data = await response.json();

      if (data.success) {
        // Clear timers
        if (timerInterval.current) clearInterval(timerInterval.current);
        if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

        // Check if results should be shown immediately
        // show_results_immediately = 1 means SHOW results immediately
        // show_results_immediately = 0 means HIDE results
        if (exam.show_results_immediately == 0) {
          // Hide results - navigate back to exams list with success message
          navigate('/student/exams', {
            state: {
              message: 'Exam submitted successfully! Results will be available later.'
            }
          });
        } else {
          // Show results immediately - navigate to results page
          navigate(`/student/results/${examId}`);
        }
      } else {
        setError(data.message || 'Failed to submit exam');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Failed to submit exam');
      setSubmitting(false);
      console.error('Submit exam error:', err);
    }
  };

  const handleAutoSubmit = () => {
    if (!submitting) {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(responses).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">{exam.subject}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Question</p>
                <p className="text-lg font-semibold">{currentQuestion + 1} / {questions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Answered</p>
                <p className="text-lg font-semibold">{getAnsweredCount()} / {questions.length}</p>
              </div>
              <div className={`text-right px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <p className="text-sm font-medium">Time Remaining</p>
                <p className="text-2xl font-bold">{formatTime(timeRemaining)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                      idx === currentQuestion
                        ? 'bg-green-600 text-white'
                        : responses[q.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestion + 1}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <p className="text-gray-800 text-lg leading-relaxed">{currentQ.question_text}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      responses[currentQ.id] === option.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      checked={responses[currentQ.id] === option.id}
                      onChange={() => handleAnswer(currentQ.id, option.id)}
                      className="w-5 h-5 text-green-600 mt-0.5"
                    />
                    <span className="ml-3 text-gray-800">{option.text}</span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex gap-3">
                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={submitting}
                      className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-2">
              You have answered {getAnsweredCount()} out of {questions.length} questions.
            </p>
            {getAnsweredCount() < questions.length && (
              <p className="text-orange-600 text-sm mb-4">
                ⚠ Warning: You have {questions.length - getAnsweredCount()} unanswered question(s).
              </p>
            )}
            <p className="text-gray-600 mb-6">
              Once submitted, you cannot change your answers. Are you sure you want to submit?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  handleSubmit();
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;
