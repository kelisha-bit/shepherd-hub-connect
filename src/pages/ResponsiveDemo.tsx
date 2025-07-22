import React from "react";
import { ResponsiveExample } from "@/components/examples/ResponsiveExample";
import { useResponsive } from "@/contexts/ResponsiveContext";

const ResponsiveDemo = () => {
  const { breakpoint, isMobile, isTablet, isDesktop, isLargeDesktop, isExtraLargeDesktop, width, height } = useResponsive();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Responsive Components Demo</h1>
        <p className="text-gray-600">
          This page demonstrates the new responsive components and hooks available in the application.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Responsive State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Current Breakpoint:</strong> {breakpoint}</p>
            <p><strong>Window Width:</strong> {width}px</p>
            <p><strong>Window Height:</strong> {height}px</p>
          </div>
          <div>
            <p><strong>isMobile:</strong> {isMobile ? "Yes" : "No"}</p>
            <p><strong>isTablet:</strong> {isTablet ? "Yes" : "No"}</p>
            <p><strong>isDesktop:</strong> {isDesktop ? "Yes" : "No"}</p>
            <p><strong>isLargeDesktop:</strong> {isLargeDesktop ? "Yes" : "No"}</p>
            <p><strong>isExtraLargeDesktop:</strong> {isExtraLargeDesktop ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>

      <ResponsiveExample />

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Check out the documentation in <code>src/docs/responsive-components.md</code> for more information on how to use these components.
        </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline mt-2 inline-block">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default ResponsiveDemo;