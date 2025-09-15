import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { FarmUser } from './FarmUser';
import { Animal } from './Animal';
import { Asset } from './Asset';
import { BirdBatch } from './BirdBatch';
import { Budget } from './Budget';
import { FinancialTransaction } from './FinancialTransaction';
import { InventoryItem } from './InventoryItem';
import { Location } from './Location';
import { Pond } from './Pond';
import { Task } from './Task';
import { IoTSensor } from './IoTSensor';
import { Prediction } from './Prediction';

@Entity('farms')
export class Farm extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

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

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column({ type: 'varchar', length: 255 })
  ownerId!: string;

  @OneToMany(() => FarmUser, (farmUser) => farmUser.farm)
  farmUsers!: FarmUser[];

  @OneToMany(() => Animal, (animal) => animal.farm)
  animals!: Animal[];

  @OneToMany(() => Asset, (asset) => asset.farm)
  assets!: Asset[];

  @OneToMany(() => BirdBatch, (birdBatch) => birdBatch.farm)
  birdBatches!: BirdBatch[];

  @OneToMany(() => FinancialTransaction, (transaction) => transaction.farm)
  financialTransactions!: FinancialTransaction[];

  @OneToMany(() => InventoryItem, (item) => item.farm)
  inventoryItems!: InventoryItem[];

  @OneToMany(() => Location, (location) => location.farm)
  locations!: Location[];

  @OneToMany(() => Pond, (pond) => pond.farm)
  ponds!: Pond[];

  @OneToMany(() => Task, (task) => task.farm)
  tasks!: Task[];

  @OneToMany(() => Budget, (budget) => budget.farm)
  budgets!: Budget[];

  @OneToMany(() => IoTSensor, (sensor) => sensor.farm)
  iotSensors!: IoTSensor[];

  @OneToMany(() => Prediction, (prediction) => prediction.farm)
  predictions!: Prediction[];
}