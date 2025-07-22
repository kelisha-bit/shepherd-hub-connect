import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

// Define breakpoints to match web application
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const BREAKPOINTS = {
  xs: 0,     // Extra small devices
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices
  xxl: 1536, // Extra extra large devices
};

export type ResponsiveContextType = {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isExtraLargeDesktop: boolean;
  width: number;
  height: number;
};

/**
 * Hook to get responsive information based on current screen dimensions
 */
export function useResponsive(): ResponsiveContextType {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    // Determine current breakpoint
    let breakpoint: Breakpoint = 'xs';
    
    if (width >= BREAKPOINTS.xxl) {
      breakpoint = 'xxl';
    } else if (width >= BREAKPOINTS.xl) {
      breakpoint = 'xl';
    } else if (width >= BREAKPOINTS.lg) {
      breakpoint = 'lg';
    } else if (width >= BREAKPOINTS.md) {
      breakpoint = 'md';
    } else if (width >= BREAKPOINTS.sm) {
      breakpoint = 'sm';
    }

    // Determine device type based on breakpoint
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    const isLargeDesktop = width >= BREAKPOINTS.xl && width < BREAKPOINTS.xxl;
    const isExtraLargeDesktop = width >= BREAKPOINTS.xxl;

    return {
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      isExtraLargeDesktop,
      width,
      height,
    };
  }, [width, height]);
}

/**
 * Hook to get a value based on the current breakpoint
 */
export function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue?: T): T {
  const { breakpoint } = useResponsive();
  
  // Order of breakpoints from smallest to largest
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  // Find the closest defined breakpoint value
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }
  
  return defaultValue as T;
}

/**
 * Hook to check if current breakpoint is at least the specified breakpoint
 */
export function useMinBreakpoint(minBreakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[minBreakpoint];
}

/**
 * Hook to check if current breakpoint is at most the specified breakpoint
 */
export function useMaxBreakpoint(maxBreakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  const nextBreakpoint = getNextBreakpoint(maxBreakpoint);
  return nextBreakpoint ? width < BREAKPOINTS[nextBreakpoint] : true;
}

/**
 * Helper function to get the next breakpoint
 */
function getNextBreakpoint(breakpoint: Breakpoint): Breakpoint | null {
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const index = breakpointOrder.indexOf(breakpoint);
  return index < breakpointOrder.length - 1 ? breakpointOrder[index + 1] : null;
}

/**
 * Legacy hook for backward compatibility
 */
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}