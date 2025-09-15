import { DepreciationMethod } from '../../../shared/src/types';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Asset } from './Asset';
import { BaseEntity } from './BaseEntity';

@Entity('asset_depreciations')
export class AssetDepreciation extends BaseEntity {
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  originalValue!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  residualValue!: number;

  @Column({ type: 'int' })
  usefulLifeYears!: number;

  @Column({
    type: 'enum',
    enum: DepreciationMethod,
  })
  depreciationMethod!: DepreciationMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  annualDepreciation!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  accumulatedDepreciation!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  currentValue!: number;

  @Column({ type: 'date' })
  depreciationStartDate!: Date;

  @Column({ type: 'date' })
  depreciationEndDate!: Date;

  @Column({ type: 'date', nullable: true })
  depreciationDate?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  depreciationAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  bookValue?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  method?: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @Column({ type: 'varchar', length: 255 })
  assetId!: string;
}
