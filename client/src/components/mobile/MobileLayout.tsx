import React, { useState, useEffect, Suspense } from 'react';
import { animated, useSpring } from 'react-spring';
import { useResponsive, useKeyboardVisible, useSafeArea } from '../../hooks/useResponsive';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  getDeviceInfo,
  MobilePerformanceOptimizer,
  addTouchFeedback,
  hapticFeedback,
  getOptimizedImageUrl,
  getSafeAreaInsets,
  getNetworkInfo,
  shouldLoadHighQuality,
  debounce,
  throttle
} from '../../utils/mobileOptimization';
import { MobileNavigation, defaultNavigationItems } from './MobileNavigation';
import { OfflineIndicator, CompactOfflineIndicator } from '../OfflineIndicator';
import { PWAInstallBanner, CompactInstallButton } from '../PWAInstallBanner';
import { PullToRefresh } from './PullToRefresh';
import { TouchOptimizedCard } from './TouchOptimizedCard';
import { Loader2, Wifi, WifiOff, Battery, Signal } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onRefresh?: () => Promise<void>;
  showInstallPrompt?: boolean;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onRefresh,
  showInstallPrompt = true,
  className = ''
}) => {
  const { isMobile, isTablet, ...responsive } = useResponsive();
  const isKeyboardVisible = useKeyboardVisible();
  const safeArea = useSafeArea();
  const { isOnline, syncInProgress, pendingChanges } = useOfflineSync();
  const { isInstallable, isStandalone } = usePWAInstall();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(getNetworkInfo());
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);

  // Monitor network and battery status
  useEffect(() => {
    const updateNetworkInfo = () => setNetworkInfo(getNetworkInfo());
    
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryInfo(battery);
        
        const updateBattery = () => {
          setBatteryInfo({ ...battery });
        };
        
        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);
      });
    }
    
    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
    };
  }, []);

  // Performance monitoring
  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    const networkInfo = getNetworkInfo();
    
    // Show warning for low-end devices or slow networks
    if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g' || networkInfo.saveData) {
      setShowPerformanceWarning(true);
    }
  }, []);

  // Setup performance optimizations on mount
  useEffect(() => {
    const optimizer = MobilePerformanceOptimizer.getInstance();
    optimizer.setupLazyLoading();
    
    return () => {
      optimizer.cleanup();
    };
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Layout springs for smooth transitions
  const layoutSpring = useSpring({
    paddingTop: `${safeArea.top}px`,
    paddingBottom: isMobile ? `${safeArea.bottom + 80}px` : `${safeArea.bottom}px`,
    paddingLeft: `${safeArea.left}px`,
    paddingRight: `${safeArea.right}px`,
    config: { tension: 300, friction: 30 }
  });

  const contentSpring = useSpring({
    transform: isKeyboardVisible ? 'translateY(-20px)' : 'translateY(0px)',
    config: { tension: 300, friction: 30 }
  });

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Status indicators */}
      <MobileStatusBar
        isOnline={isOnline}
        networkInfo={networkInfo}
        batteryInfo={batteryInfo}
        syncProgress={syncInProgress ? 50 : 0}
        pendingChanges={pendingChanges}
      />

      {/* Performance warning */}
      {showPerformanceWarning && (
        <PerformanceWarning onDismiss={() => setShowPerformanceWarning(false)} />
      )}

      {/* PWA install prompt */}
      {showInstallPrompt && isInstallable && !isStandalone && (
        <div className="sticky top-0 z-30">
          {isMobile ? (
            <CompactInstallButton className="m-2" />
          ) : (
            <PWAInstallBanner variant="banner" className="mx-2 mt-2" />
          )}
        </div>
      )}

      {/* Main content area */}
      <animated.main style={layoutSpring} className="relative">
        {onRefresh ? (
          <PullToRefresh
              onRefresh={handleRefresh}
              className="min-h-screen"
            >
            <animated.div style={contentSpring}>
              <MobileContent>
                {children}
              </MobileContent>
            </animated.div>
          </PullToRefresh>
        ) : (
          <animated.div style={contentSpring}>
            <MobileContent>
              {children}
            </MobileContent>
          </animated.div>
        )}
      </animated.main>

      {/* Navigation */}
      <MobileNavigation
        items={defaultNavigationItems}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-50">
          <CompactOfflineIndicator />
        </div>
      )}
    </div>
  );
};

// Mobile content wrapper with performance optimizations
interface MobileContentProps {
  children: React.ReactNode;
}

const MobileContent: React.FC<MobileContentProps> = ({ children }) => {
  const { isMobile } = useResponsive();
  const [isScrolling, setIsScrolling] = useState(false);

  // Throttled scroll handler for performance
  useEffect(() => {
    const optimizer = MobilePerformanceOptimizer.getInstance();
    
    const unsubscribe = optimizer.onScroll(() => {
      setIsScrolling(true);
      
      // Debounce scroll end detection
      const debouncedScrollEnd = debounce(() => {
        setIsScrolling(false);
      }, 150);
      
      debouncedScrollEnd();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={`
      transition-all duration-200
      ${isScrolling ? 'pointer-events-none' : 'pointer-events-auto'}
      ${isMobile ? 'px-4 py-2' : 'px-6 py-4'}
    `}>
      <Suspense fallback={<MobileLoadingSpinner />}>
        {children}
      </Suspense>
    </div>
  );
};

// Mobile status bar
interface MobileStatusBarProps {
  isOnline: boolean;
  networkInfo: any;
  batteryInfo: any;
  syncProgress: number;
  pendingChanges: number;
}

const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  isOnline,
  networkInfo,
  batteryInfo,
  syncProgress,
  pendingChanges
}) => {
  const { isMobile } = useResponsive();
  const safeArea = useSafeArea();

  if (!isMobile) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      style={{ paddingTop: `${safeArea.top}px` }}
    >
      <div className="flex items-center justify-between px-4 py-2 text-xs">
        {/* Left side - Network status */}
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-600" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-600" />
          )}
          
          {networkInfo?.effectiveType && (
            <span className="text-gray-600">
              {networkInfo.effectiveType.toUpperCase()}
            </span>
          )}
          
          <Signal className="h-3 w-3 text-gray-600" />
        </div>

        {/* Center - Sync status */}
        {syncProgress > 0 && syncProgress < 100 && (
          <div className="flex items-center space-x-1">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            <span className="text-blue-600">{syncProgress}%</span>
          </div>
        )}
        
        {pendingChanges > 0 && (
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-orange-500 rounded-full" />
            <span className="text-orange-600">{pendingChanges}</span>
          </div>
        )}

        {/* Right side - Battery status */}
        <div className="flex items-center space-x-2">
          {batteryInfo && (
            <>
              <Battery className={`h-3 w-3 ${
                batteryInfo.level < 0.2 ? 'text-red-600' : 'text-gray-600'
              }`} />
              <span className={`${
                batteryInfo.level < 0.2 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {Math.round(batteryInfo.level * 100)}%
              </span>
            </>
          )}
          
          <span className="text-gray-600">
            {new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Performance warning component
interface PerformanceWarningProps {
  onDismiss: () => void;
}

const PerformanceWarning: React.FC<PerformanceWarningProps> = ({ onDismiss }) => {
  return (
    <Alert className="m-4 border-orange-200 bg-orange-50">
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          Performance mode enabled for optimal experience on this device.
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-orange-800 hover:text-orange-900"
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  );
};

// Mobile loading spinner
const MobileLoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
};

// Responsive grid component for mobile layouts
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  const gridClass = isMobile 
    ? 'grid-cols-1' 
    : isTablet 
      ? 'grid-cols-2' 
      : 'grid-cols-3';
  
  return (
    <div className={`grid gap-4 ${gridClass} ${className}`}>
      {children}
    </div>
  );
};

// Mobile-optimized card grid
interface MobileCardGridProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  onItemAction?: (item: any, action: string) => void;
  className?: string;
}

export const MobileCardGrid: React.FC<MobileCardGridProps> = ({
  items,
  renderCard,
  onItemAction,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <ResponsiveGrid className={className}>
      {items.map((item, index) => (
        <TouchOptimizedCard
          key={item.id || index}
          title={item.title || item.name || `Item ${index + 1}`}
          onTap={() => onItemAction?.(item, 'tap')}
          onLongPress={() => onItemAction?.(item, 'longPress')}
          // onSwipeLeft={() => onItemAction?.(item, 'swipeLeft')}
          // onSwipeRight={() => onItemAction?.(item, 'swipeRight')}
          className={isMobile ? 'touch-manipulation' : ''}
        >
          {renderCard(item, index)}
        </TouchOptimizedCard>
      ))}
    </ResponsiveGrid>
  );
};