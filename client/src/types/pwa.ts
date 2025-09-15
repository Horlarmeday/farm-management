/**
 * PWA-related TypeScript type definitions
 */

// BeforeInstallPromptEvent interface for PWA installation
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend Window interface to include PWA-related properties
declare global {
  interface Window {
    __pwaUpdateHandler?: (worker: ServiceWorker) => void;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export {};