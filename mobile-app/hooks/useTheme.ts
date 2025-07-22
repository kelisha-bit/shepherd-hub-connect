import { useCallback } from 'react';
import { useColorScheme } from './useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'user-theme-preference';

export function useTheme() {
  // Get the current color scheme from the system or user preference
  const colorScheme = useColorScheme();
  
  // Function to set the theme preference
  const setTheme = useCallback(async (theme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  }, []);
  
  // Function to get the stored theme preference
  const getStoredTheme = useCallback(async (): Promise<Theme | null> => {
    try {
      return await AsyncStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    } catch (error) {
      console.error('Failed to get theme preference', error);
      return null;
    }
  }, []);
  
  // Determine if we're in dark mode
  const isDark = colorScheme === 'dark';
  const isLight = colorScheme === 'light';
  
  return {
    colorScheme,
    isDark,
    isLight,
    setTheme,
    getStoredTheme,
  };
}