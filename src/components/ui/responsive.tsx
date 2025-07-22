/**
 * This file exports all responsive components for easy importing
 */

// Export all responsive hooks
export {
  useBreakpoint,
  useBreakpointValue,
  useMinBreakpoint,
  useMaxBreakpoint,
  useIsMobile,
  breakpoints,
  type Breakpoint,
} from "@/hooks/use-breakpoint";

// Export the responsive context and provider
export {
  ResponsiveProvider,
  useResponsive,
} from "@/contexts/ResponsiveContext";

// Export responsive container components
export { ResponsiveContainer } from "./responsive-container";
export { ResponsiveGrid } from "./responsive-grid";

// Export responsive visibility components
export {
  ResponsiveVisibility,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  HideOnMobile,
  HideOnDesktop,
} from "./responsive-visibility";

// Export responsive typography components
export {
  ResponsiveTypography,
  ResponsiveHeading,
  ResponsiveParagraph,
} from "./responsive-typography";

// Export responsive spacing components
export {
  ResponsiveSpacing,
  ResponsivePadding,
  ResponsiveMargin,
} from "./responsive-spacing";