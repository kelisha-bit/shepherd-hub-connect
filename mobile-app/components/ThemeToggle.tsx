import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type ThemeToggleProps = {
  showLabel?: boolean;
};

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { isDark, setTheme, getStoredTheme } = useTheme();
  const [storedTheme, setStoredTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Load the stored theme preference when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      const theme = await getStoredTheme();
      if (theme) {
        setStoredTheme(theme);
      }
    };
    
    loadTheme();
  }, [getStoredTheme]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    setStoredTheme(newTheme);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={toggleTheme}
        style={styles.button}
      >
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={24} 
          color={isDark ? '#fff' : '#151718'} 
        />
        {showLabel && (
          <ThemedText style={styles.label}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
  },
});