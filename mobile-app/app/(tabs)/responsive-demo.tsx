import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ResponsiveExample } from '../../components/examples/ResponsiveExample';

export default function ResponsiveDemoScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Responsive Demo' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ResponsiveExample />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});