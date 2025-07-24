import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./components/dashboard/Dashboard";
import { MembersList } from "./components/members/MembersList";
import { VisitorsList } from "./components/visitors/VisitorsList";
import { DonationsList } from "./components/donations/DonationsList";
import { EventsList } from "./components/events/EventsList";
import { AttendanceList } from "./components/attendance/AttendanceList";
import { CommunicationsList } from "./components/communications/CommunicationsList";
import { ReportsList } from "./components/reports/ReportsList";
import { SettingsPage } from "./components/settings/SettingsPage";
import { AuthProvider } from "./components/auth/AuthContext";
import { ResponsiveProvider } from '@/contexts/ResponsiveContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
import ResponsiveDemo from './pages/ResponsiveDemo';
import ThemeDemo from './pages/ThemeDemo';
import FinanceExpensePage from './pages/FinanceExpensePage';
import FinanceGoalsPage from './pages/FinanceGoalsPage';
import FinanceReportsPage from './pages/FinanceReportsPage';
import MemberGrowthReportPage from './pages/MemberGrowthReportPage';
import FinancialSummaryReportPage from './pages/FinancialSummaryReportPage';
import EventAnalyticsReportPage from './pages/EventAnalyticsReportPage';
import { supabase } from "@/integrations/supabase/client";
import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";

import SermonLibraryPage from "./pages/SermonLibraryPage";
import PrayerRequestsPage from "./pages/PrayerRequestsPage";
import SmallGroupsPage from "./pages/SmallGroupsPage";

// TestComponent definition (fixed)
const TestComponent = () => {
  // Test Supabase connection
  const testSupabase = async () => {
    try {
      console.log('TestComponent: Testing Supabase connection...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('TestComponent: Supabase connection error:', error);
      } else {
        console.log('TestComponent: Supabase connection successful, session:', data.session);
      }

      // Test database connection
      console.log('TestComponent: Testing database connection...');
      const { data: dbData, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (dbError) {
        console.error('TestComponent: Database connection error:', dbError);
      } else {
        console.log('TestComponent: Database connection successful, profiles count:', dbData?.length || 0);
      }
    } catch (err) {
      console.error('TestComponent: Exception testing Supabase:', err);
    }
  };

  // Test the connection when component mounts
  React.useEffect(() => {
    testSupabase();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Component</h1>
        <p>If you can see this, the basic routing is working.</p>
        <p className="text-sm text-gray-500 mt-2">Check the browser console for Supabase connection logs.</p>
        <button 
          onClick={testSupabase}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection Again
        </button>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  console.log('App: Rendering App component');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ResponsiveProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
              <Routes>
              {/* Test route to check if routing works */}
                <Route path="/test" element={<TestComponent />} />
                {/* Responsive components demo */}
                <Route path="/responsive-demo" element={<ResponsiveDemo />} />
                {/* Theme demo page */}
                <Route path="/theme-demo" element={<ThemeDemo />} />
                
                {/* Small Groups Page */}
                <Route 
                  path="/small-groups" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SmallGroupsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
              
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
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <MembersList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/visitors" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <VisitorsList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donations" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <DonationsList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/donations/receipt/:id" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <DonationReceipt />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/attendance" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <AttendanceList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <EventsList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/communications" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <CommunicationsList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <ReportsList />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/member-growth" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <MemberGrowthReportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/financial-summary" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FinancialSummaryReportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports/event-analytics" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EventAnalyticsReportPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requiredRole="admin">
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
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <MemberProfile />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/member/*" 
                element={
                  <ProtectedRoute requiredRole="member">
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
                <Route path="sermons" element={<SermonLibraryPage />} />
                <Route path="prayer-requests" element={<PrayerRequestsPage />} />
                <Route path="small-groups" element={<SmallGroupsPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </ThemeProvider>
            </ResponsiveProvider>
          </AuthProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
