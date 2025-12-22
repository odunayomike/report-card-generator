import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { superAdminLogout } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import logo from '../assets/schoolhub.png';

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToastContext();
  const [superAdmin, setSuperAdmin] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load super admin data from localStorage
    const userType = localStorage.getItem('userType');
    const superAdminData = localStorage.getItem('superAdminData');

    if (userType === 'super_admin' && superAdminData) {
      setSuperAdmin(JSON.parse(superAdminData));
    } else {
      navigate('/super-admin/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await superAdminLogout();
      localStorage.removeItem('userType');
      localStorage.removeItem('superAdminData');
      toast.success('Logged out successfully');
      navigate('/super-admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage anyway
      localStorage.removeItem('userType');
      localStorage.removeItem('superAdminData');
      navigate('/super-admin/login');
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/super-admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Schools',
      path: '/super-admin/schools',
      icon: Building2,
    },
    {
      name: 'All Students',
      path: '/super-admin/students',
      icon: GraduationCap,
    },
    {
      name: 'Analytics',
      path: '/super-admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Activity Log',
      path: '/super-admin/activity-log',
      icon: Users,
    },
  ];

  const isActive = (path) => location.pathname === path;

  if (!superAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-portal="admin">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-primary-900 to-primary-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 p-2 rounded-md hover:bg-primary-800"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center">
                <img src={logo} alt="SchoolHub" className="h-10 w-10" />
                <span className="ml-3 text-xl font-bold">Super Admin Portal</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 hover:bg-primary-800 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                    {superAdmin.name ? superAdmin.name.charAt(0).toUpperCase() : 'SA'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{superAdmin.name}</p>
                    <p className="text-xs text-primary-200">System Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{superAdmin.name}</p>
                      <p className="text-xs text-gray-500">{superAdmin.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto pt-16 lg:pt-16">
            <div className="px-4 py-6">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Admin Info */}
            <div className="px-4 py-4 mt-auto border-t border-gray-200">
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5">
                    <img src={logo} alt="SchoolHub" className="w-full h-full object-contain" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{superAdmin.name}</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden lg:ml-64">
          <div className="p-8">
            <Outlet context={{ superAdmin }} />
          </div>
        </main>
      </div>
    </div>
  );
}
