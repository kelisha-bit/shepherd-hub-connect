import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/hooks/useTheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { getStoredTheme } = useTheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Load the user's theme preference
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await getStoredTheme();
      if (storedTheme) {
        setUserTheme(storedTheme);
      }
    };
    
    loadTheme();
  }, [getStoredTheme]);

  // Determine the actual theme to use
  const effectiveColorScheme = 
    userTheme === 'system' ? colorScheme : userTheme;

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={effectiveColorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
