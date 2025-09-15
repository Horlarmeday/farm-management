import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { dbHelpers } from '../utils/database';

interface OfflineSyncState {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  syncError: string | null;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
}

export const useOfflineSync = () => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    syncInProgress: false,
    pendingChanges: 0,
    lastSyncTime: null,
    syncError: null
  });

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }));
  }, []);

  // Update pending changes count
  const updatePendingChanges = useCallback(async () => {
    try {
      const pendingRecords = await dbHelpers.getPendingRecords();
      const totalPending = pendingRecords.farms.length + 
                          pendingRecords.crops.length + 
                          pendingRecords.livestock.length;
      
      setState(prev => ({
        ...prev,
        pendingChanges: totalPending
      }));
    } catch (error) {
      console.error('Failed to get pending changes:', error);
    }
  }, []);

  // Handle sync result
  const handleSyncResult = useCallback((result: SyncResult) => {
    setState(prev => ({
      ...prev,
      syncInProgress: false,
      lastSyncTime: new Date(),
      syncError: result.success ? null : 'Sync failed'
    }));
    
    // Update pending changes after sync
    updatePendingChanges();
  }, [updatePendingChanges]);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    if (!state.isOnline || state.syncInProgress) {
      return;
    }

    setState(prev => ({
      ...prev,
      syncInProgress: true,
      syncError: null
    }));

    try {
      await syncService.triggerSync();
    } catch (error) {
      setState(prev => ({
        ...prev,
        syncInProgress: false,
        syncError: 'Sync failed'
      }));
    }
  }, [state.isOnline, state.syncInProgress]);

  // Clear sync error
  const clearSyncError = useCallback(() => {
    setState(prev => ({
      ...prev,
      syncError: null
    }));
  }, []);

  useEffect(() => {
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for sync results
    syncService.addSyncListener(handleSyncResult);

    // Initial pending changes count
    updatePendingChanges();

    // Set up periodic pending changes check
    const interval = setInterval(updatePendingChanges, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      syncService.removeSyncListener(handleSyncResult);
      clearInterval(interval);
    };
  }, [updateOnlineStatus, handleSyncResult, updatePendingChanges]);

  return {
    ...state,
    triggerSync,
    clearSyncError,
    refreshPendingChanges: updatePendingChanges
  };
};

// Hook for checking if database is available
export const useOfflineDatabase = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const available = await dbHelpers.isAvailable();
        setIsAvailable(available);
      } catch (error) {
        console.error('Database check failed:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDatabase();
  }, []);

  return { isAvailable, isLoading };
};

// Hook for managing offline data operations
export const useOfflineData = <T>(tableName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useOfflineSync();

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tableRef = (dbHelpers as any)[tableName];
      if (tableRef) {
        const records = await tableRef.toArray();
        setData(records);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Add new record
  const addRecord = useCallback(async (record: Omit<T, 'id'>) => {
    try {
      const tableRef = (dbHelpers as any)[tableName];
      if (tableRef) {
        await tableRef.add(record);
        await loadData(); // Refresh data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add record');
    }
  }, [tableName, loadData]);

  // Update record
  const updateRecord = useCallback(async (id: number, updates: Partial<T>) => {
    try {
      const tableRef = (dbHelpers as any)[tableName];
      if (tableRef) {
        await tableRef.update(id, updates);
        await loadData(); // Refresh data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    }
  }, [tableName, loadData]);

  // Delete record
  const deleteRecord = useCallback(async (id: number) => {
    try {
      const tableRef = (dbHelpers as any)[tableName];
      if (tableRef) {
        await tableRef.delete(id);
        await loadData(); // Refresh data
        
        // Add to sync queue for server deletion
        await dbHelpers.addToSyncQueue(tableName, id, 'delete', null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  }, [tableName, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    isOnline,
    addRecord,
    updateRecord,
    deleteRecord,
    refreshData: loadData
  };
};