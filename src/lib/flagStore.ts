
import { create } from 'zustand';
import { toast } from 'sonner';
import axios from 'axios';

// Use environment variable or default to the Vercel deployed backend
const API_URL = import.meta.env.VITE_API_URL || 'https://techgg-clicky-flag-dashboard.onrender.com';

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
      const response = await axios.get(`${API_URL}/flags`);
      const flagsData = response.data;
      
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
      
      // Fallback to initial data if the API call fails
      const initialFlags = {
        'F1': false,
        'F2': false,
        'F3': false,
        'F4': false,
      };
      set({ flags: { ...initialFlags } });
    }
  },
  
  toggleFlag: async (flagName: string) => {
    const currentValue = get().flags[flagName];
    const newValue = !currentValue;
    
    // Optimistically update UI
    set(state => ({
      flags: {
        ...state.flags,
        [flagName]: newValue
      }
    }));
    
    try {
      // Send the update to the backend
      await axios.patch(`${API_URL}/flags/${flagName}`, {
        enabled: newValue
      });
      
      toast.success(`Flag ${flagName} updated successfully`);
      
      // Update the flagDetails array too
      set(state => ({
        flagDetails: state.flagDetails.map(flag => 
          flag.name === flagName 
            ? { ...flag, enabled: newValue } 
            : flag
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
