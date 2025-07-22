import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveTypography,
  ResponsiveHeading,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
} from '../ui/ResponsiveComponents';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * Example component demonstrating the responsive components
 */
export function ResponsiveExample() {
  const { 
    breakpoint, 
    width, 
    height, 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLargeDesktop, 
    isExtraLargeDesktop 
  } = useResponsive();

  return (
    <ScrollView>
      <ResponsiveContainer>
        <ResponsiveHeading>Responsive Components Demo</ResponsiveHeading>
        
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Current Responsive State:</ThemedText>
          <ThemedText>Current Breakpoint: {breakpoint}</ThemedText>
          <ThemedText>Screen Width: {width}px</ThemedText>
          <ThemedText>Screen Height: {height}px</ThemedText>
          <ThemedText>Is Mobile: {isMobile ? 'Yes' : 'No'}</ThemedText>
          <ThemedText>Is Tablet: {isTablet ? 'Yes' : 'No'}</ThemedText>
          <ThemedText>Is Desktop: {isDesktop ? 'Yes' : 'No'}</ThemedText>
          <ThemedText>Is Large Desktop: {isLargeDesktop ? 'Yes' : 'No'}</ThemedText>
          <ThemedText>Is Extra Large Desktop: {isExtraLargeDesktop ? 'Yes' : 'No'}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Responsive Typography</ThemedText>
          <ResponsiveTypography>
            This text will adjust its size based on the current breakpoint.
          </ResponsiveTypography>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Responsive Grid</ThemedText>
          <ResponsiveGrid>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ThemedView key={item} style={styles.gridItem}>
                <ThemedText>Item {item}</ThemedText>
              </ThemedView>
            ))}
          </ResponsiveGrid>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Breakpoint-Specific Content</ThemedText>
          
          <MobileOnly>
            <ThemedView style={styles.deviceSpecific}>
              <ThemedText>This content is only visible on mobile devices</ThemedText>
            </ThemedView>
          </MobileOnly>
          
          <TabletOnly>
            <ThemedView style={styles.deviceSpecific}>
              <ThemedText>This content is only visible on tablet devices</ThemedText>
            </ThemedView>
          </TabletOnly>
          
          <DesktopOnly>
            <ThemedView style={styles.deviceSpecific}>
              <ThemedText>This content is only visible on desktop devices</ThemedText>
            </ThemedView>
          </DesktopOnly>
        </ThemedView>
      </ResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  deviceSpecific: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});