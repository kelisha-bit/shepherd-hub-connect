import * as React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/contexts/ResponsiveContext";
import { Breakpoint } from "@/hooks/use-breakpoint";

type FontSizeConfig = {
  [key in Breakpoint]?: string;
};

interface ResponsiveTypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  fontSize?: FontSizeConfig;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  largeDesktopSize?: string;
  extraLargeDesktopSize?: string;
}

/**
 * A typography component that adjusts font size based on the current breakpoint
 */
export function ResponsiveTypography({
  children,
  className,
  as: Component = "p",
  fontSize,
  mobileSize = "text-sm",
  tabletSize = "text-base",
  desktopSize = "text-base",
  largeDesktopSize = "text-lg",
  extraLargeDesktopSize = "text-lg",
  ...props
}: ResponsiveTypographyProps) {
  const { breakpoint, isMobile, isTablet, isDesktop, isLargeDesktop, isExtraLargeDesktop } = useResponsive();

  // Determine font size based on breakpoint
  const responsiveFontSize = React.useMemo(() => {
    // If specific font sizes are provided, use those
    if (fontSize && breakpoint && fontSize[breakpoint as Breakpoint]) {
      return fontSize[breakpoint as Breakpoint];
    }

    // Otherwise use the device type font sizes
    if (isMobile) return mobileSize;
    if (isTablet) return tabletSize;
    if (isDesktop) return desktopSize;
    if (isLargeDesktop) return largeDesktopSize;
    if (isExtraLargeDesktop) return extraLargeDesktopSize;

    // Default to base size if no conditions match
    return "text-base";
  }, [
    breakpoint,
    fontSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLargeDesktop,
    mobileSize,
    tabletSize,
    desktopSize,
    largeDesktopSize,
    extraLargeDesktopSize,
  ]);

  return (
    <Component className={cn(responsiveFontSize, className)} {...props}>
      {children}
    </Component>
  );
}

/**
 * A responsive heading component that adjusts font size based on the current breakpoint
 */
export function ResponsiveHeading({
  children,
  className,
  as = "h2",
  fontSize = {
    xs: "text-xl font-bold",
    sm: "text-2xl font-bold",
    md: "text-3xl font-bold",
    lg: "text-4xl font-bold",
    xl: "text-5xl font-bold",
    xxl: "text-5xl font-bold",
  },
  ...props
}: ResponsiveTypographyProps) {
  return (
    <ResponsiveTypography
      as={as}
      fontSize={fontSize}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveTypography>
  );
}

/**
 * A responsive paragraph component that adjusts font size based on the current breakpoint
 */
export function ResponsiveParagraph({
  children,
  className,
  fontSize = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-base",
    lg: "text-base",
    xl: "text-lg",
    xxl: "text-lg",
  },
  ...props
}: ResponsiveTypographyProps) {
  return (
    <ResponsiveTypography
      as="p"
      fontSize={fontSize}
      className={className}
      {...props}
    >
      {children}
    </ResponsiveTypography>
  );
}