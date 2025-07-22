import * as React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/contexts/ResponsiveContext";
import { Breakpoint } from "@/hooks/use-breakpoint";

type SpacingConfig = {
  [key in Breakpoint]?: string;
};

interface ResponsiveSpacingProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  margin?: SpacingConfig;
  padding?: SpacingConfig;
  mobilePadding?: string;
  tabletPadding?: string;
  desktopPadding?: string;
  mobileMargin?: string;
  tabletMargin?: string;
  desktopMargin?: string;
}

/**
 * A component that applies responsive spacing (margin and padding) based on the current breakpoint
 */
export function ResponsiveSpacing({
  children,
  className,
  margin,
  padding,
  mobilePadding = "p-2",
  tabletPadding = "p-4",
  desktopPadding = "p-6",
  mobileMargin = "m-2",
  tabletMargin = "m-4",
  desktopMargin = "m-6",
  ...props
}: ResponsiveSpacingProps) {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive();

  // Determine margin based on breakpoint
  const responsiveMargin = React.useMemo(() => {
    // If specific margins are provided, use those
    if (margin && breakpoint && margin[breakpoint as Breakpoint]) {
      return margin[breakpoint as Breakpoint];
    }

    // Otherwise use the device type margins
    if (isMobile) return mobileMargin;
    if (isTablet) return tabletMargin;
    if (isDesktop) return desktopMargin;

    // Default to no margin if no conditions match
    return "";
  }, [breakpoint, margin, isMobile, isTablet, isDesktop, mobileMargin, tabletMargin, desktopMargin]);

  // Determine padding based on breakpoint
  const responsivePadding = React.useMemo(() => {
    // If specific paddings are provided, use those
    if (padding && breakpoint && padding[breakpoint as Breakpoint]) {
      return padding[breakpoint as Breakpoint];
    }

    // Otherwise use the device type paddings
    if (isMobile) return mobilePadding;
    if (isTablet) return tabletPadding;
    if (isDesktop) return desktopPadding;

    // Default to no padding if no conditions match
    return "";
  }, [breakpoint, padding, isMobile, isTablet, isDesktop, mobilePadding, tabletPadding, desktopPadding]);

  return (
    <div className={cn(responsiveMargin, responsivePadding, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * A component that applies responsive padding based on the current breakpoint
 */
export function ResponsivePadding({
  children,
  className,
  padding = {
    xs: "p-2",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
    xxl: "p-10",
  },
  ...props
}: ResponsiveSpacingProps) {
  return (
    <ResponsiveSpacing
      padding={padding}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveSpacing>
  );
}

/**
 * A component that applies responsive margin based on the current breakpoint
 */
export function ResponsiveMargin({
  children,
  className,
  margin = {
    xs: "m-2",
    sm: "m-3",
    md: "m-4",
    lg: "m-6",
    xl: "m-8",
    xxl: "m-10",
  },
  ...props
}: ResponsiveSpacingProps) {
  return (
    <ResponsiveSpacing
      margin={margin}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveSpacing>
  );
}