import React from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function ThemeDemoScreen() {
  const { isDark } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.title}>Theme System</ThemedText>
        <ThemedText style={styles.description}>
          Customize the appearance of the application with light and dark mode support.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>Current Theme</ThemedText>
        <ThemedText style={styles.cardDescription}>Switch between light and dark mode</ThemedText>
        
        <View style={styles.themeToggleContainer}>
          <View style={styles.themeInfo}>
            <Ionicons 
              name={isDark ? 'moon' : 'sunny'} 
              size={24} 
              color={isDark ? '#fff' : '#000'} 
            />
            <ThemedText style={styles.themeLabel}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </ThemedText>
          </View>
          <ThemeToggle showLabel={true} />
        </View>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>UI Components</ThemedText>
        <ThemedText style={styles.cardDescription}>Preview of UI components in current theme</ThemedText>
        
        <View style={styles.componentsContainer}>
          {/* Text Variants */}
          <ThemedView style={styles.componentSection}>
            <ThemedText type="subtitle" style={styles.componentTitle}>Text Variants</ThemedText>
            <ThemedText type="title">Title Text</ThemedText>
            <ThemedText type="subtitle">Subtitle Text</ThemedText>
            <ThemedText>Default Text</ThemedText>
            <ThemedText type="link">Link Text</ThemedText>
          </ThemedView>

          {/* Buttons */}
          <ThemedView style={styles.componentSection}>
            <ThemedText type="subtitle" style={styles.componentTitle}>Buttons</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                <ThemedText style={styles.buttonText}>Primary</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                <ThemedText style={styles.buttonText}>Secondary</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Form Elements */}
          <ThemedView style={styles.componentSection}>
            <ThemedText type="subtitle" style={styles.componentTitle}>Form Elements</ThemedText>
            <View style={styles.formRow}>
              <ThemedText>Toggle Switch</ThemedText>
              <Switch 
                value={isDark}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isDark ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </ThemedView>

          {/* Cards */}
          <ThemedView style={styles.componentSection}>
            <ThemedText type="subtitle" style={styles.componentTitle}>Cards</ThemedText>
            <ThemedView style={styles.nestedCard}>
              <ThemedText type="subtitle">Card Title</ThemedText>
              <ThemedText>This is a card component that adapts to the current theme.</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.nestedCard, styles.accentCard]}>
              <ThemedText type="subtitle" style={styles.accentText}>Accent Card</ThemedText>
              <ThemedText style={styles.accentText}>A card with accent styling.</ThemedText>
            </ThemedView>
          </ThemedView>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  componentsContainer: {
    marginTop: 8,
  },
  componentSection: {
    marginBottom: 24,
  },
  componentTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  nestedCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  accentCard: {
    backgroundColor: '#007AFF',
  },
  accentText: {
    color: 'white',
  },
});