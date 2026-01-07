import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { API_BASE_URL } from './config/env';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SkeletonLoader from './components/SkeletonLoader';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ParentAPIDocs = lazy(() => import('./pages/ParentAPIDocs'));

// Lazy load dashboard and authenticated components
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const TeacherDashboardLayout = lazy(() => import('./components/TeacherDashboardLayout'));
const StudentDashboardLayout = lazy(() => import('./components/StudentDashboardLayout'));
const SuperAdminLayout = lazy(() => import('./components/SuperAdminLayout'));

// Dashboard pages
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const CreateReport = lazy(() => import('./pages/CreateReport'));
const AllStudents = lazy(() => import('./pages/AllStudents'));
const ViewReport = lazy(() => import('./pages/ViewReport'));
const EditReport = lazy(() => import('./pages/EditReport'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const SchoolProfile = lazy(() => import('./pages/SchoolProfile'));
const EditSchoolProfile = lazy(() => import('./pages/EditSchoolProfile'));
const SchoolSettings = lazy(() => import('./pages/SchoolSettings'));
const PromotionSettings = lazy(() => import('./pages/PromotionSettings'));
const ViewAttendance = lazy(() => import('./pages/ViewAttendance'));
const ManageTeachers = lazy(() => import('./pages/ManageTeachers'));
const ManageClassSubjects = lazy(() => import('./pages/ManageClassSubjects'));
const ManageStudentSubjects = lazy(() => import('./pages/ManageStudentSubjects'));
const AddStudent = lazy(() => import('./pages/AddStudent'));
const ManageParents = lazy(() => import('./pages/ManageParents'));
const ViewParents = lazy(() => import('./pages/ViewParents'));
const AddParent = lazy(() => import('./pages/AddParent'));
const Subscription = lazy(() => import('./pages/Subscription'));
const VerifyPayment = lazy(() => import('./pages/VerifyPayment'));
const StudentDetails = lazy(() => import('./pages/StudentDetails'));
const SendAnnouncement = lazy(() => import('./pages/SendAnnouncement'));
const AccountingDashboard = lazy(() => import('./pages/accounting/AccountingDashboard'));

// Teacher pages
const TeacherLogin = lazy(() => import('./pages/TeacherLogin'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AttendanceMarker = lazy(() => import('./pages/AttendanceMarker'));

// Student pages
const StudentLogin = lazy(() => import('./pages/StudentLogin'));
const StudentDashboardHome = lazy(() => import('./pages/StudentDashboardHome'));

// External Student pages
const PublicRegister = lazy(() => import('./pages/PublicRegister'));
const ExternalStudentLogin = lazy(() => import('./pages/external-students/ExternalStudentLogin'));
const ExternalStudentDashboardLayout = lazy(() => import('./components/ExternalStudentDashboardLayout'));
const ExternalStudentDashboardHome = lazy(() => import('./pages/external-students/ExternalStudentDashboardHome'));
const ExternalStudentExams = lazy(() => import('./pages/external-students/ExternalStudentExams'));

// Super Admin pages
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const ManageSchools = lazy(() => import('./pages/ManageSchools'));
const AllStudentsAdmin = lazy(() => import('./pages/AllStudentsAdmin'));
const ContactMessagesAdmin = lazy(() => import('./pages/ContactMessagesAdmin'));
const SuperAdminMFASettings = lazy(() => import('./pages/SuperAdminMFASettings'));

// CBT pages
const CBTDashboard = lazy(() => import('./pages/cbt/CBTDashboard'));
const QuestionBank = lazy(() => import('./pages/cbt/QuestionBank'));
const ExamManagement = lazy(() => import('./pages/cbt/ExamManagement'));
const ExamResultsList = lazy(() => import('./pages/cbt/ExamResultsList'));
const StudentExams = lazy(() => import('./pages/cbt/StudentExams'));
const TakeExam = lazy(() => import('./pages/cbt/TakeExam'));
const ExamResults = lazy(() => import('./pages/cbt/ExamResults'));
const ManageExternalStudents = lazy(() => import('./pages/ManageExternalStudents'));

// Shared pages
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

function App() {
  const [school, setSchool] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [externalStudent, setExternalStudent] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedUserType = localStorage.getItem('userType');

      // If no stored user type, check all session endpoints to restore session
      if (!storedUserType) {
        try {
          // Try school session first (most common)
          const schoolResponse = await fetch(`${API_BASE_URL}/auth/check-session`, {
            credentials: 'include'
          });
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json();
            if (schoolData.authenticated) {
              setSchool(schoolData.school);
              localStorage.setItem('userType', 'school');
              setLoading(false);
              return;
            }
          }

          // Try teacher session
          const teacherResponse = await fetch(`${API_BASE_URL}/auth/teacher-check-session`, {
            credentials: 'include'
          });
          if (teacherResponse.ok) {
            const teacherData = await teacherResponse.json();
            if (teacherData.authenticated) {
              setTeacher({
                ...teacherData.user,
                school: teacherData.school
              });
              localStorage.setItem('userType', 'teacher');
              setLoading(false);
              return;
            }
          }

          // Try student session
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

          // Try super admin session
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

          // Try external student session
          const externalStudentResponse = await fetch(`${API_BASE_URL}/external-students/check-session`, {
            credentials: 'include'
          });
          if (externalStudentResponse.ok) {
            const externalStudentData = await externalStudentResponse.json();
            if (externalStudentData.authenticated) {
              setExternalStudent(externalStudentData.data.external_student);
              localStorage.setItem('userType', 'external_student');
              localStorage.setItem('externalStudentData', JSON.stringify(externalStudentData.data.external_student));
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Session restore error:', error);
        }

        setLoading(false);
        return;
      }

      switch (storedUserType) {
        case 'student':
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
                localStorage.setItem('studentData', JSON.stringify({
                  ...studentData.student,
                  subscription: studentData.subscription
                }));
              } else {
                localStorage.removeItem('userType');
                localStorage.removeItem('studentData');
              }
            }
          } catch (error) {
            console.error('Student session check error:', error);
            localStorage.removeItem('userType');
            localStorage.removeItem('studentData');
          }
          break;

        case 'super_admin':
          try {
            const superAdminResponse = await fetch(`${API_BASE_URL}/super-admin/check-session`, {
              credentials: 'include'
            });

            if (superAdminResponse.ok) {
              const superAdminData = await superAdminResponse.json();

              if (superAdminData.authenticated) {
                setSuperAdmin(superAdminData.user);
                localStorage.setItem('superAdminData', JSON.stringify(superAdminData.user));
              } else {
                localStorage.removeItem('userType');
                localStorage.removeItem('superAdminData');
              }
            }
          } catch (error) {
            console.error('Super admin session check error:', error);
            localStorage.removeItem('userType');
            localStorage.removeItem('superAdminData');
          }
          break;

        case 'external_student':
          try {
            const externalStudentResponse = await fetch(`${API_BASE_URL}/external-students/check-session`, {
              credentials: 'include'
            });

            if (externalStudentResponse.ok) {
              const externalStudentData = await externalStudentResponse.json();

              if (externalStudentData.authenticated) {
                setExternalStudent(externalStudentData.data.external_student);
                localStorage.setItem('externalStudentData', JSON.stringify(externalStudentData.data.external_student));
              } else {
                localStorage.removeItem('userType');
                localStorage.removeItem('externalStudentData');
              }
            }
          } catch (error) {
            console.error('External student session check error:', error);
            localStorage.removeItem('userType');
            localStorage.removeItem('externalStudentData');
          }
          break;

        case 'teacher':
          try {
            const teacherResponse = await fetch(`${API_BASE_URL}/auth/teacher-check-session`, {
              credentials: 'include'
            });

            if (teacherResponse.ok) {
              const teacherData = await teacherResponse.json();

              if (teacherData.authenticated) {
                setTeacher({
                  ...teacherData.user,
                  school: teacherData.school
                });
              } else {
                localStorage.removeItem('userType');
              }
            }
          } catch (error) {
            console.error('Teacher session check error:', error);
            localStorage.removeItem('userType');
          }
          break;

        case 'school':
        default:
          try {
            const schoolResponse = await fetch(`${API_BASE_URL}/auth/check-session`, {
              credentials: 'include'
            });

            if (schoolResponse.ok) {
              const schoolData = await schoolResponse.json();

              if (schoolData.authenticated) {
                setSchool(schoolData.school);
              } else {
                localStorage.removeItem('userType');
              }
            }
          } catch (error) {
            console.error('School session check error:', error);
            localStorage.removeItem('userType');
          }
          break;
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

  const handleExternalStudentLogin = (externalStudentData) => {
    setExternalStudent(externalStudentData.external_student);
  };

  const handleExternalStudentLogout = () => {
    setExternalStudent(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('externalStudentData');
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

  // Keep the HTML loader visible while checking session
  if (loading) {
    // Return a simple div to prevent routes from rendering
    // The #initial-loader from index.html will remain visible
    // Add a safety timeout to prevent infinite loading
    setTimeout(() => {
      if (loading) {
        console.warn('Session check timed out, proceeding anyway');
        setLoading(false);
      }
    }, 5000);
    return <div id="app-loading"></div>;
  }

  return (
    <HelmetProvider>
      <CurrencyProvider>
        <Router>
          <ScrollToTop />
          <CookieBanner />
          <Suspense fallback={<SkeletonLoader />}>
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
          path="/school-register"
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

        {/* Public Registration for External Students (No Auth Required) */}
        <Route path="/register/:slug" element={<PublicRegister />} />
        <Route path="/register" element={<PublicRegister />} />

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
          <Route path="settings/mfa" element={<SuperAdminMFASettings />} />
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
          <Route path="send-announcement" element={<ProtectedRoute school={school}><SendAnnouncement /></ProtectedRoute>} />
          <Route path="reports/:id" element={<ProtectedRoute school={school}><ViewReport school={school} /></ProtectedRoute>} />
          <Route path="reports/:id/edit" element={<ProtectedRoute school={school}><EditReport school={school} /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><SchoolProfile /></ProtectedRoute>} />
          <Route path="profile/edit" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><EditSchoolProfile /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><SchoolSettings /></ProtectedRoute>} />
          <Route path="promotion-settings" element={<ProtectedRoute school={school} allowedWithoutSubscription={true}><PromotionSettings /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute school={school}><ViewAttendance /></ProtectedRoute>} />
          <Route path="manage-teachers" element={<ProtectedRoute school={school}><ManageTeachers /></ProtectedRoute>} />
          <Route path="manage-class-subjects" element={<ProtectedRoute school={school}><ManageClassSubjects /></ProtectedRoute>} />
          <Route path="manage-student-subjects" element={<ProtectedRoute school={school}><ManageStudentSubjects /></ProtectedRoute>} />
          <Route path="accounting/*" element={<ProtectedRoute school={school}><AccountingDashboard /></ProtectedRoute>} />
          <Route path="cbt" element={<ProtectedRoute school={school}><CBTDashboard /></ProtectedRoute>} />
          <Route path="cbt/questions" element={<ProtectedRoute school={school}><QuestionBank /></ProtectedRoute>} />
          <Route path="cbt/exams" element={<ProtectedRoute school={school}><ExamManagement /></ProtectedRoute>} />
          <Route path="cbt/results" element={<ProtectedRoute school={school}><ExamResultsList /></ProtectedRoute>} />
          <Route path="external-students" element={<ProtectedRoute school={school}><ManageExternalStudents /></ProtectedRoute>} />
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
          <Route path="manage-class-subjects" element={<ProtectedRoute school={teacher?.school}><ManageClassSubjects /></ProtectedRoute>} />
          <Route path="manage-student-subjects" element={<ProtectedRoute school={teacher?.school}><ManageStudentSubjects /></ProtectedRoute>} />
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

        {/* External Student Routes (for entrance examinations) */}
        <Route
          path="/external-student/login"
          element={externalStudent ? <Navigate to="/external-student/dashboard" /> : <ExternalStudentLogin onLogin={handleExternalStudentLogin} />}
        />
        <Route
          path="/external-student"
          element={externalStudent ? <ExternalStudentDashboardLayout externalStudent={externalStudent} onLogout={handleExternalStudentLogout} /> : <Navigate to="/external-student/login" />}
        >
          <Route path="dashboard" element={<ExternalStudentDashboardHome externalStudent={externalStudent} />} />
          <Route path="exams" element={<ExternalStudentExams />} />
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
          </Suspense>
        </Router>
      </CurrencyProvider>
    </HelmetProvider>
  );
}

export default App;
