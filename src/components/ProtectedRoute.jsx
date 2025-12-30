import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute - Restricts access to pages based on subscription status
 *
 * If user has no subscription access, redirects to subscription page
 * Exception: The subscription page itself and profile/settings are always accessible
 */
export default function ProtectedRoute({ children, school, allowedWithoutSubscription = false }) {
  const location = useLocation();
  const hasAccess = school?.has_access !== false;

  // If user doesn't have access and this route requires subscription
  if (!hasAccess && !allowedWithoutSubscription) {
    // Determine redirect path based on current path
    const isTeacherRoute = location.pathname.startsWith('/teacher');
    const isStudentRoute = location.pathname.startsWith('/student');

    // Teachers and students: show message explaining school subscription expired
    if (isTeacherRoute || isStudentRoute) {
      // For now, redirect to dashboard/subscription (school admin needs to renew)
      // In future, you could create a special "contact admin" page
      return <Navigate to="/dashboard/subscription" replace />;
    }

    // Schools: redirect to subscription page
    return <Navigate to="/dashboard/subscription" replace />;
  }

  // User has access or route is allowed without subscription
  return children;
}
