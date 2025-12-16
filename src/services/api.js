/**
 * API Service for Report Card Backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Save a report card to the database
 * @param {Object} reportData - The complete report card data
 * @returns {Promise} - API response
 */
export const saveReportCard = async (reportData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reportData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving report card:', error);
    throw error;
  }
};

/**
 * Get a specific report card by student ID
 * @param {number} studentId - The student ID
 * @returns {Promise} - API response with report card data
 */
export const getReportCard = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-report?id=${studentId}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching report card:', error);
    throw error;
  }
};

/**
 * Get all students
 * @returns {Promise} - API response with list of students
 */
export const getAllStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-all-students`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Delete a report card
 * @param {number} studentId - The student ID to delete
 * @returns {Promise} - API response
 */
export const deleteReportCard = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete-report?id=${studentId}`, {
      method: 'GET'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting report card:', error);
    throw error;
  }
};

/**
 * Check if a student exists by admission number
 * @param {string} admissionNo - The admission number to check
 * @returns {Promise} - API response with student data if found
 */
export const checkStudent = async (admissionNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-student?admission_no=${encodeURIComponent(admissionNo)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking student:', error);
    throw error;
  }
};

/**
 * Get student profile with all their report cards
 * @param {string} admissionNo - The admission number
 * @returns {Promise} - API response with student info and all reports
 */
export const getStudentProfile = async (admissionNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-student-profile?admission_no=${encodeURIComponent(admissionNo)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }
};

/**
 * Get dashboard analytics
 * @returns {Promise} - API response with analytics data
 */
export const getAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-analytics`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Get school profile with all settings
 * @returns {Promise} - API response with complete school profile
 */
export const getSchoolProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/get-profile`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching school profile:', error);
    throw error;
  }
};

/**
 * Update school basic profile information
 * @param {Object} profileData - Profile data to update (school_name, email, phone, address, motto, colors)
 * @returns {Promise} - API response
 */
export const updateSchoolProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating school profile:', error);
    throw error;
  }
};

/**
 * Update school logo
 * @param {string} logoData - Base64 encoded logo image
 * @returns {Promise} - API response
 */
export const updateSchoolLogo = async (logoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/update-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ logo: logoData })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating school logo:', error);
    throw error;
  }
};

/**
 * Update school settings
 * @param {Object} settingsData - Settings to update (grading_scale, subjects, calendar, report customization)
 * @returns {Promise} - API response
 */
export const updateSchoolSettings = async (settingsData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/update-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(settingsData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating school settings:', error);
    throw error;
  }
};

/**
 * Change school password
 * @param {Object} passwordData - Object with current_password and new_password
 * @returns {Promise} - API response
 */
export const changeSchoolPassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(passwordData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Generate PDF for a report card using Puppeteer
 * @param {number} reportId - The report ID
 * @returns {Promise} - API response with PDF URL
 */
export const generateReportPDF = async (reportId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-pdf?id=${reportId}`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// ========== TEACHER AUTHENTICATION ==========

/**
 * Teacher login
 * @param {Object} credentials - Email and password
 * @returns {Promise} - API response with teacher data
 */
export const teacherLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/teacher-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging in teacher:', error);
    throw error;
  }
};

/**
 * Check teacher session
 * @returns {Promise} - API response with teacher data if authenticated
 */
export const checkTeacherSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/teacher-check-session`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking teacher session:', error);
    throw error;
  }
};

// ========== TEACHER MANAGEMENT (for Schools) ==========

/**
 * Create a new teacher
 * @param {Object} teacherData - Teacher information (name, email, password, phone, classes)
 * @returns {Promise} - API response
 */
export const createTeacher = async (teacherData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(teacherData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating teacher:', error);
    throw error;
  }
};

/**
 * Get all teachers for the school
 * @returns {Promise} - API response with list of teachers
 */
export const getAllTeachers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/get-all`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

/**
 * Assign classes to a teacher
 * @param {Object} assignmentData - Teacher ID and array of classes
 * @returns {Promise} - API response
 */
export const assignTeacherClasses = async (assignmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/assign-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(assignmentData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error assigning classes:', error);
    throw error;
  }
};

/**
 * Get teacher's assigned classes
 * @returns {Promise} - API response with list of classes
 */
export const getMyClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/get-my-classes`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching my classes:', error);
    throw error;
  }
};

// ========== ATTENDANCE MARKING (for Teachers) ==========

/**
 * Get students in a class for attendance marking
 * @param {Object} params - Class, session, and term
 * @returns {Promise} - API response with list of students
 */
export const getStudentsForAttendance = async (params) => {
  try {
    const { class_name, session, term } = params;
    const response = await fetch(
      `${API_BASE_URL}/attendance/get-students?class=${encodeURIComponent(class_name)}&session=${encodeURIComponent(session)}&term=${encodeURIComponent(term)}`,
      { credentials: 'include' }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching students for attendance:', error);
    throw error;
  }
};

/**
 * Mark daily attendance for students
 * @param {Object} attendanceData - Date and array of attendance records
 * @returns {Promise} - API response
 */
export const markDailyAttendance = async (attendanceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/mark-daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(attendanceData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

/**
 * Get daily attendance records
 * @param {Object} params - Date, class (optional), session, term
 * @returns {Promise} - API response with attendance records
 */
export const getDailyAttendance = async (params) => {
  try {
    const { date, class_name, session, term } = params;
    let url = `${API_BASE_URL}/attendance/get-daily?date=${date}`;
    if (class_name) url += `&class=${encodeURIComponent(class_name)}`;
    if (session) url += `&session=${encodeURIComponent(session)}`;
    if (term) url += `&term=${encodeURIComponent(term)}`;

    const response = await fetch(url, { credentials: 'include' });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    throw error;
  }
};
