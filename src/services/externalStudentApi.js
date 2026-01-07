import { API_BASE_URL } from '../config/env';

/**
 * External Student API Service
 * Handles all API calls related to external students (prospective students taking entrance exams)
 */

/**
 * Public registration for external student (no authentication required)
 * @param {Object} studentData - Registration data including school_id
 * @returns {Promise<Object>} Registration response with credentials
 */
export const publicRegisterExternalStudent = async (studentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/public-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Public registration error:', error);
    throw error;
  }
};

/**
 * Login for external student
 * @param {string} examCode - Unique exam code (e.g., EXT-2024-1-0012)
 * @param {string} password - Student password
 * @returns {Promise<Object>} Login response with student data
 */
export const externalStudentLogin = async (examCode, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ exam_code: examCode, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('External student login error:', error);
    throw error;
  }
};

/**
 * Check if external student session is valid
 * @returns {Promise<Object>} Session validation response
 */
export const externalStudentCheckSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/check-session`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('External student check session error:', error);
    throw error;
  }
};

/**
 * Logout external student
 * @returns {Promise<Object>} Logout response
 */
export const externalStudentLogout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('External student logout error:', error);
    throw error;
  }
};

/**
 * Get list of exams assigned to external student
 * @returns {Promise<Object>} List of assigned exams
 */
export const getExternalStudentExams = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cbt/student-exams?action=list`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch exams');
    }

    return data;
  } catch (error) {
    console.error('Get external student exams error:', error);
    throw error;
  }
};

/**
 * Get exam results for external student
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Exam results
 */
export const getExternalStudentResults = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cbt/student-exams?action=results&exam_id=${examId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch results');
    }

    return data;
  } catch (error) {
    console.error('Get external student results error:', error);
    throw error;
  }
};

// ========== ADMIN FUNCTIONS (for school admin managing external students) ==========

/**
 * Enroll a new external student
 * @param {Object} studentData - External student information
 * @returns {Promise<Object>} Enrollment response with credentials
 */
export const enrollExternalStudent = async (studentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(studentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Enrollment failed');
    }

    return data;
  } catch (error) {
    console.error('Enroll external student error:', error);
    throw error;
  }
};

/**
 * Get list of all external students for school
 * @param {Object} filters - Filter options (status, class, search, limit, offset)
 * @returns {Promise<Object>} List of external students
 */
export const getExternalStudents = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.class) queryParams.append('class', filters.class);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${API_BASE_URL}/external-students/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch external students');
    }

    return data;
  } catch (error) {
    console.error('Get external students error:', error);
    throw error;
  }
};

/**
 * Assign exam to external student(s)
 * @param {number} examId - Exam ID
 * @param {Array<number>} externalStudentIds - Array of external student IDs
 * @returns {Promise<Object>} Assignment response
 */
export const assignExamToExternalStudents = async (examId, externalStudentIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/assign-exam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ exam_id: examId, external_student_ids: externalStudentIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign exam');
    }

    return data;
  } catch (error) {
    console.error('Assign exam to external students error:', error);
    throw error;
  }
};

/**
 * Get exam results for a specific external student (Admin view)
 * @param {number} externalStudentId - External student ID
 * @returns {Promise<Object>} Student's exam results and statistics
 */
export const getExternalStudentResultsAdmin = async (externalStudentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/results?external_student_id=${externalStudentId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch results');
    }

    return data;
  } catch (error) {
    console.error('Get external student results (admin) error:', error);
    throw error;
  }
};

/**
 * Convert external student to regular student
 * @param {number} externalStudentId - External student ID
 * @param {string} admissionNo - New admission number
 * @param {Object} additionalData - Optional additional data (current_class, session, term)
 * @returns {Promise<Object>} Conversion response
 */
export const convertExternalStudent = async (externalStudentId, admissionNo, additionalData = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/external-students/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        external_student_id: externalStudentId,
        admission_no: admissionNo,
        ...additionalData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Conversion failed');
    }

    return data;
  } catch (error) {
    console.error('Convert external student error:', error);
    throw error;
  }
};
