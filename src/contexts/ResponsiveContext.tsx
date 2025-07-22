import * as React from "react";
import { breakpoints, Breakpoint, useBreakpoint } from "@/hooks/use-breakpoint";

type ResponsiveContextType = {
  breakpoint: Breakpoint | undefined;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isExtraLargeDesktop: boolean;
  width: number | undefined;
  height: number | undefined;
};

const ResponsiveContext = React.createContext<ResponsiveContextType>({
  breakpoint: undefined,
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
  isExtraLargeDesktop: false,
  width: undefined,
  height: undefined,
});

export interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const breakpoint = useBreakpoint();
  const [dimensions, setDimensions] = React.useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    // Function to update dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const value = React.useMemo(
    () => ({
      breakpoint,
      isMobile: breakpoint === "xs" || breakpoint === "sm",
      isTablet: breakpoint === "md",
      isDesktop: breakpoint === "lg",
      isLargeDesktop: breakpoint === "xl",
      isExtraLargeDesktop: breakpoint === "xxl",
      width: dimensions.width,
      height: dimensions.height,
    }),
    [breakpoint, dimensions.width, dimensions.height]
  );

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  const context = React.useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error("useResponsive must be used within a ResponsiveProvider");
  }
  return context;
}