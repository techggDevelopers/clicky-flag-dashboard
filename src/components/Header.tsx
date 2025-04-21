import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ title, description }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Default values
  let defaultTitle = 'Blogs';
  let defaultDescription = 'Read and make your Knowledge grow';

  // Override defaults if on dashboard route
  if (location.pathname === '/dashboard') {
    defaultTitle = 'Flag Dashboard';
    defaultDescription = 'Manage your feature flags';
  }

  // Use provided props or defaults
  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;

  return (
    <header className="bg-white shadow dark:bg-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className={user ? "flex justify-between items-center" : "text-center"}>
          <div className={user ? "" : "mx-auto"}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{displayTitle}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{displayDescription}</p>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome User</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
