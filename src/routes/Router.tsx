// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Authentication
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const AdminLogin = Loadable(lazy(() => import('../views/authentication/auth2/AdminLogin')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth2/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/auth2/ResetPassword')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// User Panel Pages
const UserDashboard = Loadable(lazy(() => import('../views/user/Dashboard')));
const Plans = Loadable(lazy(() => import('../views/user/Plans')));
const WhatsAppConnect = Loadable(lazy(() => import('../views/user/WhatsAppConnect')) as any);
const ApiKeys = Loadable(lazy(() => import('../views/user/ApiKeys')));
const SendMessage = Loadable(lazy(() => import('../views/user/SendMessage')));
const CSVUpload = Loadable(lazy(() => import('../views/user/CSVUpload')));
const MessageLogs = Loadable(lazy(() => import('../views/user/MessageLogs')));
const Billing = Loadable(lazy(() => import('../views/user/Billing')));
const Settings = Loadable(lazy(() => import('../views/user/Settings')));

// Admin Panel Pages
const AdminDashboard = Loadable(lazy(() => import('../views/admin/Dashboard')));
const AdminUsers = Loadable(lazy(() => import('../views/admin/Users')));
const AdminPlans = Loadable(lazy(() => import('../views/admin/Plans')));
const AdminPlanRequests = Loadable(lazy(() => import('../views/admin/PlanRequests')));
const AdminWhatsAppSessions = Loadable(lazy(() => import('../views/admin/WhatsAppSessions')));
const AdminMessageLogs = Loadable(lazy(() => import('../views/admin/MessageLogs')));
const AdminPayments = Loadable(lazy(() => import('../views/admin/Payments')));
const AdminSettings = Loadable(lazy(() => import('../views/admin/Settings')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { 
        path: '/', 
        exact: true, 
        element: (
          <ProtectedRoute>
            <Navigate to="/user/dashboard" />
          </ProtectedRoute>
        ) 
      },
      
      // User Panel Routes - Protected
      { 
        path: '/user/dashboard', 
        element: (
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/plans', 
        element: (
          <ProtectedRoute requiredRole="user">
            <Plans />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/whatsapp/connect', 
        element: (
          <ProtectedRoute requiredRole="user">
            <WhatsAppConnect />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/api-keys', 
        element: (
          <ProtectedRoute requiredRole="user">
            <ApiKeys />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/messages/send', 
        element: (
          <ProtectedRoute requiredRole="user">
            <SendMessage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/csv', 
        element: (
          <ProtectedRoute requiredRole="user">
            <CSVUpload />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/messages/logs', 
        element: (
          <ProtectedRoute requiredRole="user">
            <MessageLogs />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/billing', 
        element: (
          <ProtectedRoute requiredRole="user">
            <Billing />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/user/settings', 
        element: (
          <ProtectedRoute requiredRole="user">
            <Settings />
          </ProtectedRoute>
        ) 
      },
      
      // Admin Panel Routes - Protected
      { 
        path: '/admin/dashboard', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/users', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/plans', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminPlans />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/plan-requests', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminPlanRequests />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/whatsapp-sessions', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminWhatsAppSessions />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/messages', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminMessageLogs />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/payments', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminPayments />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/admin/settings', 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        ) 
      },
      
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { 
        path: '/auth/auth2/login', 
        element: (
          <PublicRoute>
            <Login2 />
          </PublicRoute>
        ) 
      },
      { 
        path: '/auth/auth2/register', 
        element: (
          <PublicRoute>
            <Register2 />
          </PublicRoute>
        ) 
      },
      { 
        path: '/auth/admin/login', 
        element: (
          <PublicRoute redirectTo="/admin/dashboard">
            <AdminLogin />
          </PublicRoute>
        ) 
      },
      { 
        path: '/auth/auth2/forgot-password', 
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        ) 
      },
      { 
        path: '/auth/auth2/reset-password', 
        element: (
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        ) 
      },
      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
