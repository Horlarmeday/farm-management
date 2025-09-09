import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { FarmProvider, useFarmContext } from '@/contexts/FarmContext';
import Navbar from '@/components/layout/Navbar';
import FarmSelection from '@/components/farm/FarmSelection';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Finance from '@/pages/Finance';
import Livestock from '@/pages/Livestock';
import Poultry from '@/pages/Poultry';
import Fishery from '@/pages/Fishery';
import Assets from '@/pages/Assets';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import './App.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { selectedFarmId, setSelectedFarmId, isLoading: farmLoading } = useFarmContext();

  if (isLoading || farmLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
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
            selectedFarmId ? (
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
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
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
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FarmProvider>
          <AppContent />
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </FarmProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;