import { createRoot } from "react-dom/client";
import App from "./App";
import { PWAUpdateProvider } from "./contexts/PWAUpdateContext";
import { registerSW } from "./utils/serviceWorker";
import { toast } from "sonner";
import type { BeforeInstallPromptEvent } from "./types/pwa";
import "./index.css";

// Production-ready PWA Service Worker Registration
const initializeServiceWorker = async (): Promise<void> => {
  try {
    await registerSW({
      onSuccess: (registration) => {
        // Service worker registered successfully
        if (import.meta.env.DEV) {
          console.log('PWA: Service worker registered successfully');
        }
      },
      onUpdate: (registration) => {
        // Update available - handled by PWAUpdateContext
        if (import.meta.env.DEV) {
          console.log('PWA: Update available');
        }
      },
      onError: (error) => {
        // Handle registration errors gracefully
        if (import.meta.env.DEV) {
          console.error('PWA: Service worker registration failed:', error.message);
        }
        
        // Show user-friendly error only for critical issues
        if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('App update failed', {
            description: 'Please check your internet connection and try again.',
          });
        }
      },
    });
  } catch (error) {
    // Graceful fallback - app continues to work without PWA features
    if (import.meta.env.DEV) {
      console.warn('PWA: Failed to initialize service worker:', error);
    }
  }
};

// Initialize PWA installation features
const initializePWAInstallation = (): void => {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Show install banner after delay if not dismissed
    setTimeout(() => {
      if (!localStorage.getItem('install-banner-dismissed') && deferredPrompt) {
        const event = new CustomEvent('show-install-banner', { detail: deferredPrompt });
        window.dispatchEvent(event);
      }
    }, 3000);
  });
  
  window.addEventListener('appinstalled', () => {
    if (import.meta.env.DEV) {
      console.log('PWA: App was installed');
    }
    localStorage.setItem('pwa-installed', 'true');
    deferredPrompt = null;
    
    toast.success('App installed!', {
      description: 'You can now use the app offline and access it from your home screen.',
    });
  });
};

// Initialize all PWA features
const initializePWA = async (): Promise<void> => {
  // Initialize service worker
  await initializeServiceWorker();
  
  // Initialize installation features
  initializePWAInstallation();
  
  // Listen for network status changes
  window.addEventListener('online', () => {
    toast.success('Back online!', {
      description: 'Your internet connection has been restored.',
    });
  });
  
  window.addEventListener('offline', () => {
    toast.info('You\'re offline', {
      description: 'The app will continue to work with cached content.',
    });
  });
};

// Initialize PWA features
initializePWA().catch((error) => {
  if (import.meta.env.DEV) {
    console.error('PWA: Initialization failed:', error);
  }
});

// Render app with PWA context
createRoot(document.getElementById("root")!).render(
  <PWAUpdateProvider>
    <App />
  </PWAUpdateProvider>
);
