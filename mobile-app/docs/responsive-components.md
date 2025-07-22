# Mobile App Responsive Components

This document provides an overview of the responsive components available in the mobile app, which are designed to work in harmony with the web application's responsive system.

## Core Responsive Hooks

### `useResponsive`

The primary hook for accessing responsive information:

```typescript
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const { 
    breakpoint,      // Current breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
    isMobile,        // true if width < 768px
    isTablet,        // true if width >= 768px && width < 1024px
    isDesktop,       // true if width >= 1024px && width < 1280px
    isLargeDesktop,  // true if width >= 1280px && width < 1536px
    isExtraLargeDesktop, // true if width >= 1536px
    width,           // Current screen width
    height           // Current screen height
  } = useResponsive();
  
  // Use these values to conditionally render or style components
}
```

### `useBreakpointValue`

A utility hook to get a value based on the current breakpoint:

```typescript
import { useBreakpointValue } from '@/hooks/useResponsive';

function MyComponent() {
  // The value will update automatically when the breakpoint changes
  const fontSize = useBreakpointValue({
    xs: 14,  // Extra small screens
    sm: 16,  // Small screens
    md: 18,  // Medium screens
    lg: 20,  // Large screens
    xl: 22,  // Extra large screens
  }, 16); // Default value if no matching breakpoint is found
  
  return <Text style={{ fontSize }}>Responsive Text</Text>;
}
```

### `useMinBreakpoint` and `useMaxBreakpoint`

Utility hooks to check if the current breakpoint is at least or at most a specified breakpoint:

```typescript
import { useMinBreakpoint, useMaxBreakpoint } from '@/hooks/useResponsive';

function MyComponent() {
  const isAtLeastMedium = useMinBreakpoint('md'); // true if breakpoint >= 'md'
  const isAtMostLarge = useMaxBreakpoint('lg');   // true if breakpoint <= 'lg'
  
  // Use these values for conditional rendering
}
```

## Responsive Components

### `ResponsiveContainer`

A container component that applies different padding based on the current breakpoint:

```tsx
import { ResponsiveContainer } from '@/components/ui/ResponsiveComponents';

function MyScreen() {
  return (
    <ResponsiveContainer>
      {/* Content will have appropriate padding for the current breakpoint */}
    </ResponsiveContainer>
  );
}
```

### `ResponsiveGrid`

A grid component that adjusts the number of columns based on the current breakpoint:

```tsx
import { ResponsiveGrid } from '@/components/ui/ResponsiveComponents';

function MyGrid() {
  return (
    <ResponsiveGrid>
      {/* Items will be arranged in a grid with an appropriate number of columns */}
      <Item />
      <Item />
      <Item />
      {/* ... */}
    </ResponsiveGrid>
  );
}
```

### `ResponsiveVisibility`

A component that conditionally renders children based on the current breakpoint:

```tsx
import { ResponsiveVisibility } from '@/components/ui/ResponsiveComponents';

function MyComponent() {
  return (
    <>
      {/* Only visible on 'xs' and 'sm' breakpoints */}
      <ResponsiveVisibility breakpoint={['xs', 'sm']}>
        <MobileContent />
      </ResponsiveVisibility>
      
      {/* Only visible on breakpoints >= 'md' */}
      <ResponsiveVisibility breakpoint="md" condition="min">
        <DesktopContent />
      </ResponsiveVisibility>
    </>
  );
}
```

### Convenience Components

For common use cases, we provide convenience components:

```tsx
import { 
  MobileOnly, 
  TabletOnly, 
  DesktopOnly 
} from '@/components/ui/ResponsiveComponents';

function MyComponent() {
  return (
    <>
      <MobileOnly>
        <Text>Only visible on mobile devices</Text>
      </MobileOnly>
      
      <TabletOnly>
        <Text>Only visible on tablet devices</Text>
      </TabletOnly>
      
      <DesktopOnly>
        <Text>Only visible on desktop devices</Text>
      </DesktopOnly>
    </>
  );
}
```

### Typography Components

Components for responsive typography:

```tsx
import { 
  ResponsiveTypography,
  ResponsiveHeading 
} from '@/components/ui/ResponsiveComponents';

function MyComponent() {
  return (
    <>
      <ResponsiveHeading>
        This heading adjusts its size based on the breakpoint
      </ResponsiveHeading>
      
      <ResponsiveTypography>
        This text adjusts its size based on the breakpoint
      </ResponsiveTypography>
    </>
  );
}
```

## Demo Screen

To see all these components in action, navigate to the "Responsive" tab in the app, which demonstrates the responsive components and provides real-time information about the current responsive state.

## Integration with Web App

These mobile responsive components are designed to work in harmony with the web application's responsive system. The breakpoints and behavior are consistent across both platforms, ensuring a unified user experience.