import * as React from "react";
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveTypography,
  ResponsiveHeading,
  ResponsiveParagraph,
  ResponsiveSpacing,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  useResponsive,
} from "@/components/ui/responsive";

export function ResponsiveExample() {
  const { breakpoint, width, height } = useResponsive();

  return (
    <ResponsiveContainer className="border rounded-lg">
      <ResponsiveSpacing
        padding={{
          xs: "p-4",
          sm: "p-6",
          md: "p-8",
          lg: "p-10",
          xl: "p-12",
          xxl: "p-16",
        }}
      >
        <ResponsiveHeading className="mb-4">
          Responsive Components Demo
        </ResponsiveHeading>

        <ResponsiveParagraph className="mb-6">
          Current breakpoint: <strong>{breakpoint}</strong>
          <br />
          Window dimensions: {width}px × {height}px
        </ResponsiveParagraph>

        <div className="mb-8">
          <ResponsiveHeading as="h3" className="mb-2">
            Responsive Visibility
          </ResponsiveHeading>

          <div className="space-y-2">
            <MobileOnly>
              <div className="bg-red-100 p-4 rounded">
                This content is only visible on mobile devices.
              </div>
            </MobileOnly>

            <TabletOnly>
              <div className="bg-green-100 p-4 rounded">
                This content is only visible on tablet devices.
              </div>
            </TabletOnly>

            <DesktopOnly>
              <div className="bg-blue-100 p-4 rounded">
                This content is only visible on desktop devices.
              </div>
            </DesktopOnly>
          </div>
        </div>

        <div className="mb-8">
          <ResponsiveHeading as="h3" className="mb-2">
            Responsive Grid
          </ResponsiveHeading>

          <ResponsiveGrid
            columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
            gap="gap-4"
            className="mb-4"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 p-4 rounded flex items-center justify-center"
              >
                Item {index + 1}
              </div>
            ))}
          </ResponsiveGrid>

          <ResponsiveParagraph className="text-gray-500">
            The grid above adjusts columns based on screen size.
          </ResponsiveParagraph>
        </div>

        <div>
          <ResponsiveHeading as="h3" className="mb-2">
            Responsive Typography
          </ResponsiveHeading>

          <ResponsiveTypography
            fontSize={{
              xs: "text-xs",
              sm: "text-sm",
              md: "text-base",
              lg: "text-lg",
              xl: "text-xl",
              xxl: "text-2xl",
            }}
            className="mb-2"
          >
            This text changes size based on the screen width.
          </ResponsiveTypography>

          <ResponsiveParagraph className="text-gray-500">
            Try resizing your browser window to see how all these components
            respond to different screen sizes.
          </ResponsiveParagraph>
        </div>
      </ResponsiveSpacing>
    </ResponsiveContainer>
  );
}