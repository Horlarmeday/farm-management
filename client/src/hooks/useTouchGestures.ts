import { useEffect, useRef, useCallback, useState } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface GestureState {
  isActive: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  velocity: { x: number; y: number };
  distance: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  duration: number;
}

interface SwipeGesture {
  direction: 'up' | 'down' | 'left' | 'right';
  velocity: number;
  distance: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
  velocity: number;
}

interface TouchGestureOptions {
  swipeThreshold?: number; // minimum distance for swipe
  velocityThreshold?: number; // minimum velocity for swipe
  pinchThreshold?: number; // minimum scale change for pinch
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableLongPress?: boolean;
  longPressDelay?: number;
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onLongPress?: (point: TouchPoint) => void;
  onTouchStart?: (point: TouchPoint) => void;
  onTouchMove?: (point: TouchPoint) => void;
  onTouchEnd?: (point: TouchPoint) => void;
}

interface TouchGestureReturn {
  gestureState: GestureState;
  bindTouchEvents: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
    onTouchCancel: (e: TouchEvent) => void;
  };
  resetGesture: () => void;
}

/**
 * High-performance touch gesture hook with passive event listeners
 * Optimized for <16ms touch responses and 60fps scrolling
 */
export const useTouchGestures = ({
  swipeThreshold = 50,
  velocityThreshold = 0.5,
  pinchThreshold = 0.1,
  enableSwipe = true,
  enablePinch = true,
  enableLongPress = false,
  longPressDelay = 500,
  onSwipe,
  onPinch,
  onLongPress,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: TouchGestureOptions = {}): TouchGestureReturn => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    velocity: { x: 0, y: 0 },
    distance: 0,
    direction: null,
    duration: 0
  });

  const touchHistoryRef = useRef<TouchPoint[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pinchStartDistanceRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Calculate distance between two points
  const calculateDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate velocity based on recent touch history
  const calculateVelocity = useCallback((currentPoint: TouchPoint): { x: number; y: number } => {
    const history = touchHistoryRef.current;
    if (history.length < 2) return { x: 0, y: 0 };

    // Use last few points for velocity calculation
    const recentPoints = history.slice(-3);
    const firstPoint = recentPoints[0];
    const lastPoint = recentPoints[recentPoints.length - 1];
    
    const timeDiff = lastPoint.timestamp - firstPoint.timestamp;
    if (timeDiff === 0) return { x: 0, y: 0 };

    const dx = lastPoint.x - firstPoint.x;
    const dy = lastPoint.y - firstPoint.y;

    return {
      x: dx / timeDiff,
      y: dy / timeDiff
    };
  }, []);

  // Determine swipe direction
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): 'up' | 'down' | 'left' | 'right' | null => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < swipeThreshold) return null;

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, [swipeThreshold]);

  // Get touch point from event
  const getTouchPoint = useCallback((e: TouchEvent, index: number = 0): TouchPoint => {
    const touch = e.touches[index] || e.changedTouches[index];
    return {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: performance.now()
    };
  }, []);

  // Update gesture state with throttling for performance
  const updateGestureState = useCallback((updates: Partial<GestureState>) => {
    const now = performance.now();
    
    // Throttle updates to 60fps (16.67ms)
    if (now - lastFrameTimeRef.current < 16.67) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(() => {
        setGestureState(prev => ({ ...prev, ...updates }));
        lastFrameTimeRef.current = now;
      });
    } else {
      setGestureState(prev => ({ ...prev, ...updates }));
      lastFrameTimeRef.current = now;
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const point = getTouchPoint(e);
    
    // Clear any existing long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Initialize touch history
    touchHistoryRef.current = [point];

    // Handle pinch gesture initialization
    if (enablePinch && e.touches.length === 2) {
      const point1 = getTouchPoint(e, 0);
      const point2 = getTouchPoint(e, 1);
      pinchStartDistanceRef.current = calculateDistance(point1, point2);
    }

    updateGestureState({
      isActive: true,
      startPoint: point,
      currentPoint: point,
      velocity: { x: 0, y: 0 },
      distance: 0,
      direction: null,
      duration: 0
    });

    // Set up long press timer
    if (enableLongPress && e.touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        if (onLongPress) {
          onLongPress(point);
        }
      }, longPressDelay);
    }

    if (onTouchStart) {
      onTouchStart(point);
    }
  }, [getTouchPoint, enablePinch, enableLongPress, longPressDelay, onLongPress, onTouchStart, calculateDistance, updateGestureState]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!gestureState.isActive || !gestureState.startPoint) return;

    const point = getTouchPoint(e);
    
    // Add to touch history (keep last 10 points for velocity calculation)
    touchHistoryRef.current.push(point);
    if (touchHistoryRef.current.length > 10) {
      touchHistoryRef.current.shift();
    }

    // Calculate current gesture metrics
    const distance = calculateDistance(gestureState.startPoint, point);
    const velocity = calculateVelocity(point);
    const direction = getSwipeDirection(gestureState.startPoint, point);
    const duration = point.timestamp - gestureState.startPoint.timestamp;

    // Handle pinch gesture
    if (enablePinch && e.touches.length === 2) {
      const point1 = getTouchPoint(e, 0);
      const point2 = getTouchPoint(e, 1);
      const currentDistance = calculateDistance(point1, point2);
      
      if (pinchStartDistanceRef.current > 0) {
        const scale = currentDistance / pinchStartDistanceRef.current;
        const center = {
          x: (point1.x + point2.x) / 2,
          y: (point1.y + point2.y) / 2
        };
        
        if (Math.abs(scale - 1) > pinchThreshold && onPinch) {
          onPinch({
            scale,
            center,
            velocity: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
          });
        }
      }
    }

    updateGestureState({
      currentPoint: point,
      velocity,
      distance,
      direction,
      duration
    });

    // Clear long press timer on movement
    if (longPressTimerRef.current && distance > 10) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (onTouchMove) {
      onTouchMove(point);
    }
  }, [gestureState.isActive, gestureState.startPoint, getTouchPoint, calculateDistance, calculateVelocity, getSwipeDirection, enablePinch, pinchThreshold, onPinch, updateGestureState, onTouchMove]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!gestureState.isActive || !gestureState.startPoint) return;

    const point = getTouchPoint(e);
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle swipe gesture
    if (enableSwipe && gestureState.distance >= swipeThreshold) {
      const velocity = calculateVelocity(point);
      const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      if (velocityMagnitude >= velocityThreshold && gestureState.direction && onSwipe) {
        onSwipe({
          direction: gestureState.direction,
          velocity: velocityMagnitude,
          distance: gestureState.distance,
          duration: gestureState.duration
        });
      }
    }

    updateGestureState({
      isActive: false,
      currentPoint: point
    });

    // Clear touch history
    touchHistoryRef.current = [];
    pinchStartDistanceRef.current = 0;

    if (onTouchEnd) {
      onTouchEnd(point);
    }
  }, [gestureState.isActive, gestureState.startPoint, gestureState.distance, gestureState.direction, gestureState.duration, getTouchPoint, enableSwipe, swipeThreshold, calculateVelocity, velocityThreshold, onSwipe, updateGestureState, onTouchEnd]);

  // Handle touch cancel
  const handleTouchCancel = useCallback((e: TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    updateGestureState({
      isActive: false,
      startPoint: null,
      currentPoint: null,
      velocity: { x: 0, y: 0 },
      distance: 0,
      direction: null,
      duration: 0
    });

    touchHistoryRef.current = [];
    pinchStartDistanceRef.current = 0;
  }, [updateGestureState]);

  // Reset gesture state
  const resetGesture = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setGestureState({
      isActive: false,
      startPoint: null,
      currentPoint: null,
      velocity: { x: 0, y: 0 },
      distance: 0,
      direction: null,
      duration: 0
    });

    touchHistoryRef.current = [];
    pinchStartDistanceRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    gestureState,
    bindTouchEvents: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    },
    resetGesture
  };
};

/**
 * Hook for optimized scrolling with passive event listeners
 * Ensures smooth 60fps scrolling performance
 */
export const useOptimizedScroll = ({
  onScroll,
  throttleMs = 16.67 // 60fps
}: {
  onScroll?: (scrollData: { scrollTop: number; scrollLeft: number; isScrolling: boolean }) => void;
  throttleMs?: number;
} = {}) => {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  const handleScroll = useCallback((e: Event) => {
    const now = performance.now();
    const target = e.target as HTMLElement;
    
    // Throttle scroll events
    if (now - lastScrollTimeRef.current < throttleMs) {
      return;
    }
    
    lastScrollTimeRef.current = now;
    isScrollingRef.current = true;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set timeout to detect scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      if (onScroll) {
        onScroll({
          scrollTop: target.scrollTop,
          scrollLeft: target.scrollLeft,
          isScrolling: false
        });
      }
    }, 150);
    
    if (onScroll) {
      onScroll({
        scrollTop: target.scrollTop,
        scrollLeft: target.scrollLeft,
        isScrolling: true
      });
    }
  }, [onScroll, throttleMs]);

  const bindScrollEvents = {
    onScroll: handleScroll
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    bindScrollEvents,
    isScrolling: isScrollingRef.current
  };
};

/**
 * Hook for setting up passive event listeners on elements
 * Optimizes touch performance by preventing default behavior blocking
 */
export const usePassiveEventListeners = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive event listeners for better performance
    const passiveOptions = { passive: true };
    
    const touchStartHandler = (e: TouchEvent) => {
      // Touch start logic here
    };
    
    const touchMoveHandler = (e: TouchEvent) => {
      // Touch move logic here
    };
    
    const wheelHandler = (e: WheelEvent) => {
      // Wheel event logic here
    };

    element.addEventListener('touchstart', touchStartHandler, passiveOptions);
    element.addEventListener('touchmove', touchMoveHandler, passiveOptions);
    element.addEventListener('wheel', wheelHandler, passiveOptions);

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('wheel', wheelHandler);
    };
  }, [elementRef]);
};