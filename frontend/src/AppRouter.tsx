import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SendEmailView from './components/SendEmailView';
import BulkEmailView from './components/BulkEmailView';
import TemplatesView from './components/TemplatesView';
import ContactListsView from './components/ContactListsView';
import ConfigurationView from './components/ConfigurationView';
import UserManagementView from './components/UserManagementView';
import PasswordChangeView from './components/PasswordChangeView';
import AuthForm from './components/AuthForm';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthForm onSuccess={() => window.location.href = '/'} />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/send" replace />,
      },
      {
        path: 'send',
        element: <SendEmailView />,
      },
      {
        path: 'bulk',
        element: <BulkEmailView />,
      },
      {
        path: 'templates',
        element: <TemplatesView />,
      },
      {
        path: 'contacts',
        element: <ContactListsView />,
      },
      {
        path: 'config',
        element: <ConfigurationView />,
      },
      {
        path: 'users',
        element: <UserManagementView />,
      },
      {
        path: 'password',
        element: <PasswordChangeView />,
      },
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
