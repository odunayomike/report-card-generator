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
import ProtectedRoute from './components/ProtectedRoute';

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
      // Check student session from backend first
      try {
        const studentResponse = await fetch(`${API_BASE_URL}/auth/student-check-session`, {
          credentials: 'include'
        });

        if (studentResponse.ok) {
          const studentData = await studentResponse.json();

          if (studentData.authenticated) {
            setStudent({
              ...studentData.student,
              subscription: studentData.subscription
            });
            localStorage.setItem('userType', 'student');
            localStorage.setItem('studentData', JSON.stringify({
              ...studentData.student,
              subscription: studentData.subscription
            }));
            setLoading(false);
            return;
          }
        }
      } catch {
        // Silent fail - not a student, will check other session types
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
          // Include school subscription info in teacher object
          setTeacher({
            ...teacherData.user,
            school: teacherData.school
          });
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
          <Route index element={<ProtectedRoute school={school}><DashboardHome school={school} /></ProtectedRoute>} />
          <Route path="create" element={<ProtectedRoute school={school}><CreateReport school={school} /></ProtectedRoute>} />
          <Route path="add-student" element={<ProtectedRoute school={school}><AddStudent /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute school={school}><AllStudents /></ProtectedRoute>} />
          <Route path="students/:admissionNo" element={<ProtectedRoute school={school}><StudentProfile /></ProtectedRoute>} />
          <Route path="student-details/:admissionNo" element={<ProtectedRoute school={school}><StudentDetails /></ProtectedRoute>} />
          <Route path="manage-parents" element={<ProtectedRoute school={school}><ManageParents /></ProtectedRoute>} />
          <Route path="view-parents" element={<ProtectedRoute school={school}><ViewParents /></ProtectedRoute>} />
          <Route path="add-parent" element={<ProtectedRoute school={school}><AddParent /></ProtectedRoute>} />
          <Route path="reports/:id" element={<ProtectedRoute school={school}><ViewReport school={school} /></ProtectedRoute>} />
          <Route path="reports/:id/edit" element={<ProtectedRoute school={school}><EditReport school={school} /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><SchoolProfile /></ProtectedRoute>} />
          <Route path="profile/edit" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><EditSchoolProfile /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><SchoolSettings /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute school={school}><ViewAttendance /></ProtectedRoute>} />
          <Route path="manage-teachers" element={<ProtectedRoute school={school}><ManageTeachers /></ProtectedRoute>} />
          <Route path="accounting/*" element={<ProtectedRoute school={school}><AccountingDashboard /></ProtectedRoute>} />
          <Route path="cbt" element={<ProtectedRoute school={school}><CBTDashboard /></ProtectedRoute>} />
          <Route path="cbt/questions" element={<ProtectedRoute school={school}><QuestionBank /></ProtectedRoute>} />
          <Route path="cbt/exams" element={<ProtectedRoute school={school}><ExamManagement /></ProtectedRoute>} />
          <Route path="cbt/results" element={<ProtectedRoute school={school}><ExamResultsList /></ProtectedRoute>} />
          <Route path="subscription" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><Subscription /></ProtectedRoute>} />
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
          <Route path="dashboard" element={<ProtectedRoute school={teacher?.school}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="mark-attendance" element={<ProtectedRoute school={teacher?.school}><AttendanceMarker /></ProtectedRoute>} />
          <Route path="add-student" element={<ProtectedRoute school={teacher?.school}><AddStudent /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute school={teacher?.school}><AllStudents /></ProtectedRoute>} />
          <Route path="students/:admissionNo" element={<ProtectedRoute school={teacher?.school}><StudentProfile /></ProtectedRoute>} />
          <Route path="student-details/:admissionNo" element={<ProtectedRoute school={teacher?.school}><StudentDetails /></ProtectedRoute>} />
          <Route path="create-report" element={<ProtectedRoute school={teacher?.school}><CreateReport school={teacher?.school_id ? { id: teacher.school_id } : school} /></ProtectedRoute>} />
          <Route path="reports/:id" element={<ProtectedRoute school={teacher?.school}><ViewReport school={teacher?.school_id ? { id: teacher.school_id } : school} /></ProtectedRoute>} />
          <Route path="reports/:id/edit" element={<ProtectedRoute school={teacher?.school}><EditReport school={teacher?.school_id ? { id: teacher.school_id } : school} /></ProtectedRoute>} />
          <Route path="cbt" element={<ProtectedRoute school={teacher?.school}><CBTDashboard /></ProtectedRoute>} />
          <Route path="cbt/questions" element={<ProtectedRoute school={teacher?.school}><QuestionBank /></ProtectedRoute>} />
          <Route path="cbt/exams" element={<ProtectedRoute school={teacher?.school}><ExamManagement /></ProtectedRoute>} />
          <Route path="cbt/results" element={<ProtectedRoute school={teacher?.school}><ExamResultsList /></ProtectedRoute>} />
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
          <Route path="dashboard" element={<ProtectedRoute school={student?.subscription}><StudentDashboardHome /></ProtectedRoute>} />
          <Route path="exams" element={<ProtectedRoute school={student?.subscription}><StudentExams /></ProtectedRoute>} />
          <Route path="take-exam/:examId" element={<ProtectedRoute school={student?.subscription}><TakeExam /></ProtectedRoute>} />
          <Route path="results/:examId" element={<ProtectedRoute school={student?.subscription}><ExamResults /></ProtectedRoute>} />
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
