import { db, dbHelpers, LocalFarm, LocalCrop, LocalLivestock } from '../utils/database';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
}

interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  resolvedData?: any;
}

class SyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncListeners: ((result: SyncResult) => void)[] = [];

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Register service worker for background sync
    this.registerBackgroundSync();
  }

  private async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Register for background sync
        await (registration as any).sync.register('background-sync');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Add sync listener
  addSyncListener(callback: (result: SyncResult) => void) {
    this.syncListeners.push(callback);
  }

  // Remove sync listener
  removeSyncListener(callback: (result: SyncResult) => void) {
    this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
  }

  // Notify sync listeners
  private notifySyncListeners(result: SyncResult) {
    this.syncListeners.forEach(listener => listener(result));
  }

  // Check if online
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Trigger sync manually
  async triggerSync(): Promise<SyncResult> {
    if (!this.isOnline || this.syncInProgress) {
      return { success: false, synced: 0, failed: 0, conflicts: 0 };
    }

    this.syncInProgress = true;
    
    try {
      const result = await this.performSync();
      this.notifySyncListeners(result);
      return result;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Perform the actual sync operation
  private async performSync(): Promise<SyncResult> {
    const result: SyncResult = { success: true, synced: 0, failed: 0, conflicts: 0 };

    try {
      // Get pending records
      const pendingRecords = await dbHelpers.getPendingRecords();
      
      // Sync farms
      const farmResults = await this.syncTable('farms', pendingRecords.farms);
      result.synced += farmResults.synced;
      result.failed += farmResults.failed;
      result.conflicts += farmResults.conflicts;

      // Sync crops
      const cropResults = await this.syncTable('crops', pendingRecords.crops);
      result.synced += cropResults.synced;
      result.failed += cropResults.failed;
      result.conflicts += cropResults.conflicts;

      // Sync livestock
      const livestockResults = await this.syncTable('livestock', pendingRecords.livestock);
      result.synced += livestockResults.synced;
      result.failed += livestockResults.failed;
      result.conflicts += livestockResults.conflicts;

      // Process sync queue
      await this.processSyncQueue();

    } catch (error) {
      console.error('Sync failed:', error);
      result.success = false;
    }

    return result;
  }

  // Sync a specific table
  private async syncTable(tableName: string, records: any[]): Promise<SyncResult> {
    const result: SyncResult = { success: true, synced: 0, failed: 0, conflicts: 0 };

    for (const record of records) {
      try {
        const syncResult = await this.syncRecord(tableName, record);
        
        if (syncResult.success) {
          result.synced++;
          await dbHelpers.markAsSynced(tableName, record.id!);
        } else if (syncResult.conflict) {
          result.conflicts++;
          await this.handleConflict(tableName, record, syncResult.serverData);
        } else {
          result.failed++;
        }
      } catch (error) {
        console.error(`Failed to sync ${tableName} record:`, error);
        result.failed++;
      }
    }

    return result;
  }

  // Sync individual record
  private async syncRecord(tableName: string, record: any): Promise<{ success: boolean; conflict?: boolean; serverData?: any }> {
    try {
      const endpoint = `/api/${tableName}`;
      const method = record.id ? 'PUT' : 'POST';
      const url = record.id ? `${endpoint}/${record.id}` : endpoint;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        },
        body: JSON.stringify(record)
      });

      if (response.status === 409) {
        // Conflict detected
        const serverData = await response.json();
        return { success: false, conflict: true, serverData };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Sync record failed:', error);
      return { success: false };
    }
  }

  // Handle conflict resolution
  private async handleConflict(tableName: string, localRecord: any, serverRecord: any) {
    // For now, implement server-wins strategy
    // In a real app, you might want to show a UI for manual resolution
    const resolution: ConflictResolution = {
      strategy: 'server-wins',
      resolvedData: serverRecord
    };

    await this.resolveConflict(tableName, localRecord.id!, resolution);
  }

  // Resolve conflict with chosen strategy
  private async resolveConflict(tableName: string, recordId: number, resolution: ConflictResolution) {
    const tableRef = (db as any)[tableName];
    
    if (!tableRef) return;

    switch (resolution.strategy) {
      case 'server-wins':
        await tableRef.update(recordId, {
          ...resolution.resolvedData,
          syncStatus: 'synced'
        });
        break;
        
      case 'client-wins':
        // Keep local data, mark as pending for re-sync
        await tableRef.update(recordId, {
          syncStatus: 'pending',
          lastModified: Date.now()
        });
        break;
        
      case 'merge':
        // Implement merge logic based on your business rules
        await tableRef.update(recordId, {
          ...resolution.resolvedData,
          syncStatus: 'synced'
        });
        break;
        
      case 'manual':
        // Mark as conflict for manual resolution
        await tableRef.update(recordId, {
          syncStatus: 'conflict'
        });
        break;
    }
  }

  // Process sync queue for operations that need to be sent to server
  private async processSyncQueue() {
    const queueItems = await dbHelpers.getPendingSyncItems();
    
    for (const item of queueItems) {
      try {
        await this.processSyncQueueItem(item);
        await dbHelpers.clearSyncItem(item.id!);
      } catch (error) {
        console.error('Failed to process sync queue item:', error);
        // Increment retry count
        await db.syncQueue.update(item.id!, {
          retryCount: item.retryCount + 1
        });
      }
    }
  }

  // Process individual sync queue item
  private async processSyncQueueItem(item: any) {
    const endpoint = `/api/${item.table}`;
    let url = endpoint;
    let method = 'POST';

    switch (item.operation) {
      case 'create':
        method = 'POST';
        break;
      case 'update':
        method = 'PUT';
        url = `${endpoint}/${item.recordId}`;
        break;
      case 'delete':
        method = 'DELETE';
        url = `${endpoint}/${item.recordId}`;
        break;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: item.operation !== 'delete' ? JSON.stringify(item.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();