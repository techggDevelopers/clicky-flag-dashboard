import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
    _id: string;
    username: string;
    email: string;
    role?: string;
    isDangerMode?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isDangerMode: boolean;
    setDangerMode: (value: boolean) => void;
}

// Configure axios defaults
// axios.defaults.baseURL = '/api';  // Use relative URL to avoid CORS issues
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDangerMode, setIsDangerMode] = useState(false);
    const navigate = useNavigate();

    // Set axios auth header with token
    const setAuthToken = (token: string | null) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    setAuthToken(token);
                    try {
                        const response = await axios.get('/api/auth/me');
                        setUser(response.data);

                        // Set danger mode state if needed
                        if (response.data.isDangerMode) {
                            setIsDangerMode(true);
                        }
                    } catch (error) {
                        console.error('Auth check failed:', error);
                        setAuthToken(null);
                    }
                }
            } catch (error) {
                console.error('Auth token error:', error);
                setAuthToken(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            // Store token in localStorage and set axios headers
            setAuthToken(token);

            // Set user state
            setUser(user);

            // Check if user is in danger mode
            if (user.isDangerMode) {
                setIsDangerMode(true);
                navigate('/danger-mode');
            } else {
                setIsDangerMode(false);
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login failed:', error);

            // Handle specific error responses from the server
            if (error.response) {
                // Extract the error message from the response
                const errorMessage = error.response.data?.message || 'Invalid credentials. Please try again.';

                // Handle specific statuses
                if (error.response.status === 401) {
                    throw new Error(errorMessage);
                } else if (error.response.status === 429) {
                    throw new Error('Too many login attempts. Please try again later.');
                } else {
                    throw new Error(errorMessage);
                }
            } else if (error.request) {
                // Request was made but no response received
                throw new Error('Server not responding. Please try again later.');
            } else {
                // Other errors
                throw new Error('Login failed. Please try again.');
            }
        }
    };

    const logout = () => {
        // Clear auth token
        setAuthToken(null);

        // Clear user state
        setUser(null);
        setIsDangerMode(false);

        // Navigate to login
        navigate('/login');
    };

    // Only used internally
    const setDangerMode = (value: boolean) => {
        setIsDangerMode(value);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isDangerMode, setDangerMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 