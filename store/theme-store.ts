import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      console.log('Theme store initializing...');
      return {
      mode: 'system' as ThemeMode,
      isDarkMode: Appearance.getColorScheme() === 'dark',
      
      setMode: (mode: ThemeMode) => {
        set({ mode });
        
        if (mode === 'system') {
          set({ isDarkMode: Appearance.getColorScheme() === 'dark' });
        } else {
          set({ isDarkMode: mode === 'dark' });
        }
      },
    };
    },
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('Theme store: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('Theme store: Rehydration failed', error);
          } else {
            console.log('Theme store: Rehydration complete');
          }
        };
      },
    }
  )
);

// Listen for system theme changes
try {
  console.log('Theme store: Setting up appearance listener');
  Appearance.addChangeListener(({ colorScheme }) => {
    const { mode } = useThemeStore.getState();
    if (mode === 'system') {
      useThemeStore.setState({ isDarkMode: colorScheme === 'dark' });
    }
  });
  console.log('Theme store: Appearance listener set up successfully');
} catch (error) {
  console.error('Theme store: Failed to set up appearance listener:', error);
}