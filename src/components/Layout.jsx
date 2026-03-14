import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { base44, isBase44Configured } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  Home, MapPin, Trophy, Users, ShoppingBag, MessageCircle,
  Newspaper, User, Bell, Menu, Search, LogOut, Dumbbell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const navItems = [
  { path: '/Dashboard', label: 'Dashboard', icon: Home },
  { path: '/Discover', label: 'Discover', icon: MapPin },
  { path: '/Grounds', label: 'Grounds', icon: Dumbbell },
  { path: '/Tournaments', label: 'Tournaments', icon: Trophy },
  { path: '/Players', label: 'Players', icon: Users },
  { path: '/Equipment', label: 'Equipment', icon: ShoppingBag },
  { path: '/Feed', label: 'Feed', icon: Newspaper },
  { path: '/Messages', label: 'Messages', icon: MessageCircle },
];

const bottomNavItems = [
  { path: '/Dashboard', label: 'Home', icon: Home },
  { path: '/Discover', label: 'Explore', icon: MapPin },
  { path: '/Equipment', label: 'Shop', icon: ShoppingBag },
  { path: '/Messages', label: 'Messages', icon: MessageCircle },
  { path: '/Profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Location detected');
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(authUser || null);

  useEffect(() => {
    if (authUser) setUser(authUser);
    else base44.auth.me().then(setUser).catch(() => {});
  }, [authUser]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationLabel('Location detected'),
        () => setLocationLabel('Location detected')
      );
    }
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-unread', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email, read: false }),
    enabled: !!user?.email && isBase44Configured,
    refetchInterval: 60000,
    staleTime: 60000,
  });
  const unreadCount = notifications.length;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header: logo, location, search, profile */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/Dashboard" className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden xs:block min-w-0">
                <span className="text-lg font-bold text-foreground block truncate">SportConnect</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" /> {locationLabel}
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0"
                onClick={() => setSearchOpen(!searchOpen)}
                asChild={false}
              >
                <Search className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Link to="/Notifications" className="relative p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || '—'}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/Profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout(true)} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold">SportConnect</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-6">
                      <MapPin className="w-3 h-3" /> {locationLabel}
                    </p>
                    <nav className="space-y-1">
                      {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              location.pathname === item.path
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          {searchOpen && (
            <div className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search grounds, events, equipment..."
                  className="pl-10 rounded-full bg-muted/50"
                  onBlur={() => setSearchOpen(false)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="min-h-[60vh] overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card border-t shadow-lg safe-area-pb">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
