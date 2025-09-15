import Dexie, { Table } from 'dexie';
import type { Farm } from '@shared/types';
import type { Animal } from '@/types/livestock.types';

// Local database interfaces extending shared types for offline storage
export interface LocalFarm extends Omit<Farm, 'id'> {
  id?: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
}

export interface LocalCrop {
  id?: number;
  farmId: number;
  name: string;
  variety: string;
  plantingDate: Date;
  harvestDate?: Date;
  status: 'planted' | 'growing' | 'harvested';
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
}

export interface LocalLivestock extends Omit<Animal, 'id' | 'location' | 'managedBy' | 'healthRecords' | 'breedingRecords' | 'productionLogs' | 'sales' | 'feedingLogs' | 'weightRecords' | 'farmId'> {
  id?: number;
  farmId: number; // Local database uses number IDs
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncAt?: Date;
  lastModified: number;
}

export interface SyncQueue {
  id?: number;
  table: string;
  recordId: number;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

// Define the database
export class FarmDatabase extends Dexie {
  farms!: Table<LocalFarm>;
  crops!: Table<LocalCrop>;
  livestock!: Table<LocalLivestock>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('FarmManagementDB');
    
    this.version(1).stores({
      farms: '++id, name, location, owner, syncStatus, lastModified',
      crops: '++id, farmId, name, status, syncStatus, lastModified',
      livestock: '++id, farmId, type, breed, syncStatus, lastModified',
      syncQueue: '++id, table, recordId, operation, timestamp'
    });

    // Add hooks for automatic timestamp and sync status management
    this.farms.hook('creating', (primKey, obj: LocalFarm, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.syncStatus = 'pending';
      obj.lastModified = Date.now();
    });

    this.farms.hook('updating', (modifications: Partial<LocalFarm>, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
      modifications.syncStatus = 'pending';
      modifications.lastModified = Date.now();
    });

    this.crops.hook('creating', (primKey, obj: LocalCrop, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.syncStatus = 'pending';
      obj.lastModified = Date.now();
    });

    this.crops.hook('updating', (modifications: Partial<LocalCrop>, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
      modifications.syncStatus = 'pending';
      modifications.lastModified = Date.now();
    });

    this.livestock.hook('creating', (primKey, obj: LocalLivestock, trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.syncStatus = 'pending';
      obj.lastModified = Date.now();
    });

    this.livestock.hook('updating', (modifications: Partial<LocalLivestock>, primKey, obj, trans) => {
      modifications.updatedAt = new Date();
      modifications.syncStatus = 'pending';
      modifications.lastModified = Date.now();
    });
  }
}

// Create and export database instance
export const db = new FarmDatabase();

// Re-export local types for compatibility
export type { Farm as SharedFarmType } from '@shared/types';
export type { Animal as SharedAnimalType } from '@/types/livestock.types';

// Helper functions for common operations
export const dbHelpers = {
  // Add item to sync queue
  addToSyncQueue: async (table: string, recordId: number, operation: 'create' | 'update' | 'delete', data: any) => {
    await db.syncQueue.add({
      table,
      recordId,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    });
  },

  // Get pending sync items
  getPendingSyncItems: async () => {
    return await db.syncQueue.orderBy('timestamp').toArray();
  },

  // Clear sync queue item
  clearSyncItem: async (id: number) => {
    await db.syncQueue.delete(id);
  },

  // Get all pending records
  getPendingRecords: async () => {
    const farms = await db.farms.where('syncStatus').equals('pending').toArray();
    const crops = await db.crops.where('syncStatus').equals('pending').toArray();
    const livestock = await db.livestock.where('syncStatus').equals('pending').toArray();
    
    return { farms, crops, livestock };
  },

  // Mark record as synced
  markAsSynced: async (table: string, id: number) => {
    const tableRef = (db as any)[table];
    if (tableRef) {
      await tableRef.update(id, { syncStatus: 'synced' });
    }
  },

  // Check if database is available
  isAvailable: async (): Promise<boolean> => {
    try {
      await db.open();
      return true;
    } catch (error) {
      console.error('Database not available:', error);
      return false;
    }
  }
};