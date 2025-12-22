import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';

const ExamResults = () => {
  const { examId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [examId]);

  const loadResults = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cbt/student-exams?action=results&exam_id=${examId}`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.message || 'Failed to load results');
      }
    } catch (err) {
      setError('Failed to load results');
      console.error('Load results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 70) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  // Ensure numeric values
  const percentage = parseFloat(results.percentage) || 0;
  const totalScore = parseFloat(results.total_score) || 0;
  const totalMarks = parseFloat(results.total_marks) || 0;
  const correctAnswers = parseInt(results.correct_answers) || 0;
  const wrongAnswers = parseInt(results.wrong_answers) || 0;
  const timeTakenMinutes = parseFloat(results.time_taken_minutes) || 0;

  const gradeInfo = getGrade(percentage);

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-5xl mx-auto px-4">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Exam Completed!</h1>
          <p className="text-sm text-gray-600">{results.exam_title} - {results.subject}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Score Card - Left Column */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 ${gradeInfo.bg} rounded-full mb-3`}>
                <span className={`text-5xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {totalScore} / {totalMarks}
              </h2>
              <p className="text-lg text-gray-600">{percentage.toFixed(1)}%</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-gray-900">{correctAnswers}</p>
                <p className="text-xs text-gray-600">Correct</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-1">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-gray-900">{wrongAnswers}</p>
                <p className="text-xs text-gray-600">Wrong</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-1">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-gray-900">{timeTakenMinutes.toFixed(0)}</p>
                <p className="text-xs text-gray-600">Minutes</p>
              </div>
            </div>
          </div>

          {/* Exam Info - Right Column */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Exam Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium text-gray-900">{results.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions:</span>
                <span className="font-medium text-gray-900">{correctAnswers + wrongAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Marks:</span>
                <span className="font-medium text-gray-900">{totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Taken:</span>
                <span className="font-medium text-gray-900">{timeTakenMinutes.toFixed(0)} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium text-gray-900">
                  {results.submitted_at ? new Date(results.submitted_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Report Card Notice */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2 text-xs bg-blue-50 p-3 rounded">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-blue-800">Score automatically added to your report card!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Question Summary (if available) */}
        {results.question_details && results.question_details.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Answer Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {results.question_details.map((detail, idx) => (
                <div
                  key={idx}
                  className={`text-center p-2 rounded border-2 ${
                    detail.is_correct
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                  title={detail.is_correct ? 'Correct' : `Wrong - Correct answer: ${detail.correct_answer}`}
                >
                  <p className="text-xs font-medium text-gray-700">Q{idx + 1}</p>
                  <p className={`text-lg font-bold ${
                    detail.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {detail.is_correct ? '✓' : '✗'}
                  </p>
                  <p className="text-xs text-gray-600">{detail.marks_awarded}/{detail.marks}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <Link
            to="/student/exams"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Back to My Exams
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
