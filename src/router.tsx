import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import SmallGroupsPage from "@/pages/SmallGroupsPage";
import SmallGroupDetailsPage from "@/pages/SmallGroupDetailsPage";
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
        element: <SmallGroupDetailsPage />
      },
      // Add other routes here
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
