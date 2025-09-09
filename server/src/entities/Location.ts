import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { BirdBatch } from './BirdBatch';
import { Animal } from './Animal';
import { Farm } from './Farm';
import { Pond } from './Pond';
import { Asset } from './Asset';

@Entity('locations')
export class Location extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Relationships
  @ManyToOne(() => Farm, { nullable: false })
  @JoinColumn({ name: 'farmId' })
  farm!: Farm;

  @Column({ type: 'varchar', length: 255 })
  farmId!: string;

  @OneToMany(() => BirdBatch, (birdBatch) => birdBatch.location)
  birdBatches!: BirdBatch[];

  @OneToMany(() => Animal, (animal) => animal.location)
  animals!: Animal[];

  @OneToMany(() => Pond, (pond) => pond.location)
  ponds!: Pond[];

  @OneToMany(() => Asset, (asset) => asset.location)
  assets!: Asset[];
}
