import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Animal } from './Animal';
import { User } from './User';
import { FeedType } from '@kuyash/shared';

@Entity('animal_feeding_logs')
export class AnimalFeedingLog extends BaseEntity {
  @Column({ type: 'timestamp' })
  feedingTime!: Date;

  @Column({
    type: 'enum',
    enum: FeedType,
  })
  feedType!: FeedType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'varchar', length: 50, default: 'kg' })
  unit!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerUnit?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  @Column({ type: 'text', nullable: true })
  feedingNotes?: string;

  @ManyToOne(() => Animal)
  @JoinColumn({ name: 'animal_id' })
  animal!: Animal;

  @Column({ type: 'varchar', length: 255 })
  animalId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'fed_by_id' })
  fedBy!: User;

  @Column({ type: 'varchar', length: 255 })
  fedById!: string;
}
