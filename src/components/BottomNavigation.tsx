
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Ticket, BarChart3, User, Menu, X } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('BottomNavigation - profile role:', profile?.role);

  const userNavItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Ticket, label: 'Tickets', path: '/user/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const adminNavItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Ticket, label: 'Tickets', path: '/admin/tickets' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Use profile.role instead of user?.role for proper role checking
  const navItems = profile?.role === 'admin' ? adminNavItems : userNavItems;

  console.log('Navigation items:', navItems, 'User role:', profile?.role);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/admin/tickets' && location.pathname.startsWith('/admin/tickets')) ||
              (item.path === '/user/dashboard' && location.pathname.startsWith('/user/'));
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Left Sidebar - Fixed positioning */}
      <div className={`hidden md:flex fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      }`}>
        <div className="flex flex-col h-full w-full bg-background border-r border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border h-14">
            <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}>
              {isExpanded && (
                <>
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">Z</span>
                  </div>
                  <span className="font-semibold text-lg">Zourse.ai</span>
                </>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            >
              {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Role Badge */}
          {isExpanded && profile && (
            <div className="px-4 py-2">
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full text-center">
                {profile.role.toUpperCase()} PANEL
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/admin/tickets' && location.pathname.startsWith('/admin/tickets')) ||
                (item.path === '/user/dashboard' && location.pathname.startsWith('/user/'));
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Info at Bottom */}
          {isExpanded && profile && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
