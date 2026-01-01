import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { authAPI } from 'src/services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
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
        // Token is invalid or expired
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on route
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/auth/admin/login" replace state={{ from: location }} />;
    }
    return <Navigate to="/auth/auth2/login" replace state={{ from: location }} />;
  }

  // Check role-based access
  if (requiredRole) {
    if (requiredRole === 'admin' && userRole !== 'admin') {
      // User trying to access admin route
      return <Navigate to="/user/dashboard" replace />;
    }
    if (requiredRole === 'user' && userRole === 'admin' && location.pathname.startsWith('/user')) {
      // Admin can access user routes, but if they're on admin route and not admin, redirect
      // This is handled above
    }
  }

  // Prevent admin from accessing user routes if they're on admin route
  if (userRole === 'admin' && location.pathname.startsWith('/user') && requiredRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Prevent user from accessing admin routes
  if (userRole === 'user' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

