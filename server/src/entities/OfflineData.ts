import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum OfflineDataType {
  LIVESTOCK = 'livestock',
  CROP = 'crop',
  TASK = 'task',
  FINANCIAL = 'financial',
  SENSOR = 'sensor',
}

@Entity('offline_data')
export class OfflineData extends BaseEntity {

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'farm_id' })
  farmId: string;

  @Column({
    type: 'enum',
    enum: OfflineDataType,
  })
  type: OfflineDataType;

  @Column('json')
  data: any;

  @Column('timestamp', { name: 'client_timestamp' })
  clientTimestamp: Date;

  @Column('boolean', { default: false })
  synced: boolean;

  @Column('int', { name: 'sync_attempts', default: 0 })
  syncAttempts: number;

  @Column({ name: 'last_sync_error', type: 'text', nullable: true })
  lastSyncError: string;



  @Column('timestamp', { name: 'synced_at', nullable: true })
  syncedAt: Date;
}