/**
 * API Service for Report Card Backend
 */

import { API_BASE_URL } from '../config/env';

/**
 * Generate a unique admission number for a new student
 * @returns {Promise} - API response with admission number
 */
export const generateAdmissionNumber = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-admission-number`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating admission number:', error);
    throw error;
  }
};

/**
 * Create a student profile (without report)
 * @param {Object} studentData - Student information
 * @returns {Promise} - API response
 */
export const createStudent = async (studentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(studentData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

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
 * Update student information
 * @param {Object} studentData - Student data to update
 * @returns {Promise} - API response with updated student data
 */
export const updateStudent = async (studentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(studentData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating student:', error);
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
 * Get all students with IDs (for parent management)
 * @returns {Promise} - API response with list of students including IDs
 */
export const getStudentsWithIds = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-students-with-ids`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching students with IDs:', error);
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
 * Search students by name or admission number
 */
export const searchStudents = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search-students?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching students:', error);
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
    const text = await response.text();
    const data = JSON.parse(text);
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
 * Get all classes configured for the school
 * @returns {Promise} - API response with classes array
 */
export const getSchoolClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/get-classes`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching school classes:', error);
    throw error;
  }
};

/**
 * Update school's current session and term
 * @param {string} currentSession - The current academic session (e.g., "2024/2025")
 * @param {string} currentTerm - The current term (First Term, Second Term, Third Term)
 * @returns {Promise} - API response
 */
export const updateSchoolSession = async (currentSession, currentTerm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/school/update-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ current_session: currentSession, current_term: currentTerm })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating school session:', error);
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
 * Generate PDF for a report card with automatic fallback
 * Tries Puppeteer first (high quality), falls back to TCPDF (pure PHP) if it fails
 * @param {number} reportId - The report ID
 * @returns {Promise} - API response with PDF URL and method used
 */
export const generateReportPDF = async (reportId) => {
  try {
    // First attempt: Try Puppeteer (high quality, requires exec())
    const puppeteerResponse = await fetch(`${API_BASE_URL}/generate-pdf?id=${reportId}`, {
      method: 'GET',
      credentials: 'include'
    });

    const puppeteerData = await puppeteerResponse.json();

    // If Puppeteer succeeds, return the result
    if (puppeteerData.success) {
      return puppeteerData;
    }

    // If Puppeteer fails, fall back to TCPDF
    const tcpdfResponse = await fetch(`${API_BASE_URL}/generate-pdf-tcpdf?id=${reportId}`, {
      method: 'GET',
      credentials: 'include'
    });

    const tcpdfData = await tcpdfResponse.json();

    if (tcpdfData.success) {
      return tcpdfData;
    }

    // Both methods failed
    throw new Error(tcpdfData.message || 'Both PDF generation methods failed');

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
 * Unassign a class/subject from a teacher
 * @param {Object} unassignData - Teacher ID, class name, session, term, and optional subject
 * @returns {Promise} - API response
 */
export const unassignTeacherClass = async (unassignData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/unassign-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(unassignData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unassigning class:', error);
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

// ========== SUBSCRIPTION & PAYMENT ==========

/**
 * Get all available subscription plans
 * @returns {Promise} - API response with plans list
 */
export const getSubscriptionPlans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription/get-plans`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Initialize payment for a subscription plan
 * @param {number} planId - The subscription plan ID
 * @returns {Promise} - API response with payment authorization URL
 */
export const initializeSubscriptionPayment = async (planId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription/initialize-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ plan_id: planId })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

/**
 * Verify payment after Paystack redirect
 * @param {string} reference - Payment reference
 * @returns {Promise} - API response with verification result
 */
export const verifySubscriptionPayment = async (reference) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription/verify-payment?reference=${reference}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Get current subscription status for the logged-in school
 * @returns {Promise} - API response with subscription details
 */
export const getSubscriptionStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription/get-status`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw error;
  }
};

/**
 * Submit contact form
 * @param {Object} contactData - Contact form data
 * @returns {Promise} - API response
 */
export const submitContactForm = async (contactData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// ============================
// SUPER ADMIN API FUNCTIONS
// ============================

/**
 * Super Admin Login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} deviceToken - Optional trusted device token
 * @returns {Promise} - API response with user data or MFA requirement
 */
export const superAdminLogin = async (email, password, deviceToken = null) => {
  try {
    const body = { email, password };
    if (deviceToken) {
      body.device_token = deviceToken;
    }

    const response = await fetch(`${API_BASE_URL}/super-admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging in as super admin:', error);
    throw error;
  }
};

/**
 * Verify MFA Code during Login
 * @param {string} email - Admin email
 * @param {string} code - 6-digit MFA code or backup code
 * @param {boolean} rememberDevice - Whether to trust this device
 * @returns {Promise} - API response with user data
 */
export const superAdminVerifyMFA = async (email, code, rememberDevice = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/mfa-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, code, remember_device: rememberDevice })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying MFA:', error);
    throw error;
  }
};

/**
 * Setup MFA - Generate secret and QR code
 * @returns {Promise} - API response with secret, QR URL, and backup codes
 */
export const superAdminMFASetup = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/mfa-setup`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error setting up MFA:', error);
    throw error;
  }
};

/**
 * Enable MFA - Verify setup and activate
 * @param {string} code - 6-digit verification code
 * @returns {Promise} - API response
 */
export const superAdminMFAEnable = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/mfa-enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error enabling MFA:', error);
    throw error;
  }
};

/**
 * Disable MFA
 * @param {string} password - Admin password for confirmation
 * @returns {Promise} - API response
 */
export const superAdminMFADisable = async (password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/mfa-disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error disabling MFA:', error);
    throw error;
  }
};

/**
 * Get MFA Status
 * @returns {Promise} - API response with MFA status
 */
export const superAdminMFAStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/mfa-status`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting MFA status:', error);
    throw error;
  }
};

/**
 * Super Admin Logout
 * @returns {Promise} - API response
 */
export const superAdminLogout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

/**
 * Check Super Admin Session
 * @returns {Promise} - API response with session status
 */
export const checkSuperAdminSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/check-session`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking super admin session:', error);
    throw error;
  }
};

/**
 * Get Super Admin Analytics Dashboard Data
 * @returns {Promise} - API response with analytics
 */
export const getSuperAdminAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/get-analytics`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching super admin analytics:', error);
    throw error;
  }
};

/**
 * Get All Schools (Super Admin)
 * @param {Object} params - Query parameters (page, limit, status, search)
 * @returns {Promise} - API response with schools list
 */
export const getAllSchools = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/super-admin/get-all-schools?${queryParams}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all schools:', error);
    throw error;
  }
};

/**
 * Get School Details (Super Admin)
 * @param {number} schoolId - School ID
 * @returns {Promise} - API response with school details
 */
export const getSchoolDetails = async (schoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/get-school-details?school_id=${schoolId}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching school details:', error);
    throw error;
  }
};

/**
 * Toggle School Active Status (Super Admin)
 * @param {number} schoolId - School ID
 * @param {boolean} isActive - New active status
 * @returns {Promise} - API response
 */
export const toggleSchoolStatus = async (schoolId, isActive) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/toggle-school-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ school_id: schoolId, is_active: isActive })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling school status:', error);
    throw error;
  }
};

/**
 * Update School Subscription (Super Admin Override)
 * @param {number} schoolId - School ID
 * @param {string} subscriptionStatus - New subscription status (active, trial, expired)
 * @param {string} subscriptionEndDate - New end date (YYYY-MM-DD)
 * @returns {Promise} - API response
 */
export const updateSchoolSubscription = async (schoolId, subscriptionStatus, subscriptionEndDate) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/update-school-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        school_id: schoolId,
        subscription_status: subscriptionStatus,
        subscription_end_date: subscriptionEndDate
      })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating school subscription:', error);
    throw error;
  }
};

/**
 * Get All Students Across All Schools (Super Admin)
 * @param {Object} params - Query parameters (page, limit, school_id, class, session, term, search)
 * @returns {Promise} - API response with students list
 */
export const getAllStudentsAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/super-admin/get-all-students?${queryParams}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw error;
  }
};

// ============================
// PARENT/GUARDIAN API FUNCTIONS
// ============================

/**
 * Parent Login (Email-only authentication)
 * @param {string} email - Parent email address
 * @returns {Promise} - API response with parent data and children list
 */
export const parentLogin = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging in parent:', error);
    throw error;
  }
};

/**
 * Check Parent Session
 * @returns {Promise} - API response with session status
 */
export const checkParentSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/check-session`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking parent session:', error);
    throw error;
  }
};

/**
 * Parent Logout
 * @returns {Promise} - API response
 */
export const parentLogout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging out parent:', error);
    throw error;
  }
};

/**
 * Get All Children for Logged-in Parent
 * @returns {Promise} - API response with children list
 */
export const getParentChildren = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/get-children`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent children:', error);
    throw error;
  }
};

/**
 * Get Child Analytics (Current Term)
 * @param {number} studentId - Student ID
 * @returns {Promise} - API response with comprehensive analytics
 */
export const getChildAnalytics = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/get-child-analytics?student_id=${studentId}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching child analytics:', error);
    throw error;
  }
};

/**
 * Get Child Performance History (All Terms)
 * @param {string} admissionNo - Student admission number
 * @returns {Promise} - API response with performance history and trends
 */
export const getChildHistory = async (admissionNo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/get-child-history?admission_no=${encodeURIComponent(admissionNo)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching child history:', error);
    throw error;
  }
};

/**
 * Add Parent-Student Relationship (School Admin Only)
 * @param {Object} relationshipData - Parent and student information
 * @returns {Promise} - API response
 */
export const addParentStudent = async (relationshipData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/add-parent-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(relationshipData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding parent-student relationship:', error);
    throw error;
  }
};

/**
 * Get all parents in the school (School Admin Only)
 * @returns {Promise} - API response with all parents
 */
export const getAllParents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/get-all-parents`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all parents:', error);
    throw error;
  }
};

/**
 * Get all parents linked to a student (School Admin Only)
 * @param {number} studentId - The student ID
 * @returns {Promise} - API response with parents list
 */
export const getStudentParents = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/get-student-parents?student_id=${studentId}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student parents:', error);
    throw error;
  }
};

/**
 * Remove/unlink a parent from a student (School Admin Only)
 * @param {number} studentId - The student ID
 * @param {number} parentId - The parent ID
 * @returns {Promise} - API response
 */
export const removeParentStudent = async (studentId, parentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent/remove-parent-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ student_id: studentId, parent_id: parentId })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing parent-student relationship:', error);
    throw error;
  }
};

/**
 * Get default subject templates for a class
 * @param {string} className - The class name
 * @returns {Promise} - API response with default subjects
 */
export const getDefaultSubjects = async (className) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/get-default-subjects?class_name=${encodeURIComponent(className)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching default subjects:', error);
    throw error;
  }
};

/**
 * Get configured subjects for a class
 * @param {string} className - The class name
 * @returns {Promise} - API response with class subjects
 */
export const getClassSubjects = async (className) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/get-class-subjects?class_name=${encodeURIComponent(className)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    throw error;
  }
};

/**
 * Configure subjects for a class
 * @param {string} className - The class name
 * @param {Array} subjects - Array of subject objects {name, is_core}
 * @returns {Promise} - API response
 */
export const configureClassSubjects = async (className, subjects) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/configure-class-subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ class_name: className, subjects })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error configuring class subjects:', error);
    throw error;
  }
};

/**
 * Get student's enrolled subjects
 * @param {number} studentId - The student ID
 * @param {string} session - The session
 * @returns {Promise} - API response with student subjects
 */
export const getStudentSubjects = async (studentId, session) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/get-student-subjects?student_id=${studentId}&session=${encodeURIComponent(session)}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    throw error;
  }
};

/**
 * Enroll a student in subjects
 * @param {number} studentId - The student ID
 * @param {Array} subjects - Array of subject names
 * @param {string} session - The session
 * @returns {Promise} - API response
 */
export const enrollStudent = async (studentId, subjects, session) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/enroll-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ student_id: studentId, subjects, session })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

/**
 * Bulk enroll students in subjects
 * @param {Array} enrollments - Array of {student_id, subjects}
 * @param {string} session - The session
 * @param {string} className - The class name
 * @returns {Promise} - API response
 */
export const bulkEnrollStudents = async (enrollments, session, className) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/bulk-enroll-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ enrollments, session, class_name: className })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error bulk enrolling students:', error);
    throw error;
  }
};

/**
 * Get students enrolled in a subject
 * @param {string} subjectName - The subject name
 * @param {string} session - The session
 * @param {string} className - Optional class name filter
 * @returns {Promise} - API response with students
 */
export const getSubjectStudents = async (subjectName, session, className = '') => {
  try {
    let url = `${API_BASE_URL}/subjects/get-subject-students?subject_name=${encodeURIComponent(subjectName)}&session=${encodeURIComponent(session)}`;
    if (className) {
      url += `&class_name=${encodeURIComponent(className)}`;
    }
    const response = await fetch(url, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching subject students:', error);
    throw error;
  }
};

/**
 * Get classes assigned to the authenticated teacher
 * @returns {Promise} - API response with array of class names
 */
export const getTeacherAssignedClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/get-assigned-classes`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teacher assigned classes:', error);
    throw error;
  }
};

/**
 * Get subjects assigned to the authenticated teacher
 * @returns {Promise} - API response with array of subject names
 */
export const getTeacherAssignedSubjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/get-assigned-subjects`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teacher assigned subjects:', error);
    throw error;
  }
};
