import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { MobileLayout } from './mobile/MobileLayout';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallBanner } from './PWAInstallBanner';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useResponsive } from '../hooks/useResponsive';
import { syncService } from '../services/syncService';
import { db } from '../utils/database';
import { getNetworkInfo } from '../utils/mobileOptimization';
// ErrorBoundary and LoadingSpinner are defined below in this file

// Import your existing pages
import Dashboard from '../pages/Dashboard';
import Livestock from '../pages/Livestock';
import Settings from '../pages/Settings';

// Create QueryClient with offline-first configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Handle retries through sync service
    },
  },
});

// Main App component with all integrations
export const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize app services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await db.open();
        console.log('Database initialized successfully');

        // Initialize sync service
        const syncServiceInstance = syncService;
        // Sync service is initialized in constructor
        console.log('Sync service ready');

        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration);
          } catch (error) {
            console.warn('Service Worker registration failed:', error);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initializeApp();
  }, []);

  // Show loading screen during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {initError ? `Error: ${initError}` : 'Initializing Farm Manager...'}
          </p>
          {initError && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
        
        {/* Global components */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
            },
          }}
        />

      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// App content with routing and layout
const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { isOnline, syncInProgress, pendingChanges } = useOfflineSync();
  const { showInstallBanner, isStandalone } = usePWAInstall();
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      // Trigger sync if online
        if (isOnline) {
          const syncServiceInstance = syncService;
          await syncServiceInstance.triggerSync();
        }
      
      // Invalidate queries to refetch data
      await queryClient.invalidateQueries();
      
      // Trigger re-render
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Refresh failed:', error);
      throw error;
    }
  };

  // Mobile layout for mobile devices
  if (isMobile) {
    return (
      <MobileLayout
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onRefresh={handleRefresh}
        showInstallPrompt={showInstallBanner && !isStandalone}
      >
        <AppRoutes key={refreshTrigger} />
      </MobileLayout>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Install Banner for desktop */}
      {showInstallBanner && !isStandalone && (
        <PWAInstallBanner variant="banner" className="m-4" />
      )}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-50">
          <OfflineIndicator />
        </div>
      )}
      
      {/* Main content */}
      <div className="flex">
        {/* Sidebar navigation would go here for desktop */}
        <div className="flex-1">
          <main className="p-6">
            <AppRoutes key={refreshTrigger} />
          </main>
        </div>
      </div>
    </div>
  );
};

// Application routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/livestock" element={<Livestock />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// 404 Not Found component
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

// Error Boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// Export the main App component
export default App;