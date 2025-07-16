import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { MembersList } from "./components/members/MembersList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/visitors" element={<div className="p-6 text-center text-muted-foreground">Visitors module coming soon...</div>} />
            <Route path="/donations" element={<div className="p-6 text-center text-muted-foreground">Donations module coming soon...</div>} />
            <Route path="/attendance" element={<div className="p-6 text-center text-muted-foreground">Attendance module coming soon...</div>} />
            <Route path="/events" element={<div className="p-6 text-center text-muted-foreground">Events module coming soon...</div>} />
            <Route path="/communications" element={<div className="p-6 text-center text-muted-foreground">Communications module coming soon...</div>} />
            <Route path="/reports" element={<div className="p-6 text-center text-muted-foreground">Reports module coming soon...</div>} />
            <Route path="/settings" element={<div className="p-6 text-center text-muted-foreground">Settings module coming soon...</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
