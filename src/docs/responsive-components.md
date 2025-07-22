# Responsive Components Documentation

This document provides an overview of the responsive components and hooks available in the Shepherd Hub Connect application.

## Table of Contents

1. [Responsive Context](#responsive-context)
2. [Responsive Hooks](#responsive-hooks)
3. [Responsive Container Components](#responsive-container-components)
4. [Responsive Visibility Components](#responsive-visibility-components)
5. [Responsive Typography Components](#responsive-typography-components)
6. [Responsive Spacing Components](#responsive-spacing-components)
7. [Migration Guide](#migration-guide)

## Responsive Context

The `ResponsiveProvider` is a context provider that makes responsive state globally available to all components in the application.

```tsx
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";

function App() {
  return (
    <ResponsiveProvider>
      {/* Your app components */}
    </ResponsiveProvider>
  );
}
```

You can access the responsive state using the `useResponsive` hook:

```tsx
import { useResponsive } from "@/contexts/ResponsiveContext";

function MyComponent() {
  const { 
    breakpoint,  // Current breakpoint (xs, sm, md, lg, xl, xxl)
    isMobile,    // true if xs or sm
    isTablet,    // true if md
    isDesktop,   // true if lg
    isLargeDesktop, // true if xl
    isExtraLargeDesktop, // true if xxl
    width,       // Current window width
    height       // Current window height
  } = useResponsive();

  return (
    <div>
      <p>Current breakpoint: {breakpoint}</p>
      {isMobile && <p>Mobile view</p>}
      {isTablet && <p>Tablet view</p>}
      {isDesktop && <p>Desktop view</p>}
    </div>
  );
}
```

## Responsive Hooks

The application provides several hooks for responsive design:

### useBreakpoint

Returns the current breakpoint based on window width.

```tsx
import { useBreakpoint } from "@/hooks/use-breakpoint";

function MyComponent() {
  const breakpoint = useBreakpoint(); // 'xs', 'sm', 'md', 'lg', 'xl', or 'xxl'
  
  return <div>Current breakpoint: {breakpoint}</div>;
}
```

### useBreakpointValue

Returns a value based on the current breakpoint.

```tsx
import { useBreakpointValue } from "@/hooks/use-breakpoint";

function MyComponent() {
  const fontSize = useBreakpointValue({
    xs: "1rem",
    sm: "1.25rem",
    md: "1.5rem",
    lg: "1.75rem",
    xl: "2rem",
    xxl: "2.25rem"
  });
  
  return <div style={{ fontSize }}>Responsive text</div>;
}
```

### useMinBreakpoint and useMaxBreakpoint

Check if the current breakpoint is at or above/below a specified breakpoint.

```tsx
import { useMinBreakpoint, useMaxBreakpoint } from "@/hooks/use-breakpoint";

function MyComponent() {
  const isAtLeastTablet = useMinBreakpoint("md"); // true if md, lg, xl, or xxl
  const isAtMostTablet = useMaxBreakpoint("md");  // true if xs, sm, or md
  
  return (
    <div>
      {isAtLeastTablet && <p>Shown on tablet and larger</p>}
      {isAtMostTablet && <p>Shown on tablet and smaller</p>}
    </div>
  );
}
```

### useIsMobile

Returns true if the current breakpoint is 'xs' or 'sm'.

```tsx
import { useIsMobile } from "@/hooks/use-breakpoint";

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <p>Mobile view</p>
      ) : (
        <p>Desktop view</p>
      )}
    </div>
  );
}
```

## Responsive Container Components

### ResponsiveContainer

A container component that applies different classes based on the current breakpoint.

```tsx
import { ResponsiveContainer } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <ResponsiveContainer
      className="base-class"
      mobileClasses="p-2 text-sm"
      tabletClasses="p-4 text-base"
      desktopClasses="p-6 text-lg"
    >
      Content adapts to screen size
    </ResponsiveContainer>
  );
}
```

### ResponsiveGrid

A grid component that adapts the number of columns based on the current breakpoint.

```tsx
import { ResponsiveGrid } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <ResponsiveGrid
      columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
      gap="gap-4"
    >
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      {/* More items */}
    </ResponsiveGrid>
  );
}
```

## Responsive Visibility Components

### ResponsiveVisibility

A component that conditionally renders its children based on the current breakpoint.

```tsx
import { ResponsiveVisibility } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <>
      <ResponsiveVisibility showOnMobile hideOnDesktop>
        <p>Only visible on mobile</p>
      </ResponsiveVisibility>
      
      <ResponsiveVisibility hideOnMobile showOnDesktop>
        <p>Only visible on desktop</p>
      </ResponsiveVisibility>
      
      <ResponsiveVisibility showOnBreakpoints={["md", "lg"]}>
        <p>Only visible on medium and large screens</p>
      </ResponsiveVisibility>
    </>
  );
}
```

### Convenience Components

The library also provides convenience components for common visibility patterns:

```tsx
import { 
  MobileOnly, 
  TabletOnly, 
  DesktopOnly, 
  HideOnMobile, 
  HideOnDesktop 
} from "@/components/ui/responsive";

function MyComponent() {
  return (
    <>
      <MobileOnly>
        <p>Only visible on mobile</p>
      </MobileOnly>
      
      <TabletOnly>
        <p>Only visible on tablet</p>
      </TabletOnly>
      
      <DesktopOnly>
        <p>Only visible on desktop</p>
      </DesktopOnly>
      
      <HideOnMobile>
        <p>Hidden on mobile, visible elsewhere</p>
      </HideOnMobile>
      
      <HideOnDesktop>
        <p>Visible on mobile and tablet, hidden on desktop</p>
      </HideOnDesktop>
    </>
  );
}
```

## Responsive Typography Components

### ResponsiveTypography

A typography component that adjusts font size based on the current breakpoint.

```tsx
import { ResponsiveTypography } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <ResponsiveTypography
      as="p"
      fontSize={{
        xs: "text-sm",
        sm: "text-base",
        md: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
        xxl: "text-3xl"
      }}
    >
      This text changes size based on screen width
    </ResponsiveTypography>
  );
}
```

### ResponsiveHeading and ResponsiveParagraph

Convenience components for responsive headings and paragraphs:

```tsx
import { ResponsiveHeading, ResponsiveParagraph } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <>
      <ResponsiveHeading as="h1">
        Responsive Heading
      </ResponsiveHeading>
      
      <ResponsiveParagraph>
        This paragraph text adjusts size based on screen width
      </ResponsiveParagraph>
    </>
  );
}
```

## Responsive Spacing Components

### ResponsiveSpacing

A component that applies responsive spacing (margin and padding) based on the current breakpoint.

```tsx
import { ResponsiveSpacing } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <ResponsiveSpacing
      padding={{
        xs: "p-2",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
        xxl: "p-10"
      }}
      margin={{
        xs: "m-2",
        sm: "m-3",
        md: "m-4",
        lg: "m-6",
        xl: "m-8",
        xxl: "m-10"
      }}
    >
      Content with responsive spacing
    </ResponsiveSpacing>
  );
}
```

### ResponsivePadding and ResponsiveMargin

Convenience components for responsive padding and margin:

```tsx
import { ResponsivePadding, ResponsiveMargin } from "@/components/ui/responsive";

function MyComponent() {
  return (
    <>
      <ResponsivePadding>
        Content with responsive padding
      </ResponsivePadding>
      
      <ResponsiveMargin>
        Content with responsive margin
      </ResponsiveMargin>
    </>
  );
}
```

## Migration Guide

### Migrating from the old useIsMobile hook

The original `useIsMobile` hook has been updated to use the new responsive context, but it maintains backward compatibility. You can continue to use it as before:

```tsx
import { useIsMobile } from "@/hooks/use-mobile";

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <p>Mobile view</p>
      ) : (
        <p>Desktop view</p>
      )}
    </div>
  );
}
```

However, for new components, we recommend using the more flexible responsive hooks and components:

```tsx
import { useResponsive } from "@/contexts/ResponsiveContext";

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div>
      {isMobile && <p>Mobile view</p>}
      {isTablet && <p>Tablet view</p>}
      {isDesktop && <p>Desktop view</p>}
    </div>
  );
}
```

### Replacing conditional rendering with ResponsiveVisibility

Instead of using conditional rendering with the `useIsMobile` hook:

```tsx
function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

You can use the `ResponsiveVisibility` component or its convenience wrappers:

```tsx
function MyComponent() {
  return (
    <div>
      <MobileOnly>
        <MobileView />
      </MobileOnly>
      
      <DesktopOnly>
        <DesktopView />
      </DesktopOnly>
    </div>
  );
}
```

### Replacing Tailwind responsive classes

While Tailwind's responsive classes (e.g., `sm:`, `md:`, `lg:`) are still valid and useful, you can now use the responsive components for more complex responsive behavior:

```tsx
// Instead of this
<div className="p-2 sm:p-4 md:p-6 lg:p-8 text-sm sm:text-base md:text-lg">
  Content
</div>

// You can use this
<ResponsiveSpacing
  padding={{ xs: "p-2", sm: "p-4", md: "p-6", lg: "p-8" }}
>
  <ResponsiveTypography
    fontSize={{ xs: "text-sm", sm: "text-base", md: "text-lg" }}
  >
    Content
  </ResponsiveTypography>
</ResponsiveSpacing>
```

This approach is especially useful when you need to apply different styles based on complex breakpoint logic that can't be easily expressed with Tailwind's responsive classes.