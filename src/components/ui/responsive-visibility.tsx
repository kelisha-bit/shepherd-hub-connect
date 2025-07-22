import * as React from "react";
import { useResponsive } from "@/contexts/ResponsiveContext";
import { Breakpoint } from "@/hooks/use-breakpoint";

interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  showOnLargeDesktop?: boolean;
  showOnExtraLargeDesktop?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  hideOnLargeDesktop?: boolean;
  hideOnExtraLargeDesktop?: boolean;
  showOnBreakpoints?: Breakpoint[];
  hideOnBreakpoints?: Breakpoint[];
}

/**
 * A component that conditionally renders its children based on the current breakpoint
 */
export function ResponsiveVisibility({
  children,
  showOnMobile = true,
  showOnTablet = true,
  showOnDesktop = true,
  showOnLargeDesktop = true,
  showOnExtraLargeDesktop = true,
  hideOnMobile = false,
  hideOnTablet = false,
  hideOnDesktop = false,
  hideOnLargeDesktop = false,
  hideOnExtraLargeDesktop = false,
  showOnBreakpoints,
  hideOnBreakpoints,
}: ResponsiveVisibilityProps) {
  const { breakpoint, isMobile, isTablet, isDesktop, isLargeDesktop, isExtraLargeDesktop } = useResponsive();

  // Determine visibility based on breakpoint
  const isVisible = React.useMemo(() => {
    // If specific breakpoints are provided, they take precedence
    if (breakpoint && showOnBreakpoints) {
      return showOnBreakpoints.includes(breakpoint as Breakpoint);
    }

    if (breakpoint && hideOnBreakpoints) {
      return !hideOnBreakpoints.includes(breakpoint as Breakpoint);
    }

    // Otherwise use the device type props
    if (isMobile) {
      return showOnMobile && !hideOnMobile;
    }

    if (isTablet) {
      return showOnTablet && !hideOnTablet;
    }

    if (isDesktop) {
      return showOnDesktop && !hideOnDesktop;
    }

    if (isLargeDesktop) {
      return showOnLargeDesktop && !hideOnLargeDesktop;
    }

    if (isExtraLargeDesktop) {
      return showOnExtraLargeDesktop && !hideOnExtraLargeDesktop;
    }

    // Default to visible if no conditions match
    return true;
  }, [
    breakpoint,
    showOnBreakpoints,
    hideOnBreakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLargeDesktop,
    showOnMobile,
    showOnTablet,
    showOnDesktop,
    showOnLargeDesktop,
    showOnExtraLargeDesktop,
    hideOnMobile,
    hideOnTablet,
    hideOnDesktop,
    hideOnLargeDesktop,
    hideOnExtraLargeDesktop,
  ]);

  // Only render children if visible
  return isVisible ? <>{children}</> : null;
}

/**
 * A component that only renders its children on mobile devices
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveVisibility
      showOnMobile
      showOnTablet={false}
      showOnDesktop={false}
      showOnLargeDesktop={false}
      showOnExtraLargeDesktop={false}
    >
      {children}
    </ResponsiveVisibility>
  );
}

/**
 * A component that only renders its children on tablet devices
 */
export function TabletOnly({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveVisibility
      showOnMobile={false}
      showOnTablet
      showOnDesktop={false}
      showOnLargeDesktop={false}
      showOnExtraLargeDesktop={false}
    >
      {children}
    </ResponsiveVisibility>
  );
}

/**
 * A component that only renders its children on desktop devices
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveVisibility
      showOnMobile={false}
      showOnTablet={false}
      showOnDesktop
      showOnLargeDesktop
      showOnExtraLargeDesktop
    >
      {children}
    </ResponsiveVisibility>
  );
}

/**
 * A component that renders its children on all devices except mobile
 */
export function HideOnMobile({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveVisibility
      hideOnMobile
      showOnTablet
      showOnDesktop
      showOnLargeDesktop
      showOnExtraLargeDesktop
    >
      {children}
    </ResponsiveVisibility>
  );
}

/**
 * A component that renders its children on all devices except desktop
 */
export function HideOnDesktop({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveVisibility
      showOnMobile
      showOnTablet
      hideOnDesktop
      hideOnLargeDesktop
      hideOnExtraLargeDesktop
    >
      {children}
    </ResponsiveVisibility>
  );
}