import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { authAPI } from 'src/services/api';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute = ({ children, redirectTo }: PublicRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const data = await authAPI.getMe();
        setIsAuthenticated(true);
        setUserRole(data.user?.role || 'user');
      } catch (error) {
        // Token is invalid
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow reset-password route to be accessible even when authenticated
  // The reset token in the URL is what validates the reset, not auth status
  const isResetPasswordRoute = location.pathname === '/auth/auth2/reset-password';

  // If user is authenticated, redirect to appropriate dashboard
  // BUT skip redirect for reset-password route
  if (isAuthenticated && !isResetPasswordRoute) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Auto-redirect based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;

