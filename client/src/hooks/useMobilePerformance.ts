import { useEffect, useRef, useCallback, useState } from 'react';
import { usePerformanceTracker } from './usePerformanceTracker';
import { useMemoryMonitor } from './useMemoryMonitor';

interface TouchLatencyMetrics {
  touchStartLatency: number;
  touchMoveLatency: number;
  touchEndLatency: number;
  averageLatency: number;
  maxLatency: number;
  timestamp: number;
}

interface ScrollPerformanceMetrics {
  fps: number;
  frameDrops: number;
  scrollLatency: number;
  smoothness: number; // 0-1 score
  timestamp: number;
}

interface MobilePerformanceMetrics {
  touchLatency: TouchLatencyMetrics | null;
  scrollPerformance: ScrollPerformanceMetrics | null;
  deviceInfo: {
    isMobile: boolean;
    isTouch: boolean;
    pixelRatio: number;
    viewportSize: { width: number; height: number };
  };
  batteryLevel?: number;
  networkType?: string;
}

interface MobilePerformanceOptions {
  enableTouchTracking?: boolean;
  enableScrollTracking?: boolean;
  enableBatteryTracking?: boolean;
  enableNetworkTracking?: boolean;
  touchSampleRate?: number;
  scrollSampleRate?: number;
  onPerformanceAlert?: (metrics: MobilePerformanceMetrics) => void;
}

interface MobilePerformanceResult {
  metrics: MobilePerformanceMetrics;
  isOptimal: boolean;
  recommendations: string[];
  startTracking: () => void;
  stopTracking: () => void;
  clearMetrics: () => void;
}

/**
 * Comprehensive mobile performance monitoring hook
 * Tracks touch latency, scroll performance, and mobile-specific metrics
 */
export const useMobilePerformance = ({
  enableTouchTracking = true,
  enableScrollTracking = true,
  enableBatteryTracking = true,
  enableNetworkTracking = true,
  touchSampleRate = 0.1,
  scrollSampleRate = 0.2,
  onPerformanceAlert
}: MobilePerformanceOptions = {}): MobilePerformanceResult => {
  const [metrics, setMetrics] = useState<MobilePerformanceMetrics>({
    touchLatency: null,
    scrollPerformance: null,
    deviceInfo: {
      isMobile: false,
      isTouch: false,
      pixelRatio: 1,
      viewportSize: { width: 0, height: 0 }
    }
  });
  
  const [isTracking, setIsTracking] = useState(false);
  const touchLatencyRef = useRef<number[]>([]);
  const scrollFramesRef = useRef<number[]>([]);
  const lastScrollTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);
  const batteryRef = useRef<any>(null);
  const networkRef = useRef<any>(null);

  // Initialize device info
  useEffect(() => {
    const updateDeviceInfo = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const pixelRatio = window.devicePixelRatio || 1;
      const viewportSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      setMetrics(prev => ({
        ...prev,
        deviceInfo: { isMobile, isTouch, pixelRatio, viewportSize }
      }));
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  // Battery API tracking
  useEffect(() => {
    if (!enableBatteryTracking) return;

    const getBatteryInfo = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          batteryRef.current = battery;
          
          const updateBattery = () => {
            setMetrics(prev => ({
              ...prev,
              batteryLevel: battery.level * 100
            }));
          };

          battery.addEventListener('levelchange', updateBattery);
          updateBattery();
          
          return () => {
            battery.removeEventListener('levelchange', updateBattery);
          };
        }
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    };

    getBatteryInfo();
  }, [enableBatteryTracking]);

  // Network API tracking
  useEffect(() => {
    if (!enableNetworkTracking) return;

    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setMetrics(prev => ({
          ...prev,
          networkType: connection.effectiveType || connection.type || 'unknown'
        }));
      }
    };

    updateNetworkInfo();
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, [enableNetworkTracking]);

  // Touch latency tracking
  const trackTouchLatency = useCallback((eventType: 'start' | 'move' | 'end', startTime: number) => {
    if (!enableTouchTracking || Math.random() > touchSampleRate) return;

    const latency = performance.now() - startTime;
    touchLatencyRef.current.push(latency);
    
    // Keep only recent samples (last 50)
    if (touchLatencyRef.current.length > 50) {
      touchLatencyRef.current.shift();
    }

    const latencies = touchLatencyRef.current;
    const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);

    const touchMetrics: TouchLatencyMetrics = {
      touchStartLatency: eventType === 'start' ? latency : 0,
      touchMoveLatency: eventType === 'move' ? latency : 0,
      touchEndLatency: eventType === 'end' ? latency : 0,
      averageLatency,
      maxLatency,
      timestamp: performance.now()
    };

    setMetrics(prev => ({
      ...prev,
      touchLatency: touchMetrics
    }));
  }, [enableTouchTracking, touchSampleRate]);

  // Scroll performance tracking
  const trackScrollPerformance = useCallback(() => {
    if (!enableScrollTracking || Math.random() > scrollSampleRate) return;

    const now = performance.now();
    const timeSinceLastScroll = now - lastScrollTimeRef.current;
    
    if (timeSinceLastScroll > 0) {
      const fps = 1000 / timeSinceLastScroll;
      scrollFramesRef.current.push(fps);
      
      // Keep only recent samples (last 30)
      if (scrollFramesRef.current.length > 30) {
        scrollFramesRef.current.shift();
      }

      frameCountRef.current++;
      
      // Count dropped frames (below 55fps for 60fps target)
      if (fps < 55) {
        droppedFramesRef.current++;
      }

      const frames = scrollFramesRef.current;
      const averageFps = frames.reduce((sum, f) => sum + f, 0) / frames.length;
      const frameDropPercentage = (droppedFramesRef.current / frameCountRef.current) * 100;
      const smoothness = Math.max(0, (averageFps - 30) / 30); // 0-1 score based on 30-60fps range

      const scrollMetrics: ScrollPerformanceMetrics = {
        fps: averageFps,
        frameDrops: frameDropPercentage,
        scrollLatency: timeSinceLastScroll,
        smoothness,
        timestamp: now
      };

      setMetrics(prev => ({
        ...prev,
        scrollPerformance: scrollMetrics
      }));
    }

    lastScrollTimeRef.current = now;
  }, [enableScrollTracking, scrollSampleRate]);

  // Event listeners for touch and scroll tracking
  useEffect(() => {
    if (!isTracking) return;

    const handleTouchStart = (e: TouchEvent) => {
      trackTouchLatency('start', performance.now());
    };

    const handleTouchMove = (e: TouchEvent) => {
      trackTouchLatency('move', performance.now());
    };

    const handleTouchEnd = (e: TouchEvent) => {
      trackTouchLatency('end', performance.now());
    };

    const handleScroll = () => {
      requestAnimationFrame(trackScrollPerformance);
    };

    if (enableTouchTracking) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    if (enableScrollTracking) {
      document.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isTracking, enableTouchTracking, enableScrollTracking, trackTouchLatency, trackScrollPerformance]);

  // Performance analysis
  const isOptimal = (() => {
    const { touchLatency, scrollPerformance, batteryLevel } = metrics;
    
    // Check touch latency (should be < 16ms for 60fps)
    const touchOk = !touchLatency || touchLatency.averageLatency < 16;
    
    // Check scroll performance (should be > 55fps with < 10% frame drops)
    const scrollOk = !scrollPerformance || (scrollPerformance.fps > 55 && scrollPerformance.frameDrops < 10);
    
    // Check battery level (warn if < 20%)
    const batteryOk = !batteryLevel || batteryLevel > 20;
    
    return touchOk && scrollOk && batteryOk;
  })();

  // Performance recommendations
  const recommendations = (() => {
    const recs: string[] = [];
    const { touchLatency, scrollPerformance, batteryLevel, networkType } = metrics;
    
    if (touchLatency && touchLatency.averageLatency > 16) {
      recs.push('Touch latency is high. Consider reducing touch event processing.');
    }
    
    if (scrollPerformance && scrollPerformance.fps < 55) {
      recs.push('Scroll performance is poor. Consider optimizing scroll handlers.');
    }
    
    if (scrollPerformance && scrollPerformance.frameDrops > 10) {
      recs.push('High frame drop rate detected. Consider reducing DOM manipulations during scroll.');
    }
    
    if (batteryLevel && batteryLevel < 20) {
      recs.push('Low battery detected. Consider reducing background processing.');
    }
    
    if (networkType === 'slow-2g' || networkType === '2g') {
      recs.push('Slow network detected. Consider reducing data usage and enabling offline features.');
    }
    
    return recs;
  })();

  // Performance alert
  useEffect(() => {
    if (onPerformanceAlert && !isOptimal && recommendations.length > 0) {
      onPerformanceAlert(metrics);
    }
  }, [isOptimal, recommendations.length, metrics, onPerformanceAlert]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  const clearMetrics = useCallback(() => {
    touchLatencyRef.current = [];
    scrollFramesRef.current = [];
    frameCountRef.current = 0;
    droppedFramesRef.current = 0;
    lastScrollTimeRef.current = 0;
    
    setMetrics(prev => ({
      ...prev,
      touchLatency: null,
      scrollPerformance: null
    }));
  }, []);

  return {
    metrics,
    isOptimal,
    recommendations,
    startTracking,
    stopTracking,
    clearMetrics
  };
};

/**
 * Lightweight mobile performance monitor for production
 */
export const useProductionMobilePerformance = () => {
  return useMobilePerformance({
    enableTouchTracking: true,
    enableScrollTracking: true,
    enableBatteryTracking: false,
    enableNetworkTracking: true,
    touchSampleRate: 0.01, // 1% sampling
    scrollSampleRate: 0.05, // 5% sampling
    onPerformanceAlert: (metrics) => {
      console.warn('Mobile performance issue detected:', metrics);
    }
  });
};

/**
 * Development mobile performance monitor with detailed tracking
 */
export const useDevMobilePerformance = () => {
  return useMobilePerformance({
    enableTouchTracking: true,
    enableScrollTracking: true,
    enableBatteryTracking: true,
    enableNetworkTracking: true,
    touchSampleRate: 0.1, // 10% sampling
    scrollSampleRate: 0.2, // 20% sampling
    onPerformanceAlert: (metrics) => {
      console.log('Mobile performance metrics:', metrics);
    }
  });
};