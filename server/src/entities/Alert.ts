import { AlertSeverity, AlertStatus, AlertType } from '../../../shared/src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('alerts')
export class Alert extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: AlertType })
  type!: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity, default: AlertSeverity.LOW })
  severity!: AlertSeverity;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.ACTIVE })
  status!: AlertStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'simple-json', nullable: true })
  data?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType?: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'boolean', default: false })
  isAutoResolved!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledgedById' })
  acknowledgedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  acknowledgedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolvedById' })
  resolvedBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolvedById?: string;
}
