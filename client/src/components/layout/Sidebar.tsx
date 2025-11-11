import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import {
  Activity,
  BarChart3,
  Beef,
  Bell,
  Bird,
  DollarSign,
  FileText,
  Fish,
  Home,
  Leaf,
  LogOut,
  Menu,
  Package,
  Package2,
  User,
  Wifi,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Real-Time', href: '/real-time', icon: Activity },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'IoT Sensors', href: '/iot-sensors', icon: Wifi },
  { name: 'Poultry', href: '/poultry', icon: Bird },
  { name: 'Livestock', href: '/livestock', icon: Beef },
  { name: 'Fishery', href: '/fishery', icon: Fish },
  { name: 'Assets', href: '/assets', icon: Package2 },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    return initials.toUpperCase() || 'U';
  };

  const getFullName = (firstName?: string, lastName?: string) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Logo & Brand Section */}
      <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
        <Link to="/" className="flex items-center space-x-4" onClick={() => setIsOpen(false)}>
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Kuyash
            </span>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Farm Management
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-12 px-4 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 shadow-sm border border-green-200 dark:border-green-800'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-sm'
                }`}
              >
                <Icon
                  className={`h-5 w-5 mr-4 transition-colors duration-300 ${
                    isActive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                <span className="font-medium text-sm">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <Avatar className="h-12 w-12 ring-2 ring-green-200 dark:ring-green-800">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
              {user ? getUserInitials(user.firstName, user.lastName) : <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user ? getFullName(user.firstName, user.lastName) : 'User'}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Farm Manager</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start mt-3 h-11 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-[280px] md:max-w-[280px] md:min-w-[280px] md:flex-col sidebar-fixed">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
