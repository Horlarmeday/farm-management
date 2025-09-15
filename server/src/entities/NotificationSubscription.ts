import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { NotificationType } from '../../../shared/src/types';

@Entity('notification_subscriptions')
export class NotificationSubscription extends BaseEntity {
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({ type: 'varchar', length: 100 })
  channel: string;

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ type: 'simple-json', nullable: true })
  preferences?: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  userId: string;
}
