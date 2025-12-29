import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { API_BASE_URL } from './config/env';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './components/DashboardLayout';
import TeacherDashboardLayout from './components/TeacherDashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CreateReport from './pages/CreateReport';
import AllStudents from './pages/AllStudents';
import ViewReport from './pages/ViewReport';
import EditReport from './pages/EditReport';
import StudentProfile from './pages/StudentProfile';
import SchoolProfile from './pages/SchoolProfile';
import EditSchoolProfile from './pages/EditSchoolProfile';
import SchoolSettings from './pages/SchoolSettings';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import AttendanceMarker from './pages/AttendanceMarker';
import ManageTeachers from './pages/ManageTeachers';
import ViewAttendance from './pages/ViewAttendance';
import ComingSoon from './pages/ComingSoon';
import VerifyPayment from './pages/VerifyPayment';
import AddStudent from './pages/AddStudent';
import ManageParents from './pages/ManageParents';
import ViewParents from './pages/ViewParents';
import AddParent from './pages/AddParent';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Subscription from './pages/Subscription';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageSchools from './pages/ManageSchools';
import AllStudentsAdmin from './pages/AllStudentsAdmin';
import ContactMessagesAdmin from './pages/ContactMessagesAdmin';
import CBTDashboard from './pages/cbt/CBTDashboard';
import QuestionBank from './pages/cbt/QuestionBank';
import ExamManagement from './pages/cbt/ExamManagement';
import ExamResultsList from './pages/cbt/ExamResultsList';
import StudentExams from './pages/cbt/StudentExams';
import TakeExam from './pages/cbt/TakeExam';
import ExamResults from './pages/cbt/ExamResults';
import StudentLogin from './pages/StudentLogin';
import StudentDashboardLayout from './components/StudentDashboardLayout';
import StudentDashboardHome from './pages/StudentDashboardHome';
import ParentAPIDocs from './pages/ParentAPIDocs';
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import StudentDetails from './pages/StudentDetails';

function App() {
  const [school, setSchool] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check for stored session in localStorage
      const userType = localStorage.getItem('userType');

      if (userType === 'student') {
        const studentData = localStorage.getItem('studentData');
        if (studentData) {
          setStudent(JSON.parse(studentData));
          setLoading(false);
          return;
        }
      }

      // Check super admin session first
      try {
        const superAdminResponse = await fetch(`${API_BASE_URL}/super-admin/check-session`, {
          credentials: 'include'
        });

        if (superAdminResponse.ok) {
          const superAdminData = await superAdminResponse.json();

          if (superAdminData.authenticated) {
            setSuperAdmin(superAdminData.user);
            localStorage.setItem('userType', 'super_admin');
            localStorage.setItem('superAdminData', JSON.stringify(superAdminData.user));
            setLoading(false);
            return;
          }
        }
      } catch {
        // Silent fail - not a super admin, will check other session types
      }

      // Check school session
      const schoolResponse = await fetch(`${API_BASE_URL}/auth/check-session`, {
        credentials: 'include'
      });
      const schoolData = await schoolResponse.json();

      if (schoolData.authenticated) {
        setSchool(schoolData.school);
      } else {
        // Check teacher session if school is not authenticated
        const teacherResponse = await fetch(`${API_BASE_URL}/auth/teacher-check-session`, {
          credentials: 'include'
        });
        const teacherData = await teacherResponse.json();

        if (teacherData.authenticated) {
          setTeacher(teacherData.user);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (schoolData) => {
    setSchool(schoolData);
  };

  const handleRegister = (schoolData) => {
    setSchool(schoolData);
  };

  const handleLogout = () => {
    setSchool(null);
  };

  const handleTeacherLogin = (teacherData) => {
    setTeacher(teacherData);
  };

  const handleTeacherLogout = () => {
    setTeacher(null);
  };

  const handleSuperAdminLogin = (superAdminData) => {
    setSuperAdmin(superAdminData);
  };

  const handleSuperAdminLogout = () => {
    setSuperAdmin(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('superAdminData');
  };

  const handleStudentLogin = (studentData) => {
    setStudent(studentData);
  };

  const handleStudentLogout = () => {
    setStudent(null);
  };

  const refreshSchool = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-session`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated) {
        setSchool(data.school);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  // Let the HTML loader handle the initial loading state
  // if (loading) {
  //   return null;
  // }

  return (
    <HelmetProvider>
      <CurrencyProvider>
        <Router>
          <ScrollToTop />
          <CookieBanner />
          <Routes>
        <Route
          path="/"
          element={school ? <Navigate to="/dashboard" /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={school ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={school ? <Navigate to="/dashboard" /> : <Register onRegister={handleRegister} />}
        />

        {/* Public Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/parent-api-docs" element={<ParentAPIDocs />} />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin/login"
          element={superAdmin ? <Navigate to="/super-admin/dashboard" /> : <SuperAdminLogin onLogin={handleSuperAdminLogin} />}
        />
        <Route
          path="/super-admin"
          element={superAdmin ? <SuperAdminLayout superAdmin={superAdmin} onLogout={handleSuperAdminLogout} /> : <Navigate to="/super-admin/login" />}
        >
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="schools" element={<ManageSchools />} />
          <Route path="students" element={<AllStudentsAdmin />} />
          <Route path="contact-messages" element={<ContactMessagesAdmin />} />
          <Route path="analytics" element={<SuperAdminDashboard />} />
          <Route path="activity-log" element={<ComingSoon feature="Activity Log" />} />
        </Route>

        {/* Dashboard Routes with Nested Layout */}
        <Route
          path="/dashboard"
          element={school ? <DashboardLayout school={school} onLogout={handleLogout} refreshSchool={refreshSchool} /> : <Navigate to="/login" />}
        >
          <Route index element={<DashboardHome school={school} />} />
          <Route path="create" element={<CreateReport school={school} />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="students" element={<AllStudents />} />
          <Route path="students/:admissionNo" element={<StudentProfile />} />
          <Route path="student-details/:admissionNo" element={<StudentDetails />} />
          <Route path="manage-parents" element={<ManageParents />} />
          <Route path="view-parents" element={<ViewParents />} />
          <Route path="add-parent" element={<AddParent />} />
          <Route path="reports/:id" element={<ViewReport school={school} />} />
          <Route path="reports/:id/edit" element={<EditReport school={school} />} />
          <Route path="profile" element={<SchoolProfile />} />
          <Route path="profile/edit" element={<EditSchoolProfile />} />
          <Route path="settings" element={<SchoolSettings />} />
          <Route path="attendance" element={<ViewAttendance />} />
          <Route path="manage-teachers" element={<ManageTeachers />} />
          <Route path="accounting/*" element={<AccountingDashboard />} />
          <Route path="cbt" element={<CBTDashboard />} />
          <Route path="cbt/questions" element={<QuestionBank />} />
          <Route path="cbt/exams" element={<ExamManagement />} />
          <Route path="cbt/results" element={<ExamResultsList />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>

        {/* Subscription Routes (accessible by authenticated schools) */}
        <Route
          path="/subscription/verify"
          element={school ? <VerifyPayment /> : <Navigate to="/login" />}
        />

        {/* Teacher Routes with Nested Layout */}
        <Route
          path="/teacher/login"
          element={teacher ? <Navigate to="/teacher/dashboard" /> : <TeacherLogin onLogin={handleTeacherLogin} />}
        />
        <Route
          path="/teacher"
          element={teacher ? <TeacherDashboardLayout teacher={teacher} onLogout={handleTeacherLogout} /> : <Navigate to="/teacher/login" />}
        >
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="mark-attendance" element={<AttendanceMarker />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="students" element={<AllStudents />} />
          <Route path="students/:admissionNo" element={<StudentProfile />} />
          <Route path="student-details/:admissionNo" element={<StudentDetails />} />
          <Route path="create-report" element={<CreateReport school={teacher?.school_id ? { id: teacher.school_id } : school} />} />
          <Route path="reports/:id" element={<ViewReport school={teacher?.school_id ? { id: teacher.school_id } : school} />} />
          <Route path="reports/:id/edit" element={<EditReport school={teacher?.school_id ? { id: teacher.school_id } : school} />} />
          <Route path="cbt" element={<CBTDashboard />} />
          <Route path="cbt/questions" element={<QuestionBank />} />
          <Route path="cbt/exams" element={<ExamManagement />} />
          <Route path="cbt/results" element={<ExamResultsList />} />
        </Route>


        {/* Student Routes */}
        <Route
          path="/student/login"
          element={student ? <Navigate to="/student/dashboard" /> : <StudentLogin onLogin={handleStudentLogin} />}
        />
        <Route
          path="/student"
          element={student ? <StudentDashboardLayout student={student} onLogout={handleStudentLogout} /> : <Navigate to="/student/login" />}
        >
          <Route path="dashboard" element={<StudentDashboardHome />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="take-exam/:examId" element={<TakeExam />} />
          <Route path="results/:examId" element={<ExamResults />} />
        </Route>

        {/* StudentForm for school admin */}
        <Route
          path="/student-form"
          element={<CreateReport school={school} />}
        />

        <Route
          path="*"
          element={<Navigate to="/" />}
        />
          </Routes>
        </Router>
      </CurrencyProvider>
    </HelmetProvider>
  );
}

export default App;
