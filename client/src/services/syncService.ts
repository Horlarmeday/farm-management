import { API_CONFIG, getApiUrl } from '../config/api.config';
import { db, dbHelpers } from '../utils/database';
import { TokenManager } from './api';

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
  }

  // Add sync listener
  addSyncListener(callback: (result: SyncResult) => void) {
    this.syncListeners.push(callback);
  }

  // Remove sync listener
  removeSyncListener(callback: (result: SyncResult) => void) {
    this.syncListeners = this.syncListeners.filter((listener) => listener !== callback);
  }

  // Notify sync listeners
  private notifySyncListeners(result: SyncResult) {
    this.syncListeners.forEach((listener) => listener(result));
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

  // Sync individual record with retry logic
  private async syncRecord(
    tableName: string,
    record: any,
  ): Promise<{ success: boolean; conflict?: boolean; serverData?: any }> {
    const maxRetries = API_CONFIG.REQUEST.RETRY_ATTEMPTS;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const endpoint = `/api/${tableName}`;
        const method = record.id ? 'PUT' : 'POST';
        const url = getApiUrl(record.id ? `${endpoint}/${record.id}` : endpoint);

        // Get fresh token for each attempt
        const token = TokenManager.getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(record),
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
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Sync record attempt ${attempt + 1} failed:`, lastError.message);

        // If this is the last attempt, return failure
        if (attempt === maxRetries) {
          console.error('Sync record failed after all retries:', lastError);
          return { success: false };
        }

        // Wait before retrying with exponential backoff
        const delay = Math.min(
          API_CONFIG.REQUEST.RETRY_DELAY * Math.pow(2, attempt),
          API_CONFIG.REQUEST.MAX_RETRY_DELAY,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return { success: false };
  }

  // Handle conflict resolution
  private async handleConflict(tableName: string, localRecord: any, serverRecord: any) {
    // For now, implement server-wins strategy
    // In a real app, you might want to show a UI for manual resolution
    const resolution: ConflictResolution = {
      strategy: 'server-wins',
      resolvedData: serverRecord,
    };

    await this.resolveConflict(tableName, localRecord.id!, resolution);
  }

  // Resolve conflict with chosen strategy
  private async resolveConflict(
    tableName: string,
    recordId: number,
    resolution: ConflictResolution,
  ) {
    const tableRef = (db as any)[tableName];

    if (!tableRef) return;

    switch (resolution.strategy) {
      case 'server-wins':
        await tableRef.update(recordId, {
          ...resolution.resolvedData,
          syncStatus: 'synced',
        });
        break;

      case 'client-wins':
        // Keep local data, mark as pending for re-sync
        await tableRef.update(recordId, {
          syncStatus: 'pending',
          lastModified: Date.now(),
        });
        break;

      case 'merge':
        // Implement merge logic based on your business rules
        await tableRef.update(recordId, {
          ...resolution.resolvedData,
          syncStatus: 'synced',
        });
        break;

      case 'manual':
        // Mark as conflict for manual resolution
        await tableRef.update(recordId, {
          syncStatus: 'conflict',
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
          retryCount: item.retryCount + 1,
        });
      }
    }
  }

  // Process individual sync queue item with enhanced error handling
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

    const fullUrl = getApiUrl(url);
    const token = TokenManager.getToken();

    if (!token) {
      throw new Error('No authentication token available for sync queue item');
    }

    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: item.operation !== 'delete' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();
