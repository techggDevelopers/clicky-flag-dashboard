
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Use environment variable or default to the Vercel deployed backend
const API_URL = import.meta.env.VITE_API_URL || 'https://clicky-flag-dashboard-api.vercel.app/';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface LoginError {
  message: string;
  attemptsRemaining?: number;
  locked?: boolean;
  remainingTime?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loginError: LoginError | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string>;
  logout: () => void;
  clearLoginError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loginError: null,
      
      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          });
          
          const { user, token } = response.data;
          
          set({ 
            isAuthenticated: true,
            user,
            token,
            loginError: null
          });
          
          // Set the Authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          console.error("Login error:", error);
          
          const errorData = error.response?.data || {};
          const loginError: LoginError = {
            message: errorData.message || "Invalid credentials",
            attemptsRemaining: errorData.attemptsRemaining,
            locked: errorData.locked,
            remainingTime: errorData.remainingTime
          };
          
          set({ loginError });
          throw new Error(loginError.message);
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password
          });
          
          // After successful registration, automatically log the user in
          const { user, token } = response.data;
          
          set({ 
            isAuthenticated: true,
            user,
            token,
            loginError: null
          });
          
          // Set the Authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return response.data.message;
        } catch (error: any) {
          console.error("Registration error:", error);
          throw new Error(error.response?.data?.message || "Registration failed");
        }
      },
      
      logout: () => {
        // Remove the Authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        set({ 
          isAuthenticated: false,
          user: null,
          token: null,
          loginError: null
        });
      },
      
      clearLoginError: () => {
        set({ loginError: null });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Set the Authorization header when the application loads
if (typeof window !== 'undefined') {
  const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  if (authState?.state?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authState.state.token}`;
  }
}
