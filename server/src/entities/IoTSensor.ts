import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';
import { SensorReading } from './SensorReading';

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  SOIL_MOISTURE = 'soil_moisture',
  PH = 'ph',
  LIGHT = 'light',
}

export interface SensorConfiguration {
  min_threshold?: number;
  max_threshold?: number;
  unit: string;
  calibration_offset?: number;
  reading_interval?: number; // in minutes
  alert_enabled?: boolean;
}

@Entity('iot_sensors')
export class IoTSensor extends BaseEntity {

  @Column({ name: 'device_id', type: 'varchar', unique: true })
  deviceId!: string;

  @Column({ name: 'farm_id', type: 'uuid' })
  farmId!: string;

  @Column({
    type: 'enum',
    enum: SensorType,
  })
  type!: SensorType;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'json', nullable: true })
  configuration?: SensorConfiguration;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'last_seen', type: 'timestamp', nullable: true })
  lastSeen?: Date;



  // Relations
  @ManyToOne(() => Farm, (farm) => farm.iotSensors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  @OneToMany(() => SensorReading, (reading) => reading.sensor)
  readings!: SensorReading[];

  // Helper methods
  isWithinThreshold(value: number): boolean {
    if (!this.configuration) return true;
    
    const { min_threshold, max_threshold } = this.configuration;
    
    if (min_threshold !== undefined && value < min_threshold) {
      return false;
    }
    
    if (max_threshold !== undefined && value > max_threshold) {
      return false;
    }
    
    return true;
  }

  getDisplayName(): string {
    const typeDisplay = this.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return this.location ? `${typeDisplay} - ${this.location}` : typeDisplay;
  }
}