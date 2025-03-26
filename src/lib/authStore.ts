
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      
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
            token
          });
          
          // Set the Authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
          console.error("Login error:", error);
          throw new Error(error.response?.data?.message || "Invalid credentials");
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password
          });
          
          const { user, token } = response.data;
          
          set({ 
            isAuthenticated: true,
            user,
            token
          });
          
          // Set the Authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
          token: null
        });
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
