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
  smoothness: number; // 0-100 score
  timestamp: number;
}

interface MobilePerformanceMetrics {
  touchLatency: TouchLatencyMetrics;
  scrollPerformance: ScrollPerformanceMetrics;
  renderPerformance: {
    averageFrameTime: number;
    droppedFrames: number;
    jankScore: number; // 0-100, lower is better
  };
  networkPerformance: {
    connectionType: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  deviceMetrics: {
    screenSize: { width: number; height: number };
    pixelRatio: number;
    orientation: 'portrait' | 'landscape';
    isLowEndDevice: boolean;
  };
}

interface MobilePerformanceAlert {
  type: 'touch_latency' | 'scroll_jank' | 'frame_drops' | 'memory_pressure' | 'network_slow';
  severity: 'warning' | 'critical';
  message: string;
  metrics: Partial<MobilePerformanceMetrics>;
  timestamp: number;
}

interface MobilePerformanceOptions {
  touchLatencyThreshold?: number; // ms
  fpsThreshold?: number;
  jankThreshold?: number;
  enableTouchTracking?: boolean;
  enableScrollTracking?: boolean;
  enableNetworkTracking?: boolean;
  sampleRate?: number;
  onAlert?: (alert: MobilePerformanceAlert) => void;
  onMetricsUpdate?: (metrics: MobilePerformanceMetrics) => void;
}

interface MobilePerformanceReturn {
  metrics: MobilePerformanceMetrics | null;
  alerts: MobilePerformanceAlert[];
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearMetrics: () => void;
  getPerformanceScore: () => number;
  getOptimizationSuggestions: () => string[];
}

/**
 * Comprehensive mobile performance monitoring hook
 * Tracks touch latency, scroll performance, and mobile-specific metrics
 */
export const useMobilePerformanceMonitor = ({
  touchLatencyThreshold = 16, // 16ms for 60fps
  fpsThreshold = 55, // Below 55fps is concerning
  jankThreshold = 50, // Jank score threshold
  enableTouchTracking = true,
  enableScrollTracking = true,
  enableNetworkTracking = true,
  sampleRate = 1.0,
  onAlert,
  onMetricsUpdate
}: MobilePerformanceOptions = {}): MobilePerformanceReturn => {
  const [metrics, setMetrics] = useState<MobilePerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const alertsRef = useRef<MobilePerformanceAlert[]>([]);
  
  // Touch latency tracking
  const touchLatencyRef = useRef<number[]>([]);
  const touchStartTimeRef = useRef<number>(0);
  const scrollFrameTimesRef = useRef<number[]>([]);
  const lastScrollTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Performance tracking hooks
  const performanceTracker = usePerformanceTracker({
    componentName: 'MobilePerformanceMonitor',
    enableMemoryTracking: true,
    sampleRate
  });
  
  const memoryMonitor = useMemoryMonitor({
    alertThreshold: 30, // Lower threshold for mobile
    sampleInterval: 10000, // 10 seconds
    onAlert: (alert) => {
      const mobileAlert: MobilePerformanceAlert = {
        type: 'memory_pressure',
        severity: alert.severity === 'critical' ? 'critical' : 'warning',
        message: `Mobile memory pressure: ${alert.message}`,
        metrics: {},
        timestamp: Date.now()
      };
      alertsRef.current.push(mobileAlert);
      if (onAlert) onAlert(mobileAlert);
    }
  });

  // Detect if device is low-end
  const isLowEndDevice = useCallback(() => {
    // Check various indicators of low-end device
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const memory = (navigator as any).deviceMemory || 1;
    const connection = (navigator as any).connection;
    
    return (
      hardwareConcurrency <= 2 ||
      memory <= 2 ||
      (connection && connection.effectiveType === 'slow-2g') ||
      window.devicePixelRatio <= 1
    );
  }, []);

  // Get network information
  const getNetworkMetrics = useCallback(() => {
    const connection = (navigator as any).connection;
    if (!connection) {
      return {
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0
      };
    }
    
    return {
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    };
  }, []);

  // Get device metrics
  const getDeviceMetrics = useCallback(() => {
    return {
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      pixelRatio: window.devicePixelRatio,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape' as 'portrait' | 'landscape',
      isLowEndDevice: isLowEndDevice()
    };
  }, [isLowEndDevice]);

  // Track touch latency
  const trackTouchLatency = useCallback(() => {
    if (!enableTouchTracking) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartTimeRef.current = performance.now();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartTimeRef.current > 0) {
        const latency = performance.now() - touchStartTimeRef.current;
        touchLatencyRef.current.push(latency);
        
        // Keep only last 100 measurements
        if (touchLatencyRef.current.length > 100) {
          touchLatencyRef.current.shift();
        }
        
        // Alert on high latency
        if (latency > touchLatencyThreshold && onAlert) {
          const alert: MobilePerformanceAlert = {
            type: 'touch_latency',
            severity: latency > touchLatencyThreshold * 2 ? 'critical' : 'warning',
            message: `High touch latency detected: ${latency.toFixed(1)}ms`,
            metrics: {},
            timestamp: Date.now()
          };
          alertsRef.current.push(alert);
          onAlert(alert);
        }
      }
    };
    
    const handleTouchEnd = () => {
      touchStartTimeRef.current = 0;
    };
    
    // Use passive listeners for better performance
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableTouchTracking, touchLatencyThreshold, onAlert]);

  // Track scroll performance
  const trackScrollPerformance = useCallback(() => {
    if (!enableScrollTracking) return;
    
    let frameCount = 0;
    let droppedFrames = 0;
    let lastTime = performance.now();
    
    const measureScrollFPS = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      
      if (deltaTime > 0) {
        const fps = 1000 / deltaTime;
        scrollFrameTimesRef.current.push(fps);
        
        // Count dropped frames (below 55fps)
        if (fps < fpsThreshold) {
          droppedFrames++;
        }
        
        frameCount++;
        
        // Keep only last 60 measurements (1 second at 60fps)
        if (scrollFrameTimesRef.current.length > 60) {
          scrollFrameTimesRef.current.shift();
        }
      }
      
      lastTime = now;
    };
    
    const handleScroll = () => {
      lastScrollTimeRef.current = performance.now();
      requestAnimationFrame(measureScrollFPS);
    };
    
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [enableScrollTracking, fpsThreshold]);

  // Calculate touch latency metrics
  const getTouchLatencyMetrics = useCallback((): TouchLatencyMetrics => {
    const latencies = touchLatencyRef.current;
    if (latencies.length === 0) {
      return {
        touchStartLatency: 0,
        touchMoveLatency: 0,
        touchEndLatency: 0,
        averageLatency: 0,
        maxLatency: 0,
        timestamp: Date.now()
      };
    }
    
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    const average = sum / latencies.length;
    const max = Math.max(...latencies);
    
    return {
      touchStartLatency: latencies[0] || 0,
      touchMoveLatency: average,
      touchEndLatency: latencies[latencies.length - 1] || 0,
      averageLatency: average,
      maxLatency: max,
      timestamp: Date.now()
    };
  }, []);

  // Calculate scroll performance metrics
  const getScrollPerformanceMetrics = useCallback((): ScrollPerformanceMetrics => {
    const frameTimes = scrollFrameTimesRef.current;
    if (frameTimes.length === 0) {
      return {
        fps: 60,
        frameDrops: 0,
        scrollLatency: 0,
        smoothness: 100,
        timestamp: Date.now()
      };
    }
    
    const averageFPS = frameTimes.reduce((acc, val) => acc + val, 0) / frameTimes.length;
    const frameDrops = frameTimes.filter(fps => fps < fpsThreshold).length;
    const smoothness = Math.max(0, 100 - (frameDrops / frameTimes.length) * 100);
    
    return {
      fps: averageFPS,
      frameDrops,
      scrollLatency: lastScrollTimeRef.current > 0 ? performance.now() - lastScrollTimeRef.current : 0,
      smoothness,
      timestamp: Date.now()
    };
  }, [fpsThreshold]);

  // Calculate render performance metrics
  const getRenderPerformanceMetrics = useCallback(() => {
    const renderMetrics = performanceTracker.metrics;
    const averageRenderTime = performanceTracker.getAverageRenderTime();
    
    // Calculate jank score based on frame times
    const jankScore = Math.min(100, (averageRenderTime / 16.67) * 100);
    
    return {
      averageFrameTime: averageRenderTime,
      droppedFrames: frameTimesRef.current.filter(time => time > 16.67).length,
      jankScore
    };
  }, [performanceTracker]);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const newMetrics: MobilePerformanceMetrics = {
      touchLatency: getTouchLatencyMetrics(),
      scrollPerformance: getScrollPerformanceMetrics(),
      renderPerformance: getRenderPerformanceMetrics(),
      networkPerformance: enableNetworkTracking ? getNetworkMetrics() : {
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0
      },
      deviceMetrics: getDeviceMetrics()
    };
    
    setMetrics(newMetrics);
    
    if (onMetricsUpdate) {
      onMetricsUpdate(newMetrics);
    }
    
    // Check for performance issues
    checkPerformanceAlerts(newMetrics);
  }, [getTouchLatencyMetrics, getScrollPerformanceMetrics, getRenderPerformanceMetrics, enableNetworkTracking, getNetworkMetrics, getDeviceMetrics, onMetricsUpdate]);

  // Check for performance alerts
  const checkPerformanceAlerts = useCallback((metrics: MobilePerformanceMetrics) => {
    const alerts: MobilePerformanceAlert[] = [];
    
    // Touch latency alerts
    if (metrics.touchLatency.averageLatency > touchLatencyThreshold) {
      alerts.push({
        type: 'touch_latency',
        severity: metrics.touchLatency.averageLatency > touchLatencyThreshold * 2 ? 'critical' : 'warning',
        message: `Average touch latency: ${metrics.touchLatency.averageLatency.toFixed(1)}ms`,
        metrics: { touchLatency: metrics.touchLatency },
        timestamp: Date.now()
      });
    }
    
    // Scroll performance alerts
    if (metrics.scrollPerformance.fps < fpsThreshold) {
      alerts.push({
        type: 'scroll_jank',
        severity: metrics.scrollPerformance.fps < 30 ? 'critical' : 'warning',
        message: `Low scroll FPS: ${metrics.scrollPerformance.fps.toFixed(1)}`,
        metrics: { scrollPerformance: metrics.scrollPerformance },
        timestamp: Date.now()
      });
    }
    
    // Frame drops alerts
    if (metrics.renderPerformance.jankScore > jankThreshold) {
      alerts.push({
        type: 'frame_drops',
        severity: metrics.renderPerformance.jankScore > 75 ? 'critical' : 'warning',
        message: `High jank score: ${metrics.renderPerformance.jankScore.toFixed(1)}`,
        metrics: { renderPerformance: metrics.renderPerformance },
        timestamp: Date.now()
      });
    }
    
    // Network performance alerts
    if (enableNetworkTracking && metrics.networkPerformance.effectiveType === 'slow-2g') {
      alerts.push({
        type: 'network_slow',
        severity: 'warning',
        message: 'Slow network connection detected',
        metrics: { networkPerformance: metrics.networkPerformance },
        timestamp: Date.now()
      });
    }
    
    // Add alerts and trigger callbacks
    alerts.forEach(alert => {
      alertsRef.current.push(alert);
      if (onAlert) {
        onAlert(alert);
      }
    });
    
    // Keep only last 50 alerts
    if (alertsRef.current.length > 50) {
      alertsRef.current = alertsRef.current.slice(-50);
    }
  }, [touchLatencyThreshold, fpsThreshold, jankThreshold, enableNetworkTracking, onAlert]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Start memory monitoring
    memoryMonitor.startMonitoring();
    
    // Set up touch and scroll tracking
    const touchCleanup = trackTouchLatency();
    const scrollCleanup = trackScrollPerformance();
    
    // Update metrics every 5 seconds
    const metricsInterval = setInterval(updateMetrics, 5000);
    
    return () => {
      if (touchCleanup) touchCleanup();
      if (scrollCleanup) scrollCleanup();
      clearInterval(metricsInterval);
    };
  }, [memoryMonitor, trackTouchLatency, trackScrollPerformance, updateMetrics]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    memoryMonitor.stopMonitoring();
  }, [memoryMonitor]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics(null);
    alertsRef.current = [];
    touchLatencyRef.current = [];
    scrollFrameTimesRef.current = [];
    frameTimesRef.current = [];
    memoryMonitor.clearHistory();
  }, [memoryMonitor]);

  // Calculate overall performance score
  const getPerformanceScore = useCallback(() => {
    if (!metrics) return 100;
    
    let score = 100;
    
    // Touch latency score (0-25 points)
    const touchScore = Math.max(0, 25 - (metrics.touchLatency.averageLatency / touchLatencyThreshold) * 25);
    
    // Scroll performance score (0-25 points)
    const scrollScore = Math.max(0, (metrics.scrollPerformance.fps / 60) * 25);
    
    // Render performance score (0-25 points)
    const renderScore = Math.max(0, 25 - (metrics.renderPerformance.jankScore / 100) * 25);
    
    // Network score (0-25 points)
    const networkScore = metrics.networkPerformance.effectiveType === '4g' ? 25 :
                        metrics.networkPerformance.effectiveType === '3g' ? 15 :
                        metrics.networkPerformance.effectiveType === '2g' ? 5 : 0;
    
    score = touchScore + scrollScore + renderScore + networkScore;
    
    return Math.max(0, Math.min(100, score));
  }, [metrics, touchLatencyThreshold]);

  // Get optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    if (!metrics) return [];
    
    const suggestions: string[] = [];
    
    if (metrics.touchLatency.averageLatency > touchLatencyThreshold) {
      suggestions.push('Optimize touch event handlers with passive listeners');
      suggestions.push('Reduce JavaScript execution during touch events');
    }
    
    if (metrics.scrollPerformance.fps < fpsThreshold) {
      suggestions.push('Implement virtual scrolling for long lists');
      suggestions.push('Use CSS transforms instead of changing layout properties');
      suggestions.push('Debounce scroll event handlers');
    }
    
    if (metrics.renderPerformance.jankScore > jankThreshold) {
      suggestions.push('Break up long-running JavaScript tasks');
      suggestions.push('Use requestAnimationFrame for animations');
      suggestions.push('Optimize component re-renders with React.memo');
    }
    
    if (metrics.deviceMetrics.isLowEndDevice) {
      suggestions.push('Reduce bundle size for low-end devices');
      suggestions.push('Implement progressive loading');
      suggestions.push('Use lighter animations and effects');
    }
    
    if (metrics.networkPerformance.effectiveType === 'slow-2g' || metrics.networkPerformance.effectiveType === '2g') {
      suggestions.push('Implement offline-first architecture');
      suggestions.push('Optimize images and assets for slow connections');
      suggestions.push('Use service workers for caching');
    }
    
    return suggestions;
  }, [metrics, touchLatencyThreshold, fpsThreshold, jankThreshold]);

  return {
    metrics,
    alerts: alertsRef.current,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    getPerformanceScore,
    getOptimizationSuggestions
  };
};