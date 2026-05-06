import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppLayout } from "@/components/app/AppLayout";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import JoinGroup from "./pages/JoinGroup.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import Expenses from "./pages/app/Expenses.tsx";
import Chores from "./pages/app/Chores.tsx";
import Insights from "./pages/app/Insights.tsx";
import Settle from "./pages/app/Settle.tsx";
import RoommateProfile from "./pages/app/RoommateProfile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/join/:token" element={<JoinGroup />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppLayout><Dashboard /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/expenses"
              element={
                <RequireAuth>
                  <AppLayout><Expenses /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/chores"
              element={
                <RequireAuth>
                  <AppLayout><Chores /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/insights"
              element={
                <RequireAuth>
                  <AppLayout><Insights /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/settle"
              element={
                <RequireAuth>
                  <AppLayout><Settle /></AppLayout>
                </RequireAuth>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
