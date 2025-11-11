import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

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
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
  
  // Use useMemo for derived state instead of useState + useEffect
  const state = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape' as const,
        isTouchDevice: false,
      };
    }

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' as const : 'portrait' as const,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  }, [isMobile, isTablet, isDesktop]);
  
  return state;
};

// Hook for specific breakpoint checks
export const useBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  const { screenWidth } = useResponsive();
  return screenWidth >= BREAKPOINTS[breakpoint];
};

// Note: useMediaQuery is now imported from ./useMediaQuery with optimized singleton pattern

// Shared online/offline state manager
class OnlineStateManager {
  private static instance: OnlineStateManager;
  private listeners = new Set<(isOnline: boolean) => void>();
  private isOnline: boolean;

  private constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  static getInstance(): OnlineStateManager {
    if (!OnlineStateManager.instance) {
      OnlineStateManager.instance = new OnlineStateManager();
    }
    return OnlineStateManager.instance;
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.listeners.forEach(listener => listener(true));
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.listeners.forEach(listener => listener(false));
  };

  subscribe(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.isOnline);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  getCurrentState() {
    return this.isOnline;
  }
}

// Hook for device capabilities detection
export const useDeviceCapabilities = () => {
  const [isOnline, setIsOnline] = useState(() => 
    OnlineStateManager.getInstance().getCurrentState()
  );

  useEffect(() => {
    const manager = OnlineStateManager.getInstance();
    return manager.subscribe(setIsOnline);
  }, []);

  const capabilities = useMemo(() => ({
    touchSupport: typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    hoverSupport: typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches,
    pointerSupport: typeof window !== 'undefined' && 'PointerEvent' in window,
    webGLSupport: (() => {
      if (typeof window === 'undefined') return false;
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    localStorageSupport: (() => {
      if (typeof window === 'undefined') return false;
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })(),
    cookieSupport: typeof navigator !== 'undefined' && navigator.cookieEnabled,
    geolocationSupport: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    notificationSupport: typeof window !== 'undefined' && 'Notification' in window,
    serviceWorkerSupport: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    webSocketSupport: typeof window !== 'undefined' && 'WebSocket' in window,
    isOnline
  }), [isOnline]);

  return capabilities;
};

// Shared touch gesture manager
class TouchGestureManager {
  private static instance: TouchGestureManager;
  private listeners = new Set<(gesture: TouchGestureState) => void>();
  private currentGesture: TouchGestureState = {
    isLongPress: false,
    swipeDirection: null,
    touchStart: false
  };
  private touchStart: { x: number; y: number; time: number } | null = null;
  private longPressTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      document.addEventListener('touchend', this.handleTouchEnd, { passive: true });
      document.addEventListener('touchcancel', this.handleTouchCancel, { passive: true });
    }
  }

  static getInstance(): TouchGestureManager {
    if (!TouchGestureManager.instance) {
      TouchGestureManager.instance = new TouchGestureManager();
    }
    return TouchGestureManager.instance;
  }

  private updateGesture(updates: Partial<TouchGestureState>) {
    this.currentGesture = { ...this.currentGesture, ...updates };
    this.listeners.forEach(listener => listener(this.currentGesture));
  }

  private handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    this.updateGesture({
      isLongPress: false,
      swipeDirection: null,
      touchStart: true
    });

    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      this.updateGesture({ isLongPress: true });
    }, 500);
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (!this.touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const deltaTime = Date.now() - this.touchStart.time;

    // Detect swipe (minimum distance and maximum time)
    let swipeDirection: 'left' | 'right' | 'up' | 'down' | null = null;
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      if (deltaTime < 300) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          swipeDirection = deltaX > 0 ? 'right' : 'left';
        } else {
          swipeDirection = deltaY > 0 ? 'down' : 'up';
        }
      }
    }

    this.updateGesture({ swipeDirection, touchStart: false });
    this.touchStart = null;
  };

  private handleTouchCancel = () => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    this.updateGesture({
      touchStart: false,
      isLongPress: false
    });
    this.touchStart = null;
  };

  subscribe(callback: (gesture: TouchGestureState) => void) {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.currentGesture);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  getCurrentState() {
    return this.currentGesture;
  }
}

type TouchGestureState = {
  isLongPress: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  touchStart: boolean;
};

// Hook for touch gesture detection
export const useTouchGestures = () => {
  const [gestureState, setGestureState] = useState<TouchGestureState>(() => 
    TouchGestureManager.getInstance().getCurrentState()
  );

  useEffect(() => {
    const manager = TouchGestureManager.getInstance();
    return manager.subscribe(setGestureState);
  }, []);

  return gestureState;
};

// Shared viewport manager for safe area insets and keyboard detection
class ViewportManager {
  private static instance: ViewportManager;
  private listeners = new Set<(state: ViewportState) => void>();
  private currentState: ViewportState = {
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
    isKeyboardVisible: false,
    keyboardHeight: 0
  };
  private initialViewportHeight: number;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialViewportHeight = window.visualViewport?.height || window.innerHeight;
      this.updateState();
      
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', this.handleViewportChange);
      } else {
        window.addEventListener('resize', this.handleViewportChange);
      }
      window.addEventListener('orientationchange', this.handleViewportChange);
    } else {
      this.initialViewportHeight = 0;
    }
  }

  static getInstance(): ViewportManager {
    if (!ViewportManager.instance) {
      ViewportManager.instance = new ViewportManager();
    }
    return ViewportManager.instance;
  }

  private updateState() {
    if (typeof window === 'undefined') return;
    
    // Update safe area insets
    const computedStyle = getComputedStyle(document.documentElement);
    const insets = {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10)
    };

    // Update keyboard state
    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const heightDifference = this.initialViewportHeight - currentHeight;
    const isKeyboardVisible = heightDifference > 150;
    const keyboardHeight = isKeyboardVisible ? heightDifference : 0;

    this.currentState = {
      insets,
      isKeyboardVisible,
      keyboardHeight
    };

    this.listeners.forEach(listener => listener(this.currentState));
  }

  private handleViewportChange = () => {
    this.updateState();
  };

  subscribe(callback: (state: ViewportState) => void) {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.currentState);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  getCurrentState() {
    return this.currentState;
  }
}

type ViewportState = {
  insets: { top: number; right: number; bottom: number; left: number };
  isKeyboardVisible: boolean;
  keyboardHeight: number;
};

// Hook for safe area insets (for devices with notches)
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState(() => 
    ViewportManager.getInstance().getCurrentState().insets
  );

  useEffect(() => {
    const manager = ViewportManager.getInstance();
    return manager.subscribe((state) => setInsets(state.insets));
  }, []);

  return insets;
};

// Hook for detecting virtual keyboard visibility
export const useKeyboardVisible = () => {
  const [keyboardState, setKeyboardState] = useState(() => {
    const state = ViewportManager.getInstance().getCurrentState();
    return {
      isKeyboardVisible: state.isKeyboardVisible,
      keyboardHeight: state.keyboardHeight
    };
  });

  useEffect(() => {
    const manager = ViewportManager.getInstance();
    return manager.subscribe((state) => {
      setKeyboardState({
        isKeyboardVisible: state.isKeyboardVisible,
        keyboardHeight: state.keyboardHeight
      });
    });
  }, []);

  return keyboardState;
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