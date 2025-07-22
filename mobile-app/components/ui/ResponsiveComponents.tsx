import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useResponsive, Breakpoint, useBreakpointValue } from '../../hooks/useResponsive';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

type ResponsiveProps = {
  children: ReactNode;
  style?: ViewStyle;
};

type ResponsiveTextProps = {
  children: ReactNode;
  style?: TextStyle;
};

type BreakpointVisibilityProps = {
  children: ReactNode;
  breakpoint: Breakpoint | Breakpoint[];
  condition?: 'exact' | 'min' | 'max';
};

/**
 * A container component that applies different styles based on the current breakpoint
 */
export function ResponsiveContainer({ children, style }: ResponsiveProps) {
  const { breakpoint } = useResponsive();
  
  const containerStyle = useBreakpointValue<ViewStyle>({
    xs: { padding: 8 },
    sm: { padding: 12 },
    md: { padding: 16 },
    lg: { padding: 20 },
    xl: { padding: 24 },
  });
  
  return (
    <ThemedView style={[containerStyle, style]}>
      {children}
    </ThemedView>
  );
}

/**
 * A grid component that adjusts columns based on the current breakpoint
 */
export function ResponsiveGrid({ children, style }: ResponsiveProps) {
  const { breakpoint } = useResponsive();
  
  // Determine number of columns based on breakpoint
  const columns = useBreakpointValue<number>({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
  }, 1);
  
  return (
    <ThemedView style={[styles.grid, style]}>
      {React.Children.map(children, (child, index) => (
        <View style={[styles.gridItem, { width: `${100 / columns}%` }]} key={index}>
          {child}
        </View>
      ))}
    </ThemedView>
  );
}

/**
 * A component that conditionally renders children based on the current breakpoint
 */
export function ResponsiveVisibility({ children, breakpoint, condition = 'exact' }: BreakpointVisibilityProps) {
  const { breakpoint: currentBreakpoint } = useResponsive();
  
  const breakpoints = Array.isArray(breakpoint) ? breakpoint : [breakpoint];
  
  const isVisible = (() => {
    if (condition === 'exact') {
      return breakpoints.includes(currentBreakpoint);
    } else if (condition === 'min') {
      const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      const minIndex = Math.min(...breakpoints.map(bp => breakpointOrder.indexOf(bp)));
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      return currentIndex >= minIndex;
    } else if (condition === 'max') {
      const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      const maxIndex = Math.max(...breakpoints.map(bp => breakpointOrder.indexOf(bp)));
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      return currentIndex <= maxIndex;
    }
    return false;
  })();
  
  if (!isVisible) return null;
  
  return <>{children}</>;
}

/**
 * A component for responsive typography that adjusts font size based on breakpoint
 */
export function ResponsiveTypography({ children, style }: ResponsiveTextProps) {
  const fontSize = useBreakpointValue<number>({
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
  }, 16);
  
  return (
    <ThemedText style={[{ fontSize }, style]}>
      {children}
    </ThemedText>
  );
}

/**
 * A component for responsive headings
 */
export function ResponsiveHeading({ children, style }: ResponsiveTextProps) {
  const fontSize = useBreakpointValue<number>({
    xs: 20,
    sm: 24,
    md: 28,
    lg: 32,
    xl: 36,
  }, 24);
  
  return (
    <ThemedText style={[{ fontSize, fontWeight: 'bold' }, style]}>
      {children}
    </ThemedText>
  );
}

/**
 * Convenience components for specific breakpoints
 */
export function MobileOnly({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();
  if (!isMobile) return null;
  return <>{children}</>;
}

export function TabletOnly({ children }: { children: ReactNode }) {
  const { isTablet } = useResponsive();
  if (!isTablet) return null;
  return <>{children}</>;
}

export function DesktopOnly({ children }: { children: ReactNode }) {
  const { isDesktop, isLargeDesktop, isExtraLargeDesktop } = useResponsive();
  if (!(isDesktop || isLargeDesktop || isExtraLargeDesktop)) return null;
  return <>{children}</>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    padding: 8,
  },
});