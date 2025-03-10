import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotFound: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    return user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-base text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link
            to={getDashboardLink()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;