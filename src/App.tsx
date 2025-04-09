import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DangerMode from './pages/DangerMode';
import ApiTest from './pages/ApiTest';
import { ThemeToggle } from './components/ThemeToggle';

// Theme setup
const ThemeInitializer: React.FC = () => {
  useEffect(() => {
    // Check for user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return null;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isDangerMode } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isDangerMode) {
    return <Navigate to="/danger-mode" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeInitializer />
      <AuthProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-200">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/api-test" element={<ApiTest />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/danger-mode"
              element={
                <PrivateRoute>
                  <DangerMode />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
