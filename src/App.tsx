
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserDashboard from "./pages/UserDashboard";
import TicketDetail from "./pages/TicketDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminTickets from "./pages/AdminTickets";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, profile, isLoading } = useAuth();

  console.log('ProtectedRoute - isLoading:', isLoading, 'user:', !!user, 'profile:', profile?.role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Wait for profile to load before checking admin access
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading profile...</div>
      </div>
    );
  }

  if (adminOnly && profile.role !== 'admin') {
    console.log('Admin required but user role is:', profile.role);
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Auth Routes (redirect if already logged in)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();

  console.log('AuthRoute - isLoading:', isLoading, 'user:', !!user, 'profile role:', profile?.role);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (user && profile) {
    const redirectTo = profile.role === 'admin' ? '/admin/dashboard' : '/home';
    console.log('User authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Auth Routes */}
    <Route path="/login" element={
      <AuthRoute>
        <Login />
      </AuthRoute>
    } />

    {/* User Routes */}
    <Route path="/home" element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    } />
    <Route path="/user/dashboard" element={
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    } />
    <Route path="/user/tickets/:ticketId" element={
      <ProtectedRoute>
        <TicketDetail />
      </ProtectedRoute>
    } />

    {/* Admin Routes */}
    <Route path="/admin/dashboard" element={
      <ProtectedRoute adminOnly>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin/tickets" element={
      <ProtectedRoute adminOnly>
        <AdminTickets />
      </ProtectedRoute>
    } />
    <Route path="/admin/tickets/:ticketId" element={
      <ProtectedRoute adminOnly>
        <TicketDetail />
      </ProtectedRoute>
    } />
    <Route path="/admin/analytics" element={
      <ProtectedRoute adminOnly>
        <AdminAnalytics />
      </ProtectedRoute>
    } />

    {/* Shared Routes */}
    <Route path="/profile" element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } />

    {/* Redirects */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
