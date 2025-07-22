import * as React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/contexts/ResponsiveContext";
import { Breakpoint } from "@/hooks/use-breakpoint";

type BreakpointClasses = {
  [key in Breakpoint]?: string;
};

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  breakpointClasses?: BreakpointClasses;
  mobileClasses?: string;
  tabletClasses?: string;
  desktopClasses?: string;
  largeDesktopClasses?: string;
  extraLargeDesktopClasses?: string;
}

/**
 * A container component that applies different classes based on the current breakpoint
 */
export function ResponsiveContainer({
  children,
  className,
  breakpointClasses,
  mobileClasses,
  tabletClasses,
  desktopClasses,
  largeDesktopClasses,
  extraLargeDesktopClasses,
  ...props
}: ResponsiveContainerProps) {
  const { breakpoint, isMobile, isTablet, isDesktop, isLargeDesktop, isExtraLargeDesktop } = useResponsive();

  // Determine classes based on breakpoint
  const responsiveClasses = React.useMemo(() => {
    // If specific breakpoint classes are provided, use those
    if (breakpointClasses && breakpoint) {
      return breakpointClasses[breakpoint] || "";
    }

    // Otherwise use the device type classes
    if (isMobile && mobileClasses) return mobileClasses;
    if (isTablet && tabletClasses) return tabletClasses;
    if (isDesktop && desktopClasses) return desktopClasses;
    if (isLargeDesktop && largeDesktopClasses) return largeDesktopClasses;
    if (isExtraLargeDesktop && extraLargeDesktopClasses) return extraLargeDesktopClasses;

    return "";
  }, [breakpoint, breakpointClasses, isMobile, isTablet, isDesktop, isLargeDesktop, isExtraLargeDesktop, 
      mobileClasses, tabletClasses, desktopClasses, largeDesktopClasses, extraLargeDesktopClasses]);

  return (
    <div className={cn(className, responsiveClasses)} {...props}>
      {children}
    </div>
  );
}