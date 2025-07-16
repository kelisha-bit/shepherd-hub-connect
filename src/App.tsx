import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { MembersList } from "./components/members/MembersList";
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
                    <div className="p-6 text-center text-muted-foreground">Visitors module coming soon...</div>
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donations" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6 text-center text-muted-foreground">Donations module coming soon...</div>
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6 text-center text-muted-foreground">Attendance module coming soon...</div>
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6 text-center text-muted-foreground">Events module coming soon...</div>
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communications" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6 text-center text-muted-foreground">Communications module coming soon...</div>
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6 text-center text-muted-foreground">Reports module coming soon...</div>
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-6 text-center text-muted-foreground">Settings module coming soon...</div>
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
