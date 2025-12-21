import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Power,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Users as UsersIcon,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getAllSchools,
  getSchoolDetails,
  toggleSchoolStatus,
  updateSchoolSubscription,
} from '../services/api';
import { useToastContext } from '../context/ToastContext';
import SEO from '../components/SEO';

export default function ManageSchools() {
  const { toast: showToast } = useToastContext();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    subscription_status: '',
    subscription_end_date: '',
  });

  useEffect(() => {
    fetchSchools();
  }, [currentPage, statusFilter]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
      };

      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const data = await getAllSchools(params);
      setSchools(data.schools || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      showToast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSchools();
  };

  const handleViewDetails = async (school) => {
    try {
      const details = await getSchoolDetails(school.id);
      setSelectedSchool(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch school details:', error);
      showToast.error('Failed to load school details');
    }
  };

  const handleToggleStatus = async (schoolId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this school?`)) {
      return;
    }

    try {
      await toggleSchoolStatus(schoolId, !currentStatus);
      showToast.success(`School ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchSchools();
    } catch (error) {
      console.error('Failed to toggle school status:', error);
      showToast.error('Failed to update school status');
    }
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();

    try {
      await updateSchoolSubscription(
        selectedSchool.school.id,
        subscriptionForm.subscription_status,
        subscriptionForm.subscription_end_date
      );
      showToast.success('Subscription updated successfully');
      setShowSubscriptionModal(false);
      setShowDetailsModal(false);
      fetchSchools();
    } catch (error) {
      console.error('Failed to update subscription:', error);
      showToast.error('Failed to update subscription');
    }
  };

  const openSubscriptionModal = (school) => {
    setSubscriptionForm({
      subscription_status: school.subscription_status,
      subscription_end_date: school.subscription_end_date || '',
    });
    setShowSubscriptionModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      trial: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      expired: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const badge = badges[status] || badges.expired;
    const Icon = badge.icon;

    return (
      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <>
      <SEO title="Manage Schools" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schools Management</h1>
            <p className="text-gray-500 mt-1">View and manage all schools in the system</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by school name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No schools found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-bold">
                                {school.school_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{school.school_name}</div>
                              <div className="text-sm text-gray-500">{school.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              school.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {school.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(school.subscription_status)}
                          {school.subscription_end_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Until {new Date(school.subscription_end_date).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              {school.total_students}
                            </div>
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1" />
                              {school.total_teachers}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {school.total_classes}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(school)}
                              className="text-purple-600 hover:text-purple-900"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(school.id, school.is_active)}
                              className={`${
                                school.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={school.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))}
                      disabled={currentPage === pagination.total_pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * pagination.per_page + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.per_page, pagination.total_items)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total_items}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {currentPage} of {pagination.total_pages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))}
                          disabled={currentPage === pagination.total_pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* School Details Modal */}
        {showDetailsModal && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSchool.school.school_name}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* School Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedSchool.school.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedSchool.school.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedSchool.school.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedSchool.school.total_students}</p>
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedSchool.school.total_teachers}</p>
                    <p className="text-sm text-gray-600">Teachers</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedSchool.school.total_classes}</p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Subscription Details</h3>
                    <button
                      onClick={() => openSubscriptionModal(selectedSchool.school)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      Update Subscription
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="mt-1">{getStatusBadge(selectedSchool.school.subscription_status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium mt-1">
                        {selectedSchool.school.subscription_end_date
                          ? new Date(selectedSchool.school.subscription_end_date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Students */}
                {selectedSchool.recent_students && selectedSchool.recent_students.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3">Recent Students</h3>
                    <div className="space-y-2">
                      {selectedSchool.recent_students.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              {student.class} - {student.admission_no}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(student.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Update Subscription Modal */}
        {showSubscriptionModal && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Update Subscription</h2>
              </div>
              <form onSubmit={handleUpdateSubscription} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Status
                  </label>
                  <select
                    value={subscriptionForm.subscription_status}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, subscription_status: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription End Date
                  </label>
                  <input
                    type="date"
                    value={subscriptionForm.subscription_end_date}
                    onChange={(e) =>
                      setSubscriptionForm({ ...subscriptionForm, subscription_end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
