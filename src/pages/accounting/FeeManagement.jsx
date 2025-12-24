import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config/env';

const FeeManagement = () => {
  const [categories, setCategories] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [showEditFeeModal, setShowEditFeeModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const [feeForm, setFeeForm] = useState({
    fee_category_id: '',
    apply_to: 'class', // 'class' or 'student'
    class: '',
    student_id: '',
    session: '',
    term: '',
    amount: '',
    frequency: 'per-term',
    is_mandatory: true
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchFeeStructures();
    fetchClasses();
    fetchStudents();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/fee-categories`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchFeeStructures = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/get-fee-structure`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setFeeStructures(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/school/get-classes`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Extract unique class names
        const uniqueClasses = [...new Set(data.classes.map(c => c.class_name))].sort();
        setClasses(uniqueClasses);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-all-students`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // The endpoint returns students in 'data' property, not 'students'
        setStudents(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]); // Set empty array on error to prevent undefined
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const handleEditFee = (fee) => {
    setSelectedFee(fee);
    setFeeForm({
      fee_category_id: fee.fee_category_id.toString(),
      apply_to: fee.student_id ? 'student' : 'class',
      class: fee.class || '',
      student_id: fee.student_id ? fee.student_id.toString() : '',
      session: fee.session,
      term: fee.term || '',
      amount: fee.amount.toString(),
      frequency: fee.frequency,
      is_mandatory: fee.is_mandatory
    });
    setShowEditFeeModal(true);
  };

  const handleUpdateFeeStructure = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Prepare the data based on apply_to selection
      const submitData = {
        id: selectedFee.id,
        fee_category_id: feeForm.fee_category_id,
        session: feeForm.session,
        term: feeForm.term,
        amount: feeForm.amount,
        frequency: feeForm.frequency,
        is_mandatory: feeForm.is_mandatory,
        update_linked_fees: true // Always update linked unpaid fees
      };

      if (feeForm.apply_to === 'student') {
        submitData.student_id = feeForm.student_id;
      } else {
        submitData.class = feeForm.class;
      }

      const response = await fetch(`${API_BASE_URL}/accounting/admin/update-fee-structure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        // Automatically assign/reassign fees to students
        try {
          const assignResponse = await fetch(`${API_BASE_URL}/accounting/admin/assign-fees-to-students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fee_structure_id: selectedFee.id })
          });

          const assignData = await assignResponse.json();
          let message = 'Fee structure updated successfully!';

          if (data.data.updated_linked_fees > 0) {
            message += ` ${data.data.updated_linked_fees} existing unpaid fee(s) were updated.`;
          }

          if (assignData.success && assignData.assigned_count > 0) {
            message += ` ${assignData.assigned_count} new student(s) were assigned this fee.`;
          }

          showNotification('success', message);
        } catch (assignErr) {
          console.error('Assignment error:', assignErr);
          let message = 'Fee structure updated successfully!';
          if (data.data.updated_linked_fees > 0) {
            message += ` ${data.data.updated_linked_fees} unpaid student fee(s) were also updated.`;
          }
          showNotification('success', message);
        }

        setShowEditFeeModal(false);
        setSelectedFee(null);
        setFeeForm({
          fee_category_id: '',
          apply_to: 'class',
          class: '',
          student_id: '',
          session: '',
          term: '',
          amount: '',
          frequency: 'per-term',
          is_mandatory: true
        });
        fetchFeeStructures();
      } else {
        showNotification('error', data.message || 'Failed to update fee structure');
      }
    } catch (err) {
      showNotification('error', 'Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteFee = (fee) => {
    setSelectedFee(fee);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteFee = async () => {
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounting/admin/delete-fee-structure`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: selectedFee.id })
      });

      const data = await response.json();
      if (data.success) {
        let message = 'Fee structure deleted successfully!';
        if (data.deleted_student_fees > 0) {
          message += ` ${data.deleted_student_fees} related student fee record(s) were also removed.`;
        }
        showNotification('success', message);
        setShowDeleteConfirmModal(false);
        setSelectedFee(null);
        fetchFeeStructures();
      } else {
        showNotification('error', data.message || 'Failed to delete fee structure');
      }
    } catch (err) {
      showNotification('error', 'Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    if (!studentSearch) return true;
    const searchLower = studentSearch.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.admission_no?.toLowerCase().includes(searchLower)
    );
  });

  // Get selected student details
  const selectedStudent = students.find(s => s.id === parseInt(feeForm.student_id));

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounting/fee-categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Fee category created successfully!');
        setShowAddCategoryModal(false);
        setCategoryForm({ name: '', description: '' });
        fetchCategories();
      } else {
        showNotification('error', data.message || 'Failed to create category');
      }
    } catch (err) {
      showNotification('error', 'Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddFeeStructure = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Prepare the data based on apply_to selection
      const submitData = {
        fee_category_id: feeForm.fee_category_id,
        session: feeForm.session,
        term: feeForm.term,
        amount: feeForm.amount,
        frequency: feeForm.frequency,
        is_mandatory: feeForm.is_mandatory
      };

      if (feeForm.apply_to === 'student') {
        submitData.student_id = feeForm.student_id;
      } else {
        submitData.class = feeForm.class;
      }

      const response = await fetch(`${API_BASE_URL}/accounting/admin/create-fee-structure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        const feeId = data.data.id;

        // Automatically assign fees to students
        try {
          const assignResponse = await fetch(`${API_BASE_URL}/accounting/admin/assign-fees-to-students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fee_structure_id: feeId })
          });

          const assignData = await assignResponse.json();
          if (assignData.success) {
            let message = 'Fee structure created successfully!';
            if (assignData.assigned_count > 0) {
              message += ` Assigned to ${assignData.assigned_count} student(s).`;
            }
            if (assignData.skipped_count > 0) {
              message += ` ${assignData.skipped_count} student(s) already had this fee.`;
            }
            showNotification('success', message);
          } else {
            showNotification('success', 'Fee structure created but failed to auto-assign to students');
          }
        } catch (assignErr) {
          console.error('Assignment error:', assignErr);
          showNotification('success', 'Fee structure created but failed to auto-assign to students');
        }

        setShowAddFeeModal(false);
        setFeeForm({
          fee_category_id: '',
          apply_to: 'class',
          class: '',
          student_id: '',
          session: '',
          term: '',
          amount: '',
          frequency: 'per-term',
          is_mandatory: true
        });
        fetchFeeStructures();
      } else {
        showNotification('error', data.message || 'Failed to create fee structure');
      }
    } catch (err) {
      showNotification('error', 'Network error occurred');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600 mt-1">Manage fee categories and structures</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fee Categories
            </button>
            <button
              onClick={() => setActiveTab('structures')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'structures'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fee Structures
            </button>
          </nav>
        </div>
      </div>

      {/* Fee Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Fee Categories</h2>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No fee categories yet. Add one to get started.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {category.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Fee Structures Tab */}
      {activeTab === 'structures' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Fee Structures</h2>
            <button
              onClick={() => setShowAddFeeModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Fee Structure
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : feeStructures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No fee structures yet. Add one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeStructures.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {fee.category_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {fee.student_id ? (
                          <div>
                            <div className="font-medium text-gray-900">{fee.student_name}</div>
                            <div className="text-xs text-gray-500">{fee.admission_number}</div>
                          </div>
                        ) : fee.class ? (
                          <span>{fee.class}</span>
                        ) : (
                          <span className="text-gray-400">All Students</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {fee.session}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {fee.term || 'All Terms'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        ₦{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-sm text-gray-600">{fee.frequency}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          fee.is_mandatory
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fee.is_mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditFee(fee)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          title="Edit fee structure"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteFee(fee)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete fee structure"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowAddCategoryModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Fee Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Tuition Fee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {showAddFeeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowAddFeeModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Fee Structure</h3>
              <button onClick={() => setShowAddFeeModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddFeeStructure}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category</label>
                  <select
                    value={feeForm.fee_category_id}
                    onChange={(e) => setFeeForm({...feeForm, fee_category_id: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {categories.filter(c => c.is_active).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Apply To Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apply Fee To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="class"
                        checked={feeForm.apply_to === 'class'}
                        onChange={(e) => setFeeForm({...feeForm, apply_to: e.target.value, student_id: ''})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Class/All Students</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="student"
                        checked={feeForm.apply_to === 'student'}
                        onChange={(e) => setFeeForm({...feeForm, apply_to: e.target.value, class: ''})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Individual Student</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Fields Based on Apply To */}
                {feeForm.apply_to === 'class' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      value={feeForm.class}
                      onChange={(e) => setFeeForm({...feeForm, class: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Classes</option>
                      {classes.map((className, index) => (
                        <option key={index} value={className}>{className}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select specific class or leave as "All Classes"</p>
                  </div>
                ) : (
                  <div className="relative" ref={studentDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>

                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedStudent ? `${selectedStudent.name} (${selectedStudent.admission_no})` : studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value);
                          setShowStudentDropdown(true);
                          if (!e.target.value) {
                            setFeeForm({...feeForm, student_id: ''});
                          }
                        }}
                        onFocus={() => setShowStudentDropdown(true)}
                        placeholder="Search by name or admission number..."
                        required={!feeForm.student_id}
                        className="w-full border border-gray-300 rounded-md p-2 pr-8 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <svg
                        className="absolute right-2 top-3 w-5 h-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Hidden input to store the actual student ID for form submission */}
                    <input type="hidden" value={feeForm.student_id} />

                    {/* Dropdown List */}
                    {showStudentDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredStudents && filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => {
                                setFeeForm({...feeForm, student_id: student.id.toString()});
                                setStudentSearch('');
                                setShowStudentDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.admission_no} - {student.current_class}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No students found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Display selected student */}
                    {selectedStudent && !showStudentDropdown && (
                      <div className="mt-2 p-2 bg-primary-50 rounded border border-primary-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{selectedStudent.name}</div>
                            <div className="text-xs text-gray-600">{selectedStudent.admission_no} - {selectedStudent.current_class}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFeeForm({...feeForm, student_id: ''});
                              setStudentSearch('');
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <input
                      type="text"
                      value={feeForm.session}
                      onChange={(e) => setFeeForm({...feeForm, session: e.target.value})}
                      required
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2023/2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                    <select
                      value={feeForm.term}
                      onChange={(e) => setFeeForm({...feeForm, term: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Terms</option>
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={feeForm.frequency}
                    onChange={(e) => setFeeForm({...feeForm, frequency: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="one-time">One-time</option>
                    <option value="per-term">Per Term</option>
                    <option value="per-session">Per Session</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={feeForm.is_mandatory}
                    onChange={(e) => setFeeForm({...feeForm, is_mandatory: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Mandatory fee (required for all students)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Fee Structure'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFeeModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fee Structure Modal - Reuses same form structure as Add */}
      {showEditFeeModal && selectedFee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowEditFeeModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Fee Structure</h3>
              <button onClick={() => setShowEditFeeModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateFeeStructure}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category</label>
                  <select
                    value={feeForm.fee_category_id}
                    onChange={(e) => setFeeForm({...feeForm, fee_category_id: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {categories.filter(c => c.is_active).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Apply To Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apply Fee To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="class"
                        checked={feeForm.apply_to === 'class'}
                        onChange={(e) => setFeeForm({...feeForm, apply_to: e.target.value, student_id: ''})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Class/All Students</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="student"
                        checked={feeForm.apply_to === 'student'}
                        onChange={(e) => setFeeForm({...feeForm, apply_to: e.target.value, class: ''})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Individual Student</span>
                    </label>
                  </div>
                </div>

                {/* Show selected student/class info */}
                {feeForm.apply_to === 'student' && selectedFee.student_name && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Changing the student will affect existing fee records.
                    </p>
                  </div>
                )}

                {/* Amount field - shown prominently */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-yellow-600 mt-1">Unpaid fees will be updated automatically.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <input
                      type="text"
                      value={feeForm.session}
                      onChange={(e) => setFeeForm({...feeForm, session: e.target.value})}
                      required
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2023/2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                    <select
                      value={feeForm.term}
                      onChange={(e) => setFeeForm({...feeForm, term: e.target.value})}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Terms</option>
                      <option value="First Term">First Term</option>
                      <option value="Second Term">Second Term</option>
                      <option value="Third Term">Third Term</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={feeForm.frequency}
                    onChange={(e) => setFeeForm({...feeForm, frequency: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="one-time">One-time</option>
                    <option value="per-term">Per Term</option>
                    <option value="per-session">Per Session</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-is-mandatory"
                    checked={feeForm.is_mandatory}
                    onChange={(e) => setFeeForm({...feeForm, is_mandatory: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-is-mandatory" className="ml-2 text-sm text-gray-700">
                    This is a mandatory fee
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update Fee Structure'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditFeeModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && selectedFee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirmModal(false)}>
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete Fee Structure?
              </h3>

              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the <strong>{selectedFee.category_name}</strong> fee structure for{' '}
                  {selectedFee.student_name || selectedFee.class || 'all students'}?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This action cannot be undone. All unpaid student fees linked to this structure will also be deleted.
                </p>
              </div>

              <div className="items-center px-4 py-3 gap-3 flex">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-base font-medium rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFee}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" onClick={() => setNotification({ show: false, type: '', message: '' })}>
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 text-center">
              {/* Icon */}
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h3 className={`text-lg leading-6 font-medium mt-4 ${
                notification.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {notification.type === 'success' ? 'Success!' : 'Error'}
              </h3>

              {/* Message */}
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-600">
                  {notification.message}
                </p>
              </div>

              {/* Button */}
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className={`px-4 py-2 ${
                    notification.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  } text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
