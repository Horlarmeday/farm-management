import React, { useState, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import { useSwipeGesture, useTapGesture } from '../../hooks/useGestures';
import { useResponsive, useKeyboardVisible, useSafeArea } from '../../hooks/useResponsive';
import { hapticFeedback } from '../../utils/mobileOptimization';
import {
  Home,
  Sprout,
  Beef,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  disabled?: boolean;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
  notificationCount?: number;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  currentPath,
  onNavigate,
  onSearch,
  onNotifications,
  onProfile,
  notificationCount = 0,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const { isKeyboardVisible } = useKeyboardVisible();
  const safeArea = useSafeArea();

  // Bottom tab navigation for mobile
  if (isMobile) {
    return (
      <MobileBottomNavigation
        items={items}
        currentPath={currentPath}
        onNavigate={onNavigate}
        isKeyboardVisible={isKeyboardVisible}
        safeAreaBottom={safeArea.bottom}
        className={className}
      />
    );
  }

  // Sidebar navigation for desktop/tablet
  return (
    <DesktopSideNavigation
      items={items}
      currentPath={currentPath}
      onNavigate={onNavigate}
      onSearch={onSearch}
      onNotifications={onNotifications}
      onProfile={onProfile}
      notificationCount={notificationCount}
      className={className}
    />
  );
};

// Mobile bottom navigation
interface MobileBottomNavigationProps {
  items: NavigationItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  isKeyboardVisible: boolean;
  safeAreaBottom: number;
  className?: string;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  items,
  currentPath,
  onNavigate,
  isKeyboardVisible,
  safeAreaBottom,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);
      
      if (scrollDifference > 10) {
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navSpring = useSpring({
    transform: `translateY(${!isVisible || isKeyboardVisible ? '100%' : '0%'})`,
    config: { tension: 300, friction: 30 }
  });

  const handleItemTap = (item: NavigationItem) => {
    if (item.disabled) return;
    
    hapticFeedback.light();
    onNavigate(item.path);
  };

  return (
    <animated.nav
      style={{
        ...navSpring,
        paddingBottom: `${safeAreaBottom}px`
      }}
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-200
        shadow-lg backdrop-blur-sm
        ${className}
      `}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.slice(0, 5).map((item) => {
          const isActive = currentPath === item.path;
          
          return (
            <MobileNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              onTap={() => handleItemTap(item)}
            />
          );
        })}
      </div>
    </animated.nav>
  );
};

// Mobile navigation item
interface MobileNavItemProps {
  item: NavigationItem;
  isActive: boolean;
  onTap: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({
  item,
  isActive,
  onTap
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const tapBind = useTapGesture(onTap);

  const itemSpring = useSpring({
    scale: isPressed ? 0.9 : 1,
    config: { tension: 400, friction: 25 }
  });

  return (
    <animated.button
      {...tapBind()}
      style={itemSpring}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      disabled={item.disabled}
      className={`
        relative flex flex-col items-center justify-center
        min-w-0 flex-1 py-2 px-1
        touch-manipulation select-none
        transition-colors duration-200
        ${isActive 
          ? 'text-blue-600' 
          : item.disabled 
            ? 'text-gray-400' 
            : 'text-gray-600 active:text-blue-600'
        }
        ${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={`
        relative p-1 rounded-lg transition-all duration-200
        ${isActive ? 'bg-blue-100' : 'hover:bg-gray-100'}
      `}>
        {item.icon}
        {item.badge && item.badge > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}
      </div>
      <span className={`
        text-xs font-medium mt-1 truncate max-w-full
        ${isActive ? 'text-blue-600' : 'text-gray-600'}
      `}>
        {item.label}
      </span>
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
      )}
    </animated.button>
  );
};

// Desktop sidebar navigation
interface DesktopSideNavigationProps {
  items: NavigationItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
  notificationCount?: number;
  className?: string;
}

const DesktopSideNavigation: React.FC<DesktopSideNavigationProps> = ({
  items,
  currentPath,
  onNavigate,
  onSearch,
  onNotifications,
  onProfile,
  notificationCount = 0,
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarSpring = useSpring({
    width: isCollapsed ? '64px' : '240px',
    config: { tension: 300, friction: 30 }
  });

  return (
    <animated.nav
      style={sidebarSpring}
      className={`
        fixed left-0 top-0 h-full z-40
        bg-white border-r border-gray-200
        shadow-sm flex flex-col
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold text-gray-900">Farm Manager</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Search and notifications */}
      {!isCollapsed && (
        <div className="p-4 space-y-2">
          {onSearch && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          )}
          
          <div className="flex space-x-2">
            {onNotifications && (
              <Button
                variant="ghost"
                size="sm"
                className="relative flex-1"
                onClick={onNotifications}
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}
            
            {onProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={onProfile}
              >
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`
                  w-full justify-start relative
                  ${isCollapsed ? 'px-2' : 'px-3'}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !item.disabled && onNavigate(item.path)}
                disabled={item.disabled}
              >
                <div className="flex items-center">
                  {item.icon}
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className={`
                        h-4 w-4 p-0 text-xs flex items-center justify-center
                        ${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
                      `}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </animated.nav>
  );
};

// Swipeable drawer navigation
interface SwipeableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const SwipeableDrawer: React.FC<SwipeableDrawerProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const safeArea = useSafeArea();

  const swipeBind = useSwipeGesture({
    onSwipeLeft: onClose,
    threshold: 50,
    velocity: 0.3
  });

  const drawerSpring = useSpring({
    transform: `translateX(${isOpen ? dragOffset : '-100%'})`,
    config: { tension: 300, friction: 30 }
  });

  const overlaySpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { tension: 300, friction: 30 }
  });

  return (
    <>
      {/* Overlay */}
      <animated.div
        style={{
          ...overlaySpring,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <animated.div
        {...swipeBind()}
        style={{
          ...drawerSpring,
          paddingTop: `${safeArea.top}px`,
          paddingBottom: `${safeArea.bottom}px`
        }}
        className={`
          fixed left-0 top-0 h-full w-80 max-w-[80vw]
          bg-white shadow-xl z-50
          touch-none
          ${className}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </animated.div>
    </>
  );
};

// Default navigation items for farm management
export const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    path: '/dashboard'
  },
  {
    id: 'crops',
    label: 'Crops',
    icon: <Sprout className="h-5 w-5" />,
    path: '/crops'
  },
  {
    id: 'livestock',
    label: 'Livestock',
    icon: <Beef className="h-5 w-5" />,
    path: '/livestock'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings'
  }
];