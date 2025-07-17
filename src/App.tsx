import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { MembersList } from "./components/members/MembersList";
import { VisitorsList } from "./components/visitors/VisitorsList";
import { DonationsList } from "./components/donations/DonationsList";
import { EventsList } from "./components/events/EventsList";
import { AttendanceList } from "./components/attendance/AttendanceList";
import { CommunicationsList } from "./components/communications/CommunicationsList";
import { ReportsList } from "./components/reports/ReportsList";
import { SettingsPage } from "./components/settings/SettingsPage";
import { AuthProvider } from "./components/auth/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/members" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MembersList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visitors" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VisitorsList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donations" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DonationsList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AttendanceList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EventsList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communications" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CommunicationsList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReportsList />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
