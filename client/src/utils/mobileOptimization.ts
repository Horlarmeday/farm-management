// Mobile detection and optimization utilities

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
}

// Device detection
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || (width >= 768 && width < 1024);
  const isDesktop = !isMobile && !isTablet;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  
  let screenSize: DeviceInfo['screenSize'] = 'xs';
  if (width >= 1536) screenSize = '2xl';
  else if (width >= 1280) screenSize = 'xl';
  else if (width >= 1024) screenSize = 'lg';
  else if (width >= 768) screenSize = 'md';
  else if (width >= 640) screenSize = 'sm';
  
  const orientation = height > width ? 'portrait' : 'landscape';
  const pixelRatio = window.devicePixelRatio || 1;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isIOS,
    isAndroid,
    screenSize,
    orientation,
    pixelRatio
  };
};

// Performance optimization
export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private observers: Map<string, IntersectionObserver> = new Map();
  private rafCallbacks: Set<() => void> = new Set();
  private isRafScheduled = false;
  
  static getInstance(): MobilePerformanceOptimizer {
    if (!this.instance) {
      this.instance = new MobilePerformanceOptimizer();
    }
    return this.instance;
  }
  
  // Lazy loading for images
  setupLazyLoading(selector: string = 'img[data-src]'): void {
    if (this.observers.has('lazy-images')) {
      this.observers.get('lazy-images')?.disconnect();
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    
    document.querySelectorAll(selector).forEach((img) => {
      observer.observe(img);
    });
    
    this.observers.set('lazy-images', observer);
  }
  
  // Throttled scroll handling
  onScroll(callback: () => void): () => void {
    this.rafCallbacks.add(callback);
    
    if (!this.isRafScheduled) {
      this.scheduleRaf();
    }
    
    return () => {
      this.rafCallbacks.delete(callback);
    };
  }
  
  private scheduleRaf(): void {
    this.isRafScheduled = true;
    requestAnimationFrame(() => {
      this.rafCallbacks.forEach(callback => callback());
      this.isRafScheduled = false;
      
      if (this.rafCallbacks.size > 0) {
        this.scheduleRaf();
      }
    });
  }
  
  // Memory management
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.rafCallbacks.clear();
  }
}

// Touch feedback utilities
export const addTouchFeedback = (element: HTMLElement): void => {
  let touchStartTime = 0;
  
  const handleTouchStart = () => {
    touchStartTime = Date.now();
    element.style.transform = 'scale(0.98)';
    element.style.transition = 'transform 0.1s ease-out';
  };
  
  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime;
    const delay = Math.max(0, 100 - touchDuration);
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, delay);
  };
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
};

// Haptic feedback
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  }
};

// Safe area utilities for iOS
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10)
  };
};

// Viewport utilities
export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    availableHeight: window.innerHeight - getSafeAreaInsets().top - getSafeAreaInsets().bottom
  };
};

// Network-aware loading
export const getNetworkInfo = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false
    };
  }
  
  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false
  };
};

// Adaptive loading based on network
export const shouldLoadHighQuality = (): boolean => {
  const network = getNetworkInfo();
  const device = getDeviceInfo();
  
  // Don't load high quality on slow networks or save data mode
  if (network.saveData || network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
    return false;
  }
  
  // Load high quality on desktop or fast connections
  if (device.isDesktop || network.effectiveType === '4g') {
    return true;
  }
  
  // Default to medium quality
  return false;
};

// Image optimization
export const getOptimizedImageUrl = (baseUrl: string, width: number, quality: number = 80): string => {
  const device = getDeviceInfo();
  const network = getNetworkInfo();
  
  // Adjust quality based on network and device
  let adjustedQuality = quality;
  if (network.saveData) {
    adjustedQuality = Math.min(quality, 60);
  } else if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
    adjustedQuality = Math.min(quality, 70);
  }
  
  // Adjust width for high DPI displays
  const adjustedWidth = Math.round(width * device.pixelRatio);
  
  // Return optimized URL (this would depend on your image service)
  return `${baseUrl}?w=${adjustedWidth}&q=${adjustedQuality}&f=webp`;
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling utility
export class VirtualScrollManager {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop: number = 0;
  private onRender: (startIndex: number, endIndex: number) => void;
  
  constructor(
    container: HTMLElement,
    itemHeight: number,
    totalCount: number,
    onRender: (startIndex: number, endIndex: number) => void
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalCount = totalCount;
    this.onRender = onRender;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer
    
    this.setupScrollListener();
    this.render();
  }
  
  private setupScrollListener(): void {
    const throttledScroll = throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    }, 16); // ~60fps
    
    this.container.addEventListener('scroll', throttledScroll, { passive: true });
  }
  
  private render(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.totalCount);
    
    this.onRender(startIndex, endIndex);
  }
  
  updateTotalCount(count: number): void {
    this.totalCount = count;
    this.render();
  }
  
  scrollToIndex(index: number): void {
    const scrollTop = index * this.itemHeight;
    this.container.scrollTo({ top: scrollTop, behavior: 'smooth' });
  }
}