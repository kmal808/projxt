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
    (set, get) => ({
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
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Listen for system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  const { mode, setMode } = useThemeStore.getState();
  if (mode === 'system') {
    useThemeStore.setState({ isDarkMode: colorScheme === 'dark' });
  }
});