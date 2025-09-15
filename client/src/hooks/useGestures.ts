import { useGesture } from '@use-gesture/react';
import { useSpring, config } from 'react-spring';
import { useState, useCallback, useRef } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocity?: number;
}

interface PinchGestureOptions {
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onZoom?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

interface DragGestureOptions {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (offset: { x: number; y: number }) => void;
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

// Hook for swipe gestures
export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocity = 0.3
  } = options;

  const bind = useGesture({
    onDrag: ({ direction: [dx, dy], distance, velocity: [vx, vy], last }) => {
      if (!last) return;
      
      const [distanceX, distanceY] = distance;
      const [velocityX, velocityY] = [Math.abs(vx), Math.abs(vy)];
      
      // Horizontal swipe
      if (distanceX > threshold && velocityX > velocity && distanceX > distanceY) {
        if (dx > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (dx < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      
      // Vertical swipe
      if (distanceY > threshold && velocityY > velocity && distanceY > distanceX) {
        if (dy > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (dy < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  });

  return bind;
};

// Hook for pinch/zoom gestures
export const usePinchGesture = (options: PinchGestureOptions) => {
  const {
    onPinchStart,
    onPinchEnd,
    onZoom,
    minScale = 0.5,
    maxScale = 3
  } = options;

  const [scale, setScale] = useState(1);
  const [{ zoom }, api] = useSpring(() => ({ zoom: 1 }));

  const bind = useGesture({
    onPinch: ({ offset: [scale], first, last }) => {
      if (first && onPinchStart) {
        onPinchStart();
      }
      
      if (last && onPinchEnd) {
        onPinchEnd();
      }
      
      const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
      setScale(clampedScale);
      
      api.start({ zoom: clampedScale });
      
      if (onZoom) {
        onZoom(clampedScale);
      }
    }
  });

  const resetZoom = useCallback(() => {
    setScale(1);
    api.start({ zoom: 1 });
    if (onZoom) {
      onZoom(1);
    }
  }, [api, onZoom]);

  return { bind, scale, zoom, resetZoom };
};

// Hook for drag gestures
export const useDragGesture = (options: DragGestureOptions) => {
  const {
    onDragStart,
    onDragEnd,
    onDrag,
    bounds
  } = options;

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));

  const bind = useGesture({
    onDrag: ({ offset: [ox, oy], first, last }) => {
      if (first && onDragStart) {
        onDragStart();
      }
      
      if (last && onDragEnd) {
        onDragEnd();
      }
      
      let clampedX = ox;
      let clampedY = oy;
      
      if (bounds) {
        if (bounds.left !== undefined) clampedX = Math.max(bounds.left, clampedX);
        if (bounds.right !== undefined) clampedX = Math.min(bounds.right, clampedX);
        if (bounds.top !== undefined) clampedY = Math.max(bounds.top, clampedY);
        if (bounds.bottom !== undefined) clampedY = Math.min(bounds.bottom, clampedY);
      }
      
      api.start({ x: clampedX, y: clampedY, immediate: !last });
      
      if (onDrag) {
        onDrag({ x: clampedX, y: clampedY });
      }
    }
  });

  const resetPosition = useCallback(() => {
    api.start({ x: 0, y: 0 });
    if (onDrag) {
      onDrag({ x: 0, y: 0 });
    }
  }, [api, onDrag]);

  return { bind, x, y, resetPosition };
};

// Hook for pull-to-refresh gesture
export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 80;
  const maxPull = 120;
  
  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  const bind = useGesture({
    onDrag: ({ movement: [, my], direction: [, dy], velocity: [, vy], last, cancel }) => {
      // Only allow pull down from top
      if (my < 0) {
        cancel();
        return;
      }
      
      const pullY = Math.min(my, maxPull);
      setPullDistance(pullY);
      
      if (last) {
        if (pullY > threshold && !isRefreshing) {
          setIsRefreshing(true);
          api.start({ y: threshold });
          
          Promise.resolve(onRefresh()).finally(() => {
            setIsRefreshing(false);
            setPullDistance(0);
            api.start({ y: 0 });
          });
        } else {
          setPullDistance(0);
          api.start({ y: 0 });
        }
      } else {
        api.start({ y: pullY, immediate: true });
      }
    }
  });

  return {
    bind,
    y,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1)
  };
};

// Hook for long press gesture
export const useLongPress = (
  onLongPress: () => void,
  options: {
    delay?: number;
    threshold?: number;
  } = {}
) => {
  const { delay = 500, threshold = 10 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const bind = useGesture({
    onPointerDown: ({ event }) => {
      const { clientX, clientY } = event as PointerEvent;
      startPos.current = { x: clientX, y: clientY };
      
      timeoutRef.current = setTimeout(() => {
        onLongPress();
      }, delay);
    },
    
    onPointerMove: ({ event }) => {
      if (!startPos.current || !timeoutRef.current) return;
      
      const { clientX, clientY } = event as PointerEvent;
      const distance = Math.sqrt(
        Math.pow(clientX - startPos.current.x, 2) + 
        Math.pow(clientY - startPos.current.y, 2)
      );
      
      if (distance > threshold) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    
    onPointerUp: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      startPos.current = null;
    }
  });

  return bind;
};

// Hook for tap gesture with double tap detection
export const useTapGesture = (
  onTap?: () => void,
  onDoubleTap?: () => void,
  options: {
    doubleTapDelay?: number;
    threshold?: number;
  } = {}
) => {
  const { doubleTapDelay = 300, threshold = 10 } = options;
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const bind = useGesture({
    onPointerDown: ({ event }) => {
      const { clientX, clientY } = event as PointerEvent;
      startPos.current = { x: clientX, y: clientY };
    },
    
    onPointerUp: ({ event }) => {
      if (!startPos.current) return;
      
      const { clientX, clientY } = event as PointerEvent;
      const distance = Math.sqrt(
        Math.pow(clientX - startPos.current.x, 2) + 
        Math.pow(clientY - startPos.current.y, 2)
      );
      
      if (distance > threshold) {
        startPos.current = null;
        return;
      }
      
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (onDoubleTap && timeSinceLastTap < doubleTapDelay) {
        // Double tap detected
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
          tapTimeoutRef.current = null;
        }
        onDoubleTap();
        lastTapRef.current = 0;
      } else {
        // Single tap (with delay to check for double tap)
        lastTapRef.current = now;
        
        if (onTap) {
          if (onDoubleTap) {
            tapTimeoutRef.current = setTimeout(() => {
              onTap();
              tapTimeoutRef.current = null;
            }, doubleTapDelay);
          } else {
            onTap();
          }
        }
      }
      
      startPos.current = null;
    }
  });

  return bind;
};