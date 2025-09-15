/**
 * Production-ready PWA Service Worker utilities
 * Handles registration, updates, and error management
 */

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Register the service worker with production-ready configuration
   */
  public async register(config: ServiceWorkerConfig = {}): Promise<void> {
    this.config = config;

    // Check if service workers are supported
    if (!this.isServiceWorkerSupported()) {
      const error = new Error('Service workers are not supported in this browser');
      this.handleError(error);
      return;
    }

    try {
      // Wait for the page to load before registering
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          window.addEventListener('load', resolve, { once: true });
        });
      }

      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      // Set up event listeners for updates
      this.setupUpdateListeners();

      // Check for immediate updates
      await this.checkForUpdates();

      // Call success callback
      if (this.config.onSuccess) {
        this.config.onSuccess(this.registration);
      }

      // Log successful registration (only in development)
      if (import.meta.env.DEV) {
        console.log('Service Worker registered successfully:', this.registration);
      }
    } catch (error) {
      const swError = error instanceof Error ? error : new Error('Service Worker registration failed');
      this.handleError(swError);
    }
  }

  /**
   * Check if service workers are supported
   */
  private isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Set up event listeners for service worker updates
   */
  private setupUpdateListeners(): void {
    if (!this.registration) return;

    // Listen for new service worker installations
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available
          this.handleUpdateAvailable(newWorker);
        }
      });
    });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event);
    });

    // Listen for controller changes (when update is applied)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // The new service worker has taken control
      if (import.meta.env.DEV) {
        console.log('Service Worker controller changed - new version active');
      }
    });
  }

  /**
   * Handle when a service worker update is available
   */
  private handleUpdateAvailable(worker: ServiceWorker): void {
    try {
      // Call the update handler from the PWA context
      const updateHandler = (window as any).__pwaUpdateHandler;
      if (updateHandler && typeof updateHandler === 'function') {
        updateHandler(worker);
      }

      // Call config callback
      if (this.config.onUpdate && this.registration) {
        this.config.onUpdate(this.registration);
      }
    } catch (error) {
      const updateError = error instanceof Error ? error : new Error('Failed to handle update');
      this.handleError(updateError);
    }
  }

  /**
   * Handle messages from the service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    if (data && typeof data === 'object') {
      switch (data.type) {
        case 'SW_UPDATE_READY':
          // Service worker is ready to update
          if (import.meta.env.DEV) {
            console.log('Service Worker update ready');
          }
          break;
        case 'SW_OFFLINE':
          // App is running offline
          this.dispatchCustomEvent('sw-offline');
          break;
        case 'SW_ONLINE':
          // App is back online
          this.dispatchCustomEvent('sw-online');
          break;
        default:
          if (import.meta.env.DEV) {
            console.log('Unknown service worker message:', data);
          }
      }
    }
  }

  /**
   * Check for service worker updates manually
   */
  public async checkForUpdates(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      await this.registration.update();
    } catch (error) {
      const updateError = error instanceof Error ? error : new Error('Failed to check for updates');
      this.handleError(updateError);
    }
  }

  /**
   * Unregister the service worker
   */
  public async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      return result;
    } catch (error) {
      const unregisterError = error instanceof Error ? error : new Error('Failed to unregister service worker');
      this.handleError(unregisterError);
      return false;
    }
  }

  /**
   * Get the current registration
   */
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Handle errors with proper logging and callbacks
   */
  private handleError(error: Error): void {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('Service Worker Error:', error);
    }

    // Call error callback
    if (this.config.onError) {
      this.config.onError(error);
    }

    // Dispatch custom event for error handling
    this.dispatchCustomEvent('sw-error', { error: error.message });
  }

  /**
   * Dispatch custom events for app-wide handling
   */
  private dispatchCustomEvent(type: string, detail?: any): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
  }
}

// Export singleton instance
export const serviceWorkerManager = ServiceWorkerManager.getInstance();

// Export convenience functions
export const registerSW = (config?: ServiceWorkerConfig) => {
  return serviceWorkerManager.register(config);
};

export const unregisterSW = () => {
  return serviceWorkerManager.unregister();
};

export const checkForSWUpdates = () => {
  return serviceWorkerManager.checkForUpdates();
};

export default serviceWorkerManager;