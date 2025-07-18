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
import { ProtectedRoute, AdminRoute } from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import MemberProfile from "./pages/MemberProfile";
import DonationReceipt from "./pages/DonationReceipt";
import MemberPortalLayout from "./components/layout/MemberPortalLayout";
import MemberDashboard from "./pages/MemberDashboard";
import MemberProfilePage from "./pages/MemberProfilePage";
import MemberAttendancePage from "./pages/MemberAttendancePage";
import MemberDonationsPage from "./pages/MemberDonationsPage";
import MemberEventsPage from "./pages/MemberEventsPage";
import MemberNotificationsPage from "./pages/MemberNotificationsPage";
import FinanceIncomePage from './pages/FinanceIncomePage';
import FinanceExpensePage from './pages/FinanceExpensePage';
import FinanceGoalsPage from './pages/FinanceGoalsPage';
import FinanceReportsPage from './pages/FinanceReportsPage';

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
              path="/donations/receipt/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DonationReceipt />
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
            <Route 
              path="/finance/income" 
              element={
                <AdminRoute>
                  <AppLayout>
                    <FinanceIncomePage />
                  </AppLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/finance/expenses" 
              element={
                <AdminRoute>
                  <AppLayout>
                    <FinanceExpensePage />
                  </AppLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/finance/goals" 
              element={
                <AdminRoute>
                  <AppLayout>
                    <FinanceGoalsPage />
                  </AppLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/finance/reports" 
              element={
                <AdminRoute>
                  <AppLayout>
                    <FinanceReportsPage />
                  </AppLayout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/members/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MemberProfile />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/member/*" 
              element={
                <ProtectedRoute>
                  <MemberPortalLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<MemberDashboard />} />
              <Route path="profile" element={<MemberProfilePage />} />
              <Route path="attendance" element={<MemberAttendancePage />} />
              <Route path="donations" element={<MemberDonationsPage />} />
              <Route path="events" element={<MemberEventsPage />} />
              <Route path="notifications" element={<MemberNotificationsPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
