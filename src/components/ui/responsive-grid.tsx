import * as React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/contexts/ResponsiveContext";
import { Breakpoint } from "@/hooks/use-breakpoint";

type ColumnsConfig = {
  [key in Breakpoint]?: number;
};

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: ColumnsConfig;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
}

/**
 * A grid component that adapts the number of columns based on the current breakpoint
 */
export function ResponsiveGrid({
  children,
  className,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 },
  gap = "gap-4",
  rowGap,
  columnGap,
  ...props
}: ResponsiveGridProps) {
  const { breakpoint } = useResponsive();

  // Determine the number of columns based on the current breakpoint
  const gridColumns = React.useMemo(() => {
    if (!breakpoint || !columns[breakpoint]) {
      // Default to 1 column if breakpoint is undefined or no column config for this breakpoint
      return "grid-cols-1";
    }

    return `grid-cols-${columns[breakpoint]}`;
  }, [breakpoint, columns]);

  // Combine gap classes
  const gapClasses = cn(
    gap,
    rowGap,
    columnGap
  );

  return (
    <div
      className={cn(
        "grid",
        gridColumns,
        gapClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}