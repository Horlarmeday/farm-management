import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

@Entity('push_subscriptions')
export class PushSubscription extends BaseEntity {

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'json' })
  subscription!: WebPushSubscription;

  @Column({ type: 'boolean', default: true })
  active!: boolean;



  // Relations
  @ManyToOne(() => User, (user) => user.pushSubscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Helper methods
  isExpired(): boolean {
    if (!this.subscription.expirationTime) return false;
    return Date.now() > this.subscription.expirationTime;
  }

  getEndpointDomain(): string {
    try {
      const url = new URL(this.subscription.endpoint);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }

  getBrowserType(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    const endpoint = this.subscription.endpoint;
    
    if (endpoint.includes('fcm.googleapis.com')) return 'chrome';
    if (endpoint.includes('updates.push.services.mozilla.com')) return 'firefox';
    if (endpoint.includes('web.push.apple.com')) return 'safari';
    if (endpoint.includes('wns.windows.com')) return 'edge';
    
    return 'unknown';
  }

  toWebPushFormat(): WebPushSubscription {
    return this.subscription;
  }
}