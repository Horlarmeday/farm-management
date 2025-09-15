import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { IoTSensor } from './IoTSensor';

export interface ReadingMetadata {
  battery_level?: number;
  signal_strength?: number;
  device_id?: string;
  firmware_version?: string;
  calibrated?: boolean;
  quality_score?: number;
  environmental_conditions?: {
    ambient_temperature?: number;
    ambient_humidity?: number;
  };
}

@Entity('sensor_readings')
export class SensorReading extends BaseEntity {

  @Column({ name: 'sensor_id', type: 'uuid' })
  sensorId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  value!: number;

  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  @Column({ name: 'reading_time', type: 'timestamp' })
  readingTime!: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: ReadingMetadata;



  // Relations
  @ManyToOne(() => IoTSensor, (sensor) => sensor.readings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sensor_id' })
  sensor!: IoTSensor;

  // Helper methods
  isRecentReading(minutesThreshold: number = 60): boolean {
    const now = new Date();
    const diffInMinutes = (now.getTime() - this.readingTime.getTime()) / (1000 * 60);
    return diffInMinutes <= minutesThreshold;
  }

  getFormattedValue(): string {
    return `${this.value.toFixed(2)} ${this.unit}`;
  }

  hasGoodQuality(): boolean {
    if (!this.metadata?.quality_score) return true;
    return this.metadata.quality_score >= 0.8;
  }

  getBatteryStatus(): 'low' | 'medium' | 'high' | 'unknown' {
    const batteryLevel = this.metadata?.battery_level;
    if (batteryLevel === undefined) return 'unknown';
    
    if (batteryLevel < 20) return 'low';
    if (batteryLevel < 50) return 'medium';
    return 'high';
  }
}