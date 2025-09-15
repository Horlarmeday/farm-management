import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export enum NotificationType {
  ALERT = 'alert',
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('notification_preferences')
@Unique(['userId', 'type'])
export class NotificationPreference extends BaseEntity {

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority!: NotificationPriority;



  // Relations
  @ManyToOne(() => User, (user) => user.notificationPreferences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Helper methods
  shouldSendNotification(messagePriority: NotificationPriority): boolean {
    if (!this.enabled) return false;
    
    const priorityLevels = {
      [NotificationPriority.LOW]: 1,
      [NotificationPriority.MEDIUM]: 2,
      [NotificationPriority.HIGH]: 3,
      [NotificationPriority.CRITICAL]: 4,
    };
    
    return priorityLevels[messagePriority] >= priorityLevels[this.priority];
  }

  getDisplayName(): string {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case NotificationPriority.LOW:
        return '#10B981'; // green
      case NotificationPriority.MEDIUM:
        return '#F59E0B'; // yellow
      case NotificationPriority.HIGH:
        return '#EF4444'; // red
      case NotificationPriority.CRITICAL:
        return '#7C2D12'; // dark red
      default:
        return '#6B7280'; // gray
    }
  }

  static getDefaultPreferences(): Partial<NotificationPreference>[] {
    return [
      {
        type: NotificationType.ALERT,
        enabled: true,
        priority: NotificationPriority.HIGH,
      },
      {
        type: NotificationType.WARNING,
        enabled: true,
        priority: NotificationPriority.MEDIUM,
      },
      {
        type: NotificationType.INFO,
        enabled: true,
        priority: NotificationPriority.LOW,
      },
      {
        type: NotificationType.CRITICAL,
        enabled: true,
        priority: NotificationPriority.CRITICAL,
      },
    ];
  }
}