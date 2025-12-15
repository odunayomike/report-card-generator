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
