import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Debug environment variables
const envVars = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV
};

console.log('Current Environment:', envVars);

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

console.log('API Configuration:', {
  'Using Environment Variable?': !!import.meta.env.VITE_API_URL,
  'Environment API URL': import.meta.env.VITE_API_URL,
  'Final API URL': API_URL
});

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
      loginError: null,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          }, {
            withCredentials: true // Important for cookies
          });

          const { user } = response.data;

          set({
            isAuthenticated: true,
            user,
            loginError: null
          });
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
          }, {
            withCredentials: true // Important for cookies
          });

          const { user } = response.data;

          set({
            isAuthenticated: true,
            user,
            loginError: null
          });

          return response.data.message;
        } catch (error: any) {
          console.error("Registration error:", error);
          throw new Error(error.response?.data?.message || "Registration failed");
        }
      },

      logout: async () => {
        try {
          await axios.post(`${API_URL}/auth/logout`, {}, {
            withCredentials: true // Important for cookies
          });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            loginError: null
          });
        }
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
