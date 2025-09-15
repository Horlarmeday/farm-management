import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { 
    isOnline, 
    syncInProgress, 
    pendingChanges, 
    lastSyncTime, 
    syncError,
    triggerSync,
    clearSyncError
  } = useOfflineSync();

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500 bg-red-50';
    if (syncError) return 'text-orange-500 bg-orange-50';
    if (pendingChanges > 0) return 'text-yellow-500 bg-yellow-50';
    return 'text-green-500 bg-green-50';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (syncInProgress) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (syncError) return <AlertCircle className="w-4 h-4" />;
    if (pendingChanges > 0) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncInProgress) return 'Syncing...';
    if (syncError) return 'Sync Error';
    if (pendingChanges > 0) return `${pendingChanges} pending`;
    return 'Synced';
  };

  const formatLastSyncTime = (time: Date | null) => {
    if (!time) return 'Never';
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {isOnline && !syncInProgress && (
          <button
            onClick={triggerSync}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Sync now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-medium ${
            syncError ? 'text-red-600' : 
            pendingChanges > 0 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {getStatusText()}
          </span>
        </div>
        
        {pendingChanges > 0 && (
          <div className="flex justify-between">
            <span>Pending changes:</span>
            <span className="font-medium text-yellow-600">{pendingChanges}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Last sync:</span>
          <span className="font-medium">{formatLastSyncTime(lastSyncTime)}</span>
        </div>
        
        {syncInProgress && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Synchronizing data...</span>
          </div>
        )}
        
        {syncError && (
          <div className="flex items-center justify-between text-red-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Sync failed</span>
            </div>
            <button
              onClick={clearSyncError}
              className="text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for header/navbar
export const CompactOfflineIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOnline, syncInProgress, pendingChanges } = useOfflineSync();

  if (isOnline && !syncInProgress && pendingChanges === 0) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {!isOnline && (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="w-4 h-4" />
          <span className="hidden sm:inline">Offline</span>
        </div>
      )}
      
      {syncInProgress && (
        <div className="flex items-center gap-1 text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Syncing</span>
        </div>
      )}
      
      {isOnline && !syncInProgress && pendingChanges > 0 && (
        <div className="flex items-center gap-1 text-yellow-600">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">{pendingChanges} pending</span>
        </div>
      )}
    </div>
  );
};

// Toast notification for sync events
export const SyncToast: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <RefreshCw className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg ${getBgColor()} max-w-sm z-50`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <span className="text-sm font-medium text-gray-900">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};