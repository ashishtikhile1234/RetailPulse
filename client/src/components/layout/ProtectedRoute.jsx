import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Spinner shown while verifying token on mount
const FullPageSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
    <div className="spinner" />
  </div>
);

/**
 * ProtectedRoute — wraps a route that requires authentication.
 * Optionally accepts `allowedRoles` to restrict by role.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard for their role
    const dashboardMap = { admin: '/admin/dashboard', user: '/stores', store_owner: '/owner/dashboard' };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
};

/**
 * PublicRoute — redirects authenticated users away from login/register.
 */
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;

  if (user) {
    const dashboardMap = { admin: '/admin/dashboard', user: '/stores', store_owner: '/owner/dashboard' };
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  return children;
};
