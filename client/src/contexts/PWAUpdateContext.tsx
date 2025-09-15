import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface PWAUpdateState {
  updateAvailable: boolean;
  isUpdating: boolean;
  error: string | null;
}

interface PWAUpdateContextType {
  state: PWAUpdateState;
  showUpdateNotification: () => void;
  applyUpdate: () => void;
  dismissUpdate: () => void;
  clearError: () => void;
}

const PWAUpdateContext = createContext<PWAUpdateContextType | undefined>(undefined);

interface PWAUpdateProviderProps {
  children: ReactNode;
}

export const PWAUpdateProvider: React.FC<PWAUpdateProviderProps> = ({ children }) => {
  const [state, setState] = useState<PWAUpdateState>({
    updateAvailable: false,
    isUpdating: false,
    error: null,
  });

  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateToastId, setUpdateToastId] = useState<string | number | null>(null);

  const showUpdateNotification = useCallback(() => {
    if (state.updateAvailable && !updateToastId) {
      const toastId = toast('New version available!', {
        description: 'A new version of the app is ready. Would you like to update now?',
        action: {
          label: 'Update Now',
          onClick: applyUpdate,
        },
        cancel: {
          label: 'Later',
          onClick: dismissUpdate,
        },
        duration: Infinity, // Keep toast until user interacts
        closeButton: false,
      });
      setUpdateToastId(toastId);
    }
  }, [state.updateAvailable, updateToastId]);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) {
      setState(prev => ({ ...prev, error: 'No update available to apply' }));
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      // Dismiss the update toast
      if (updateToastId) {
        toast.dismiss(updateToastId);
        setUpdateToastId(null);
      }

      // Show updating toast
      toast.loading('Applying update...', {
        description: 'Please wait while we update the app.',
      });

      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to get the new version
        window.location.reload();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply update';
      setState(prev => ({ 
        ...prev, 
        isUpdating: false, 
        error: errorMessage 
      }));
      
      toast.error('Update failed', {
        description: errorMessage,
      });
    }
  }, [waitingWorker, updateToastId]);

  const dismissUpdate = useCallback(() => {
    setState(prev => ({ ...prev, updateAvailable: false }));
    
    if (updateToastId) {
      toast.dismiss(updateToastId);
      setUpdateToastId(null);
    }

    // Store dismissal to avoid showing again for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  }, [updateToastId]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Method to be called when update is detected
  const handleUpdateFound = useCallback((worker: ServiceWorker) => {
    setWaitingWorker(worker);
    setState(prev => ({ ...prev, updateAvailable: true }));
    
    // Don't show notification if user dismissed it in this session
    if (!sessionStorage.getItem('pwa-update-dismissed')) {
      // Delay notification slightly to ensure UI is ready
      setTimeout(showUpdateNotification, 1000);
    }
  }, [showUpdateNotification]);

  // Expose handleUpdateFound for service worker registration
  React.useEffect(() => {
    (window as any).__pwaUpdateHandler = handleUpdateFound;
    
    return () => {
      delete (window as any).__pwaUpdateHandler;
    };
  }, [handleUpdateFound]);

  const contextValue: PWAUpdateContextType = {
    state,
    showUpdateNotification,
    applyUpdate,
    dismissUpdate,
    clearError,
  };

  return (
    <PWAUpdateContext.Provider value={contextValue}>
      {children}
    </PWAUpdateContext.Provider>
  );
};

export const usePWAUpdate = (): PWAUpdateContextType => {
  const context = useContext(PWAUpdateContext);
  if (context === undefined) {
    throw new Error('usePWAUpdate must be used within a PWAUpdateProvider');
  }
  return context;
};

export default PWAUpdateContext;