import { useState, useEffect } from 'react';

/**
 * Singleton pattern for managing media query listeners
 * Reduces useEffect usage by sharing listeners across components
 */
class MediaQueryManager {
  private static instance: MediaQueryManager;
  private queries = new Map<string, {
    mediaQuery: MediaQueryList;
    listeners: Set<(matches: boolean) => void>;
    handler: (e: MediaQueryListEvent) => void;
  }>();
  
  static getInstance() {
    if (!MediaQueryManager.instance) {
      MediaQueryManager.instance = new MediaQueryManager();
    }
    return MediaQueryManager.instance;
  }
  
  subscribe(query: string, callback: (matches: boolean) => void) {
    let queryData = this.queries.get(query);
    
    if (!queryData) {
      const mediaQuery = window.matchMedia(query);
      
      // Create handler that will be reused
      const handler = (e: MediaQueryListEvent) => {
        const currentQueryData = this.queries.get(query);
        if (currentQueryData) {
          currentQueryData.listeners.forEach(listener => listener(e.matches));
        }
      };
      
      queryData = {
        mediaQuery,
        listeners: new Set(),
        handler
      };
      
      mediaQuery.addEventListener('change', handler);
      this.queries.set(query, queryData);
    }
    
    // Add the callback to listeners
    queryData.listeners.add(callback);
    
    // Call immediately with current state
    callback(queryData.mediaQuery.matches);
    
    return {
      cleanup: () => {
        const currentQueryData = this.queries.get(query);
        if (currentQueryData) {
          currentQueryData.listeners.delete(callback);
          if (currentQueryData.listeners.size === 0) {
            currentQueryData.mediaQuery.removeEventListener('change', currentQueryData.handler);
            this.queries.delete(query);
          }
        }
      }
    };
  }
}

/**
 * Optimized useMediaQuery hook using singleton pattern
 * Reduces useEffect usage by sharing media query listeners
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    // Initialize with current media query state
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  
  useEffect(() => {
    const manager = MediaQueryManager.getInstance();
    const { cleanup } = manager.subscribe(query, setMatches);
    
    return cleanup;
  }, [query]);
  
  return matches;
};