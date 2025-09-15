import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: string | null;
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    platform: null
  });
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Check if app is running in standalone mode
  const checkStandaloneMode = useCallback(() => {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    return isStandalone;
  }, []);

  // Detect platform
  const detectPlatform = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) return 'android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/windows/.test(userAgent)) return 'windows';
    if (/macintosh|mac os x/.test(userAgent)) return 'macos';
    if (/linux/.test(userAgent)) return 'linux';
    
    return 'unknown';
  }, []);

  // Check if app is already installed
  const checkInstallStatus = useCallback(() => {
    // Check if running in standalone mode
    const isStandalone = checkStandaloneMode();
    
    // Check if installed via other means (this is a heuristic)
    const isInstalled = isStandalone || 
                       localStorage.getItem('pwa-installed') === 'true';
    
    return { isStandalone, isInstalled };
  }, [checkStandaloneMode]);

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;
    setInstallPrompt(promptEvent);
    
    setInstallState(prev => ({
      ...prev,
      isInstallable: true
    }));

    // Show install banner after a delay (if not dismissed before)
    setTimeout(() => {
      if (!localStorage.getItem('install-banner-dismissed')) {
        setShowInstallBanner(true);
      }
    }, 3000);
  }, []);

  // Handle app installed event
  const handleAppInstalled = useCallback(() => {
    setInstallPrompt(null);
    setShowInstallBanner(false);
    localStorage.setItem('pwa-installed', 'true');
    
    setInstallState(prev => ({
      ...prev,
      isInstallable: false,
      isInstalled: true
    }));
  }, []);

  // Trigger install prompt
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false);
        return true;
      } else {
        // User dismissed the prompt
        setShowInstallBanner(false);
        localStorage.setItem('install-banner-dismissed', 'true');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }, [installPrompt]);

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem('install-banner-dismissed', 'true');
  }, []);

  // Reset install banner dismissal (for testing or re-showing)
  const resetInstallBanner = useCallback(() => {
    localStorage.removeItem('install-banner-dismissed');
    if (installState.isInstallable) {
      setShowInstallBanner(true);
    }
  }, [installState.isInstallable]);

  // Get install instructions for different platforms
  const getInstallInstructions = useCallback(() => {
    const platform = detectPlatform();
    
    switch (platform) {
      case 'ios':
        return {
          title: 'Install Farm Management App',
          steps: [
            'Tap the Share button in Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" to install the app'
          ],
          icon: '📱'
        };
      
      case 'android':
        return {
          title: 'Install Farm Management App',
          steps: [
            'Tap the menu button (⋮) in Chrome',
            'Select "Add to Home screen"',
            'Tap "Add" to install the app'
          ],
          icon: '📱'
        };
      
      default:
        return {
          title: 'Install Farm Management App',
          steps: [
            'Click the install button in your browser',
            'Follow the prompts to add to your desktop',
            'Launch the app from your desktop or start menu'
          ],
          icon: '💻'
        };
    }
  }, [detectPlatform]);

  // Check if platform supports PWA installation
  const isPWASupported = useCallback(() => {
    const platform = detectPlatform();
    
    // iOS Safari supports PWA but doesn't fire beforeinstallprompt
    if (platform === 'ios') {
      return /safari/.test(navigator.userAgent.toLowerCase()) && 
             !/crios|fxios/.test(navigator.userAgent.toLowerCase());
    }
    
    // Android Chrome and other modern browsers
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }, [detectPlatform]);

  useEffect(() => {
    const platform = detectPlatform();
    const { isStandalone, isInstalled } = checkInstallStatus();
    
    setInstallState({
      isInstallable: false, // Will be set to true when beforeinstallprompt fires
      isInstalled,
      isStandalone,
      platform
    });

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [detectPlatform, checkInstallStatus, handleBeforeInstallPrompt, handleAppInstalled]);

  return {
    ...installState,
    showInstallBanner,
    promptInstall,
    dismissInstallBanner,
    resetInstallBanner,
    getInstallInstructions,
    isPWASupported: isPWASupported()
  };
};