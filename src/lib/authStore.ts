
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
  } | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (email: string) => {
        // In a real app, this would verify credentials against a backend
        set({ 
          isAuthenticated: true,
          user: { email }
        });
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false,
          user: null
        });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
