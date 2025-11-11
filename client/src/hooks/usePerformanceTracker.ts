import { useLayoutEffect, useRef, useCallback, useMemo } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  memoryUsage?: number;
}

interface PerformanceTrackerOptions {
  componentName: string;
  enableMemoryTracking?: boolean;
  sampleRate?: number; // 0-1, percentage of renders to track
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceTrackerReturn {
  metrics: PerformanceMetrics | null;
  startMeasurement: () => void;
  endMeasurement: () => void;
  getAverageRenderTime: () => number;
  resetMetrics: () => void;
}

/**
 * High-performance hook for tracking component render times using useLayoutEffect
 * Designed to have <1ms overhead per measurement
 */
export const usePerformanceTracker = ({
  componentName,
  enableMemoryTracking = false,
  sampleRate = 1.0,
  onMetrics
}: PerformanceTrackerOptions): PerformanceTrackerReturn => {
  const startTimeRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics | null>(null);
  const renderTimesRef = useRef<number[]>([]);
  const shouldTrackRef = useRef<boolean>(true);

  // Determine if we should track this render based on sample rate
  const shouldTrack = useMemo(() => {
    if (sampleRate >= 1.0) return true;
    return Math.random() < sampleRate;
  }, [sampleRate]);

  // Start measurement - called at the beginning of render
  const startMeasurement = useCallback(() => {
    if (!shouldTrack) return;
    
    // Use performance.now() for high-precision timing
    startTimeRef.current = performance.now();
    shouldTrackRef.current = true;
  }, [shouldTrack]);

  // End measurement - called after render completes
  const endMeasurement = useCallback(() => {
    if (!shouldTrackRef.current || startTimeRef.current === 0) return;
    
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    // Get memory usage if enabled and available
    let memoryUsage: number | undefined;
    if (enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize;
    }
    
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
      memoryUsage
    };
    
    metricsRef.current = metrics;
    
    // Store render time for average calculation (keep last 100 measurements)
    renderTimesRef.current.push(renderTime);
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift();
    }
    
    // Call optional callback
    if (onMetrics) {
      onMetrics(metrics);
    }
    
    // Reset for next measurement
    startTimeRef.current = 0;
    shouldTrackRef.current = false;
  }, [componentName, enableMemoryTracking, onMetrics]);

  // Calculate average render time
  const getAverageRenderTime = useCallback(() => {
    const times = renderTimesRef.current;
    if (times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }, []);

  // Reset all metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = null;
    renderTimesRef.current = [];
    startTimeRef.current = 0;
    shouldTrackRef.current = false;
  }, []);

  // Use useLayoutEffect to measure render performance
  // This runs synchronously after all DOM mutations but before paint
  useLayoutEffect(() => {
    // End measurement after render is complete
    endMeasurement();
  });

  // Start measurement before render (in the render phase)
  if (shouldTrack && startTimeRef.current === 0) {
    startMeasurement();
  }

  return {
    metrics: metricsRef.current,
    startMeasurement,
    endMeasurement,
    getAverageRenderTime,
    resetMetrics
  };
};

/**
 * Lightweight performance tracker for components that need minimal overhead
 * Only tracks render count and basic timing
 */
export const useLightweightPerformanceTracker = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  
  useLayoutEffect(() => {
    renderCountRef.current += 1;
    lastRenderTimeRef.current = performance.now();
  });
  
  return {
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
    componentName
  };
};

/**
 * Hook for tracking performance across multiple components
 * Aggregates metrics and provides global performance insights
 */
export const useGlobalPerformanceTracker = () => {
  const metricsRef = useRef<Map<string, PerformanceMetrics[]>>(new Map());
  
  const addMetrics = useCallback((metrics: PerformanceMetrics) => {
    const componentMetrics = metricsRef.current.get(metrics.componentName) || [];
    componentMetrics.push(metrics);
    
    // Keep only last 50 measurements per component
    if (componentMetrics.length > 50) {
      componentMetrics.shift();
    }
    
    metricsRef.current.set(metrics.componentName, componentMetrics);
  }, []);
  
  const getComponentMetrics = useCallback((componentName: string) => {
    return metricsRef.current.get(componentName) || [];
  }, []);
  
  const getAllMetrics = useCallback(() => {
    const allMetrics: Record<string, PerformanceMetrics[]> = {};
    metricsRef.current.forEach((metrics, componentName) => {
      allMetrics[componentName] = metrics;
    });
    return allMetrics;
  }, []);
  
  const getSlowComponents = useCallback((threshold: number = 16) => {
    const slowComponents: string[] = [];
    
    metricsRef.current.forEach((metrics, componentName) => {
      const avgRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
      if (avgRenderTime > threshold) {
        slowComponents.push(componentName);
      }
    });
    
    return slowComponents;
  }, []);
  
  const clearMetrics = useCallback(() => {
    metricsRef.current.clear();
  }, []);
  
  return {
    addMetrics,
    getComponentMetrics,
    getAllMetrics,
    getSlowComponents,
    clearMetrics
  };
};