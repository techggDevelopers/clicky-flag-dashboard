
import { create } from 'zustand';
import { toast } from 'sonner';

export interface FlagState {
  [key: string]: boolean;
}

interface FlagStore {
  flags: FlagState;
  isLoading: boolean;
  toggleFlag: (flagName: string) => Promise<void>;
  initFlags: () => Promise<void>;
}

const initialFlags = {
  'F1': false,
  'F2': false,
  'F3': false,
  'F4': false,
};

// Simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate a server response
const mockApiCall = async (flagName: string, value: boolean) => {
  await delay(600); // Simulate network delay
  console.log(`Backend updated: ${flagName} set to ${value}`);
  return { success: true, message: `Flag ${flagName} updated successfully` };
};

export const useFlagStore = create<FlagStore>((set, get) => ({
  flags: { ...initialFlags },
  isLoading: false,
  
  initFlags: async () => {
    set({ isLoading: true });
    try {
      // In a real app, you would fetch initial flag states from your backend
      await delay(800);
      set({ flags: { ...initialFlags }, isLoading: false });
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
    set(state => ({
      flags: {
        ...state.flags,
        [flagName]: newValue
      }
    }));
    
    try {
      // Send the update to the "backend"
      const response = await mockApiCall(flagName, newValue);
      
      if (response.success) {
        toast.success(response.message);
      } else {
        // If the API call fails, revert the state
        set(state => ({
          flags: {
            ...state.flags,
            [flagName]: currentValue
          }
        }));
        toast.error('Failed to update flag');
      }
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
