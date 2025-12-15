import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CreateReport from './pages/CreateReport';
import AllStudents from './pages/AllStudents';
import ViewReport from './pages/ViewReport';
import EditReport from './pages/EditReport';
import StudentProfile from './pages/StudentProfile';
import SchoolProfile from './pages/SchoolProfile';
import EditSchoolProfile from './pages/EditSchoolProfile';
import SchoolSettings from './pages/SchoolSettings';

function App() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/check-session', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.authenticated) {
        setSchool(data.school);
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

  const refreshSchool = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/check-session', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
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

        {/* Dashboard Routes with Nested Layout */}
        <Route
          path="/dashboard"
          element={school ? <DashboardLayout school={school} onLogout={handleLogout} refreshSchool={refreshSchool} /> : <Navigate to="/login" />}
        >
          <Route index element={<DashboardHome school={school} />} />
          <Route path="create" element={<CreateReport school={school} />} />
          <Route path="students" element={<AllStudents />} />
          <Route path="students/:admissionNo" element={<StudentProfile />} />
          <Route path="reports/:id" element={<ViewReport school={school} />} />
          <Route path="reports/:id/edit" element={<EditReport school={school} />} />
          <Route path="profile" element={<SchoolProfile />} />
          <Route path="profile/edit" element={<EditSchoolProfile />} />
          <Route path="settings" element={<SchoolSettings />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
