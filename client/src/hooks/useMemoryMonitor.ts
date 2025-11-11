import { useEffect, useRef, useCallback, useState } from 'react';

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // MB per second
}

interface MemoryAlert {
  type: 'high_usage' | 'rapid_increase' | 'memory_leak';
  message: string;
  severity: 'warning' | 'critical';
  metrics: MemoryMetrics;
  timestamp: number;
}

interface MemoryMonitorOptions {
  alertThreshold?: number; // MB increase to trigger alert
  sampleInterval?: number; // milliseconds between samples
  maxSamples?: number; // maximum number of samples to keep
  onAlert?: (alert: MemoryAlert) => void;
  enableAutoGC?: boolean; // attempt garbage collection on high usage
}

interface MemoryMonitorReturn {
  currentMetrics: MemoryMetrics | null;
  memoryHistory: MemoryMetrics[];
  alerts: MemoryAlert[];
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearHistory: () => void;
  getMemoryTrend: () => 'increasing' | 'decreasing' | 'stable';
  getAverageUsage: () => number;
  triggerGC: () => void;
}

/**
 * Hook for monitoring memory usage using performance.memory API
 * Tracks memory trends and alerts on significant increases (>50MB)
 */
export const useMemoryMonitor = ({
  alertThreshold = 50, // 50MB default
  sampleInterval = 5000, // 5 seconds default
  maxSamples = 100,
  onAlert,
  enableAutoGC = false
}: MemoryMonitorOptions = {}): MemoryMonitorReturn => {
  const [currentMetrics, setCurrentMetrics] = useState<MemoryMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const memoryHistoryRef = useRef<MemoryMetrics[]>([]);
  const alertsRef = useRef<MemoryAlert[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const baselineRef = useRef<number | null>(null);

  // Check if performance.memory is available
  const isMemoryAPIAvailable = useCallback(() => {
    return 'performance' in window && 'memory' in performance;
  }, []);

  // Get current memory metrics
  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    if (!isMemoryAPIAvailable()) {
      console.warn('performance.memory API not available');
      return null;
    }

    const memory = (performance as any).memory;
    const timestamp = Date.now();
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    
    // Calculate trend based on recent history
    const recentSamples = memoryHistoryRef.current.slice(-5);
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let changeRate = 0;
    
    if (recentSamples.length >= 2) {
      const oldestSample = recentSamples[0];
      const newestSample = recentSamples[recentSamples.length - 1];
      const timeDiff = (newestSample.timestamp - oldestSample.timestamp) / 1000; // seconds
      const usageDiff = (newestSample.usedJSHeapSize - oldestSample.usedJSHeapSize) / (1024 * 1024); // MB
      
      changeRate = timeDiff > 0 ? usageDiff / timeDiff : 0;
      
      if (Math.abs(changeRate) > 0.1) { // 0.1 MB/s threshold
        trend = changeRate > 0 ? 'increasing' : 'decreasing';
      }
    }

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp,
      trend,
      changeRate
    };
  }, [isMemoryAPIAvailable]);

  // Check for memory alerts
  const checkForAlerts = useCallback((metrics: MemoryMetrics) => {
    const usedMB = metrics.usedJSHeapSize / (1024 * 1024);
    const totalMB = metrics.totalJSHeapSize / (1024 * 1024);
    const limitMB = metrics.jsHeapSizeLimit / (1024 * 1024);
    
    // Set baseline on first measurement
    if (baselineRef.current === null) {
      baselineRef.current = usedMB;
      return;
    }
    
    const alerts: MemoryAlert[] = [];
    
    // Check for significant increase from baseline
    const increaseFromBaseline = usedMB - baselineRef.current;
    if (increaseFromBaseline > alertThreshold) {
      alerts.push({
        type: 'rapid_increase',
        message: `Memory usage increased by ${increaseFromBaseline.toFixed(1)}MB from baseline`,
        severity: increaseFromBaseline > alertThreshold * 2 ? 'critical' : 'warning',
        metrics,
        timestamp: Date.now()
      });
    }
    
    // Check for high memory usage (>80% of limit)
    const usagePercentage = (usedMB / limitMB) * 100;
    if (usagePercentage > 80) {
      alerts.push({
        type: 'high_usage',
        message: `High memory usage: ${usagePercentage.toFixed(1)}% of limit (${usedMB.toFixed(1)}MB/${limitMB.toFixed(1)}MB)`,
        severity: usagePercentage > 90 ? 'critical' : 'warning',
        metrics,
        timestamp: Date.now()
      });
    }
    
    // Check for potential memory leak (consistent increase over time)
    if (metrics.trend === 'increasing' && metrics.changeRate > 1) { // >1MB/s increase
      const recentSamples = memoryHistoryRef.current.slice(-10);
      const consistentIncrease = recentSamples.every(sample => sample.trend === 'increasing');
      
      if (consistentIncrease && recentSamples.length >= 5) {
        alerts.push({
          type: 'memory_leak',
          message: `Potential memory leak detected: consistent increase of ${metrics.changeRate.toFixed(2)}MB/s`,
          severity: 'critical',
          metrics,
          timestamp: Date.now()
        });
      }
    }
    
    // Store alerts and trigger callbacks
    alerts.forEach(alert => {
      alertsRef.current.push(alert);
      if (onAlert) {
        onAlert(alert);
      }
      
      // Auto garbage collection if enabled and critical alert
      if (enableAutoGC && alert.severity === 'critical' && 'gc' in window) {
        try {
          (window as any).gc();
          console.log('Triggered garbage collection due to critical memory alert');
        } catch (error) {
          console.warn('Failed to trigger garbage collection:', error);
        }
      }
    });
    
    // Keep only last 50 alerts
    if (alertsRef.current.length > 50) {
      alertsRef.current = alertsRef.current.slice(-50);
    }
  }, [alertThreshold, onAlert, enableAutoGC]);

  // Sample memory usage
  const sampleMemory = useCallback(() => {
    const metrics = getMemoryMetrics();
    if (!metrics) return;
    
    setCurrentMetrics(metrics);
    
    // Add to history
    memoryHistoryRef.current.push(metrics);
    if (memoryHistoryRef.current.length > maxSamples) {
      memoryHistoryRef.current.shift();
    }
    
    // Check for alerts
    checkForAlerts(metrics);
  }, [getMemoryMetrics, maxSamples, checkForAlerts]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!isMemoryAPIAvailable()) {
      console.warn('Cannot start memory monitoring: performance.memory API not available');
      return;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsMonitoring(true);
    sampleMemory(); // Initial sample
    
    intervalRef.current = setInterval(sampleMemory, sampleInterval);
  }, [isMemoryAPIAvailable, sampleMemory, sampleInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    memoryHistoryRef.current = [];
    alertsRef.current = [];
    baselineRef.current = null;
    setCurrentMetrics(null);
  }, []);

  // Get memory trend
  const getMemoryTrend = useCallback(() => {
    return currentMetrics?.trend || 'stable';
  }, [currentMetrics]);

  // Get average memory usage
  const getAverageUsage = useCallback(() => {
    const history = memoryHistoryRef.current;
    if (history.length === 0) return 0;
    
    const totalUsage = history.reduce((sum, metrics) => sum + metrics.usedJSHeapSize, 0);
    return (totalUsage / history.length) / (1024 * 1024); // Return in MB
  }, []);

  // Manually trigger garbage collection
  const triggerGC = useCallback(() => {
    if ('gc' in window) {
      try {
        (window as any).gc();
        console.log('Manually triggered garbage collection');
        // Sample memory after GC
        setTimeout(sampleMemory, 100);
      } catch (error) {
        console.warn('Failed to trigger garbage collection:', error);
      }
    } else {
      console.warn('Garbage collection not available (requires --expose-gc flag in development)');
    }
  }, [sampleMemory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentMetrics,
    memoryHistory: memoryHistoryRef.current,
    alerts: alertsRef.current,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearHistory,
    getMemoryTrend,
    getAverageUsage,
    triggerGC
  };
};

/**
 * Lightweight memory monitor for components that need basic memory tracking
 */
export const useLightweightMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  
  const checkMemory = useCallback(() => {
    if ('performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryUsage(memory.usedJSHeapSize / (1024 * 1024)); // MB
    }
  }, []);
  
  useEffect(() => {
    checkMemory();
    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [checkMemory]);
  
  return {
    memoryUsage,
    checkMemory
  };
};