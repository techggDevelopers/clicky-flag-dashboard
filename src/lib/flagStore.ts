import { create } from 'zustand';
import { toast } from 'sonner';
import axios from 'axios';

// Use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Debug logging
console.log('FlagStore Environment Variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  Final_API_URL: API_URL
});

export interface Flag {
  _id: string;
  name: string;
  enabled: boolean;
  label: string;
  description: string;
}

export interface FlagState {
  [key: string]: boolean;
}

interface FlagStore {
  flags: FlagState;
  flagDetails: Flag[];
  isLoading: boolean;
  toggleFlag: (flagName: string) => Promise<void>;
  initFlags: () => Promise<void>;
}

export const useFlagStore = create<FlagStore>((set, get) => ({
  flags: {},
  flagDetails: [],
  isLoading: false,

  initFlags: async () => {
    set({ isLoading: true });
    try {
      // First try to get existing flags
      let flagsData = (await axios.get(`${API_URL}/flags`, {
        withCredentials: true
      })).data;

      if (flagsData.length === 0) {
        // If no flags exist, initialize them
        await axios.post(`${API_URL}/flags/initialize`, {}, {
          withCredentials: true
        });
        flagsData = (await axios.get(`${API_URL}/flags`, {
          withCredentials: true
        })).data;
      }

      // Convert to the format our app uses
      const flagState: FlagState = {};
      flagsData.forEach((flag: Flag) => {
        flagState[flag.name] = flag.enabled;
      });

      set({
        flags: flagState,
        flagDetails: flagsData,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to initialize flags:', error);
      toast.error('Failed to load flags');
      set({ isLoading: false });
    }
  },

  toggleFlag: async (flagName: string) => {
    const currentValue = get().flags[flagName];
    const newValue = !currentValue;

    // Optimistically update UI
    set(state => {
      // If enabling a flag, disable all other flags
      const updatedFlags = { ...state.flags };
      if (newValue) {
        Object.keys(updatedFlags).forEach(key => {
          updatedFlags[key] = key === flagName;
        });
      } else {
        updatedFlags[flagName] = false;
      }

      return {
        flags: updatedFlags
      };
    });

    try {
      // Send the update to the backend using the correct endpoint
      await axios.patch(`${API_URL}/flags/${flagName}/toggle`, {}, {
        withCredentials: true
      });

      toast.success(`Flag ${flagName} ${newValue ? 'enabled' : 'disabled'}`);

      // Update the flagDetails array too
      set(state => ({
        flagDetails: state.flagDetails.map(flag =>
          flag.name === flagName
            ? { ...flag, enabled: newValue }
            : { ...flag, enabled: false }
        )
      }));
    } catch (error) {
      console.error('Error updating flag:', error);
      // Revert on error
      set(state => ({
        flags: {
          ...state.flags,
          [flagName]: currentValue
        }
      }));
      toast.error('Failed to update flag');
    }
  }
}));
