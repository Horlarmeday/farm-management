import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        isTouchDevice: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      isTouchDevice,
    };
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setState({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouchDevice,
      });
    };

    // Debounce resize events
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdateState = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 100);
    };

    window.addEventListener('resize', debouncedUpdateState);
    window.addEventListener('orientationchange', debouncedUpdateState);

    return () => {
      window.removeEventListener('resize', debouncedUpdateState);
      window.removeEventListener('orientationchange', debouncedUpdateState);
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
};

// Hook for specific breakpoint checks
export const useBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  const { screenWidth } = useResponsive();
  return screenWidth >= BREAKPOINTS[breakpoint];
};

// Hook for media query-like functionality
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Hook for detecting device capabilities
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    hasCamera: false,
    hasGeolocation: false,
    hasNotifications: false,
    hasVibration: false,
    hasDeviceMotion: false,
    hasDeviceOrientation: false,
    isOnline: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = async () => {
      const newCapabilities = {
        hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        hasGeolocation: !!navigator.geolocation,
        hasNotifications: 'Notification' in window,
        hasVibration: 'vibrate' in navigator,
        hasDeviceMotion: 'DeviceMotionEvent' in window,
        hasDeviceOrientation: 'DeviceOrientationEvent' in window,
        isOnline: navigator.onLine,
      };

      setCapabilities(newCapabilities);
    };

    checkCapabilities();

    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return capabilities;
};

// Hook for touch gesture detection
export const useTouchGestures = () => {
  const [gestures, setGestures] = useState({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    isPinching: false,
    isLongPress: false,
  });

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });

    // Start long press timer
    const timer = setTimeout(() => {
      setGestures(prev => ({ ...prev, isLongPress: true }));
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (!touchStart) return;

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Detect swipe gestures
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (deltaTime < maxSwipeTime) {
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          setGestures(prev => ({ ...prev, isSwipeRight: true }));
        } else {
          setGestures(prev => ({ ...prev, isSwipeLeft: true }));
        }
      } else if (Math.abs(deltaY) > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0) {
          setGestures(prev => ({ ...prev, isSwipeDown: true }));
        } else {
          setGestures(prev => ({ ...prev, isSwipeUp: true }));
        }
      }
    }

    // Reset gestures after a short delay
    setTimeout(() => {
      setGestures({
        isSwipeLeft: false,
        isSwipeRight: false,
        isSwipeUp: false,
        isSwipeDown: false,
        isPinching: false,
        isLongPress: false,
      });
    }, 100);

    setTouchStart(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [touchStart, longPressTimer]);

  return gestures;
};

// Hook for safe area insets (for devices with notches)
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
};

// Hook for detecting virtual keyboard visibility
export const useKeyboardVisible = (): boolean => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Consider keyboard visible if viewport height decreased by more than 150px
      setIsKeyboardVisible(heightDifference > 150);
    };

    // Use visual viewport API if available, otherwise fall back to resize events
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => {
        window.removeEventListener('resize', handleViewportChange);
      };
    }
  }, []);

  return isKeyboardVisible;
};

// Hook for safe area with enhanced mobile support
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  
  return {
    ...insets,
    // Add default mobile padding if safe area is not available
    paddingTop: Math.max(insets.top, isMobile ? 20 : 0),
    paddingBottom: Math.max(insets.bottom, isMobile ? 20 : 0),
    paddingLeft: Math.max(insets.left, 0),
    paddingRight: Math.max(insets.right, 0),
  };
};