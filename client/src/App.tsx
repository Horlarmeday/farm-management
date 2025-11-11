import FarmSelection from '@/components/farm/FarmSelection';
import Sidebar from '@/components/layout/Sidebar';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { FarmProvider, useFarmContext } from '@/contexts/FarmContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useResponsive } from '@/hooks/useResponsive';
import { syncService } from '@/services/syncService';
import { db } from '@/utils/database';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
// Lazy load all page components for code splitting
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/auth/ForgotPassword'));
const PasswordReset = React.lazy(() => import('@/pages/auth/PasswordReset'));
const EmailVerification = React.lazy(() => import('@/pages/auth/EmailVerification'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const Finance = React.lazy(() => import('@/pages/Finance'));
const Livestock = React.lazy(() => import('@/pages/Livestock'));
const Poultry = React.lazy(() => import('@/pages/Poultry'));
const Fishery = React.lazy(() => import('@/pages/Fishery'));
const Assets = React.lazy(() => import('@/pages/Assets'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const RealTimeDashboard = React.lazy(() => import('@/components/dashboard/RealTimeDashboard'));
const PredictiveAnalyticsDashboard = React.lazy(
  () => import('@/components/analytics/PredictiveAnalyticsDashboard'),
);
const IoTDashboard = React.lazy(() =>
  import('@/pages/IoTDashboard').then((module) => ({ default: module.IoTDashboard })),
);
const NotificationPreferences = React.lazy(
  () => import('@/components/notifications/NotificationPreferences'),
);

// Create a query client with offline-first configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const {
    selectedFarmId,
    setSelectedFarmId,
    isLoading: farmLoading,
    isValidFarmId,
  } = useFarmContext();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize database and offline features
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await db.open();
        console.log('Database initialized successfully');

        // Initialize sync service (constructor handles initialization)
        console.log('Sync service initialized successfully');

        setIsAppInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        setIsAppInitialized(true); // Allow app to continue even if some features fail
      }
    };

    initializeApp();
  }, []);

  if (isLoading || farmLoading || !isAppInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {initError ? `Warning: ${initError}` : 'Initializing Farm Manager...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 no-horizontal-overflow">
        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }
                >
                  <Login />
                </React.Suspense>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !user ? (
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }
                >
                  <Register />
                </React.Suspense>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              !user ? (
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }
                >
                  <ForgotPassword />
                </React.Suspense>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              !user ? (
                <React.Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }
                >
                  <PasswordReset />
                </React.Suspense>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/verify-email/:token"
            element={
              <React.Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
              >
                <EmailVerification />
              </React.Suspense>
            }
          />
          <Route
            path="/select-farm"
            element={
              user ? (
                <FarmSelection onFarmSelect={setSelectedFarmId} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {user ? (
            selectedFarmId && isValidFarmId ? (
              <Route path="/*" element={<AuthenticatedApp />} />
            ) : (
              <Route path="/*" element={<Navigate to="/select-farm" replace />} />
            )
          ) : (
            <Route path="/*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { selectedFarmId } = useFarmContext();
  const { isMobile } = useResponsive();
  const { isOnline: syncIsOnline } = useOfflineSync();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle navigation for mobile layout
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      // Trigger sync if online
      if (syncIsOnline) {
        await syncService.triggerSync();
      }

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries();

      // Trigger re-render
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Refresh failed:', error);
      throw error;
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <MobileLayout
        currentPath={window.location.pathname}
        onNavigate={handleNavigate}
        onRefresh={handleRefresh}
        showInstallPrompt={false}
      >
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Routes key={refreshTrigger}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/real-time"
              element={<RealTimeDashboard farmId={selectedFarmId || ''} />}
            />
            <Route path="/analytics" element={<PredictiveAnalyticsDashboard />} />
            <Route path="/iot-sensors" element={<IoTDashboard />} />
            <Route path="/notifications" element={<NotificationPreferences />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/livestock" element={<Livestock />} />
            <Route path="/poultry" element={<Poultry />} />
            <Route path="/fishery" element={<Fishery />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </MobileLayout>
    );
  }

  // Desktop layout
  return (
    <>
      {/* Offline indicator */}
      {!syncIsOnline && (
        <div className="fixed top-4 right-4 z-50">
          <OfflineIndicator />
        </div>
      )}

      <Sidebar />

      {/* Main Content Area */}
      <div className="min-h-screen main-content-offset">
        <main className="py-6 px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <Routes key={refreshTrigger}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/real-time"
                  element={<RealTimeDashboard farmId={selectedFarmId || ''} />}
                />
                <Route path="/analytics" element={<PredictiveAnalyticsDashboard />} />
                <Route path="/iot-sensors" element={<IoTDashboard />} />
                <Route path="/notifications" element={<NotificationPreferences />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/livestock" element={<Livestock />} />
                <Route path="/poultry" element={<Poultry />} />
                <Route path="/fishery" element={<Fishery />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </div>
        </main>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FarmProvider>
          <WebSocketProvider>
            <AppContent />
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

            <ReactQueryDevtools initialIsOpen={false} />
          </WebSocketProvider>
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
