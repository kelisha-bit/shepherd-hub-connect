import * as React from "react";

// Define breakpoint sizes in pixels
export const breakpoints = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 576,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 992,    // Large devices (desktops)
  xl: 1200,   // Extra large devices (large desktops)
  xxl: 1400,  // Extra extra large devices
};

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook that returns the current breakpoint based on window width
 */
export function useBreakpoint() {
  // Initialize with undefined to avoid hydration mismatch
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint | undefined>(undefined);

  React.useEffect(() => {
    // Function to determine the current breakpoint
    const determineBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < breakpoints.sm) return 'xs';
      if (width < breakpoints.md) return 'sm';
      if (width < breakpoints.lg) return 'md';
      if (width < breakpoints.xl) return 'lg';
      if (width < breakpoints.xxl) return 'xl';
      return 'xxl';
    };

    // Set initial breakpoint
    setCurrentBreakpoint(determineBreakpoint());

    // Update breakpoint on window resize
    const handleResize = () => {
      setCurrentBreakpoint(determineBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return currentBreakpoint;
}

/**
 * Hook that returns whether the current breakpoint is at or above the specified breakpoint
 */
export function useBreakpointValue<T>(values: Record<Breakpoint, T>): T | undefined {
  const breakpoint = useBreakpoint();
  
  if (!breakpoint) return undefined;
  
  return values[breakpoint];
}

/**
 * Hook that returns whether the current breakpoint is at or above the specified breakpoint
 */
export function useMinBreakpoint(minBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  
  if (!currentBreakpoint) return false;
  
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const minIndex = breakpointOrder.indexOf(minBreakpoint);
  
  return currentIndex >= minIndex;
}

/**
 * Hook that returns whether the current breakpoint is at or below the specified breakpoint
 */
export function useMaxBreakpoint(maxBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  
  if (!currentBreakpoint) return false;
  
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const maxIndex = breakpointOrder.indexOf(maxBreakpoint);
  
  return currentIndex <= maxIndex;
}

/**
 * Enhanced version of the original useIsMobile hook
 * Returns true if the current breakpoint is 'xs' or 'sm'
 */
export function useIsMobile(): boolean {
  const currentBreakpoint = useBreakpoint();
  return currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
}