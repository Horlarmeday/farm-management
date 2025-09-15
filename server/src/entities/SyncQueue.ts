import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('sync_queue')
export class SyncQueue extends BaseEntity {

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('varchar', { name: 'entity_type', length: 100 })
  entityType: string;

  @Column('uuid', { name: 'entity_id' })
  entityId: string;

  @Column({
    type: 'enum',
    enum: SyncOperation,
  })
  operation: SyncOperation;

  @Column('json')
  data: any;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  status: SyncStatus;

  @Column('int', { name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;



  @Column('timestamp', { name: 'processed_at', nullable: true })
  processedAt: Date;
}