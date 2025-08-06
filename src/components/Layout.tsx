
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log('Layout - profile:', profile, 'isLoading:', isLoading);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      console.log('Starting logout process...');
      await logout();
      toast.success('Logged out successfully');
      console.log('Logout completed, navigating to login...');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 transition-all duration-300 md:pl-20">
          {/* Mobile Logo */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-lg">Zourse.ai</span>
          </div>

          {/* Desktop Logo */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-lg">Zourse.ai</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {profile ? (
              <div className="hidden sm:flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{profile.name}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {profile.role.toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="transition-all duration-300 px-4 py-6 pb-20 md:pb-6 md:pl-20">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Layout;
