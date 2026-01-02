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

    // Teachers and students: Don't redirect them, just show content
    // The SubscriptionBanner component will inform them about expired subscription
    // This prevents them from being logged out
    if (isTeacherRoute || isStudentRoute) {
      return children; // Allow access but banner will show subscription status
    }

    // Schools: redirect to subscription page
    return <Navigate to="/dashboard/subscription" replace />;
  }

  // User has access or route is allowed without subscription
  return children;
}
