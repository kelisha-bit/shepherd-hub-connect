import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import SmallGroupsPage from "@/pages/SmallGroupsPage";
import CommunicationCenter from "@/pages/CommunicationCenter";
import MemberGrowthReportPage from "@/pages/MemberGrowthReportPage";
import FinancialSummaryReportPage from "@/pages/FinancialSummaryReportPage";
import EventAnalyticsReportPage from "@/pages/EventAnalyticsReportPage";
// Import other pages here

const router = createBrowserRouter([
  {
    path: "/",
    // Your root layout component here
    children: [
      {
        index: true,
        element: <SmallGroupsPage />
      },
      {
        path: "small-groups",
        element: <SmallGroupsPage />
      },
      {
        path: "groups/:groupId",
        element: <SmallGroupsPage />
      },
      {
        path: "communication",
        element: <CommunicationCenter />
      },
      {
        path: "communications",
        element: <CommunicationCenter />
      },
      {
        path: "reports/member-growth",
        element: <MemberGrowthReportPage />
      },
      {
        path: "reports/financial-summary",
        element: <FinancialSummaryReportPage />
      },
      {
        path: "reports/event-analytics",
        element: <EventAnalyticsReportPage />
      },
      // Add other routes here
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
