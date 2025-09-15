import { DeliveryChannel, NotificationStatus, NotificationType, Priority } from '../../../shared/src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NotificationTemplate } from './NotificationTemplate';
import { Task } from './Task';
import { User } from './User';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority!: Priority;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status!: NotificationStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'simple-json', nullable: true })
  data?: Record<string, any>;

  // Delivery Configuration
  @Column({ type: 'simple-json' })
  deliveryMethods!: DeliveryChannel[]; // ['email', 'sms', 'push', 'in_app']

  // Delivery Status Tracking
  @Column({ type: 'boolean', default: false })
  emailSent?: boolean;

  @Column({ type: 'boolean', default: false })
  smsSent?: boolean;

  @Column({ type: 'boolean', default: false })
  pushSent?: boolean;

  @Column({ type: 'boolean', default: false })
  inAppSent?: boolean;

  // Action Configuration
  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actionText?: string;

  @Column({ type: 'boolean', default: false })
  actionRequired?: boolean;

  // Scheduling
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Delivery Timestamps
  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  clickedAt?: Date;

  // Targeting
  @Column({ type: 'boolean', default: false })
  isGlobal!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceUrl?: string;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdById?: string;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task?: Task;

  @Column({ type: 'varchar', length: 255, nullable: true })
  taskId?: string;

  @ManyToOne(() => NotificationTemplate, (template) => template.notifications, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template?: NotificationTemplate;

  @Column({ type: 'varchar', length: 255, nullable: true })
  templateId?: string;

  // Helper methods for delivery status
  isDelivered(): boolean {
    return this.status === NotificationStatus.DELIVERED || this.status === NotificationStatus.READ;
  }

  isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }

  isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  isFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  // Helper methods for delivery methods
  shouldSendEmail(): boolean {
    return this.deliveryMethods.includes(DeliveryChannel.EMAIL);
  }

  shouldSendSMS(): boolean {
    return this.deliveryMethods.includes(DeliveryChannel.SMS);
  }

  shouldSendPush(): boolean {
    return this.deliveryMethods.includes(DeliveryChannel.PUSH);
  }

  shouldSendInApp(): boolean {
    return this.deliveryMethods.includes(DeliveryChannel.IN_APP);
  }

  // Helper method to check if all configured methods have been sent
  allMethodsSent(): boolean {
    const methods = this.deliveryMethods;
    return methods.every((method) => {
      switch (method) {
        case DeliveryChannel.EMAIL:
          return this.emailSent === true;
        case DeliveryChannel.SMS:
          return this.smsSent === true;
        case DeliveryChannel.PUSH:
          return this.pushSent === true;
        case DeliveryChannel.IN_APP:
          return this.inAppSent === true;
        default:
          return false;
      }
    });
  }

  // Helper method to mark a delivery method as sent
  markMethodSent(method: DeliveryChannel): void {
    switch (method) {
      case DeliveryChannel.EMAIL:
        this.emailSent = true;
        break;
      case DeliveryChannel.SMS:
        this.smsSent = true;
        break;
      case DeliveryChannel.PUSH:
        this.pushSent = true;
        break;
      case DeliveryChannel.IN_APP:
        this.inAppSent = true;
        break;
    }
  }
}
