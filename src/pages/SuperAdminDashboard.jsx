import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { getSuperAdminAnalytics } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import SEO from '../components/SEO';

export default function SuperAdminDashboard() {
  const { toast } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Schools',
      value: analytics?.school_statistics?.total_schools || 0,
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Active Schools',
      value: analytics?.school_statistics?.active_schools || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Students',
      value: analytics?.student_statistics?.total_students || 0,
      icon: GraduationCap,
      color: 'bg-primary-500',
      textColor: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Total Teachers',
      value: analytics?.teacher_statistics?.total_teachers || 0,
      icon: Users,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(analytics?.revenue_statistics?.total_revenue),
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(analytics?.revenue_statistics?.monthly_revenue),
      icon: TrendingUp,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  const subscriptionStats = [
    {
      name: 'Subscribed',
      value: analytics?.school_statistics?.subscribed_schools || 0,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      name: 'Trial',
      value: analytics?.school_statistics?.trial_schools || 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      name: 'Expired',
      value: analytics?.school_statistics?.expired_schools || 0,
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  return (
    <>
      <SEO title="Super Admin Dashboard" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">System overview and statistics</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 ${stat.color} mr-3`} />
                    <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Schools & Expiring Soon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Growth</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">New schools (30 days)</span>
                <span className="text-lg font-bold text-blue-600">
                  {analytics?.recent_schools_30_days?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Successful Payments</span>
                <span className="text-lg font-bold text-green-600">
                  {analytics?.revenue_statistics?.successful_payments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-700">Failed Payments</span>
                <span className="text-lg font-bold text-red-600">
                  {analytics?.revenue_statistics?.failed_payments || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Schools Expiring Soon */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Expiring Soon</h2>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            {analytics?.schools_expiring_soon && analytics.schools_expiring_soon.length > 0 ? (
              <div className="space-y-2">
                {analytics.schools_expiring_soon.slice(0, 5).map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {school.school_name}
                      </p>
                      <p className="text-xs text-gray-500">{school.email}</p>
                    </div>
                    <div className="ml-3 text-right">
                      <p className="text-sm font-bold text-orange-600">
                        {school.days_remaining} {school.days_remaining === 1 ? 'day' : 'days'}
                      </p>
                      <p className="text-xs text-gray-500">{school.subscription_end_date}</p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/super-admin/schools"
                  className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium mt-3"
                >
                  View all schools →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No schools expiring in the next 7 days
              </p>
            )}
          </div>
        </div>

        {/* Top Schools */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Schools by Students</h2>
          </div>
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
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teachers
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.top_schools && analytics.top_schools.length > 0 ? (
                  analytics.top_schools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{school.school_name}</div>
                          <div className="text-sm text-gray-500">{school.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            school.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : school.subscription_status === 'trial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {school.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.student_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.teacher_count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No schools found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
