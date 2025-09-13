import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Notification } from './Notification';
import { NotificationType } from '@kuyash/shared';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

@Entity('notification_templates')
export class NotificationTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType!: NotificationType;

  @Column({
    type: 'enum',
    enum: TemplateType,
  })
  templateType!: TemplateType;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-json', nullable: true })
  variables?: Record<string, string>;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Notification, (notification) => notification.template)
  notifications!: Notification[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User;

  @Column({ type: 'varchar', length: 255 })
  createdById!: string;
}
