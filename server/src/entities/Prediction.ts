import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Farm } from './Farm';

export enum PredictionType {
  YIELD = 'yield',
  DISEASE = 'disease',
  WEATHER = 'weather',
  MARKET = 'market',
}

export interface PredictionFactor {
  name: string;
  value: number;
  weight: number;
  description?: string;
  source?: 'sensor' | 'historical' | 'external' | 'manual';
}

export interface PredictionFactors {
  factors: PredictionFactor[];
  data_sources: string[];
  model_inputs: Record<string, any>;
  environmental_conditions?: {
    temperature_avg?: number;
    humidity_avg?: number;
    rainfall?: number;
    soil_conditions?: Record<string, any>;
  };
}

@Entity('predictions')
export class Prediction extends BaseEntity {

  @Column({ name: 'farm_id', type: 'uuid' })
  farmId!: string;

  @Column({
    type: 'enum',
    enum: PredictionType,
  })
  type!: PredictionType;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  value!: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  confidence!: number;

  @Column({ type: 'json', nullable: true })
  factors?: PredictionFactors;

  @Column({ name: 'model_version', type: 'varchar', length: 50, nullable: true })
  modelVersion?: string;



  @Column({ name: 'valid_until', type: 'timestamp', nullable: true })
  validUntil?: Date;

  // Relations
  @ManyToOne(() => Farm, (farm) => farm.predictions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farm_id' })
  farm!: Farm;

  // Helper methods
  isValid(): boolean {
    if (!this.validUntil) return true;
    return new Date() <= this.validUntil;
  }

  getConfidenceLevel(): 'low' | 'medium' | 'high' {
    if (this.confidence < 0.6) return 'low';
    if (this.confidence < 0.8) return 'medium';
    return 'high';
  }

  getFormattedValue(): string {
    switch (this.type) {
      case PredictionType.YIELD:
        return `${this.value.toFixed(1)} kg/ha`;
      case PredictionType.DISEASE:
        return `${(this.value * 100).toFixed(1)}% risk`;
      case PredictionType.WEATHER:
        return `${this.value.toFixed(1)}°C`;
      case PredictionType.MARKET:
        return `$${this.value.toFixed(2)}`;
      default:
        return this.value.toString();
    }
  }

  getTopFactors(limit: number = 3): PredictionFactor[] {
    if (!this.factors?.factors) return [];
    
    return this.factors.factors
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.factors?.factors) return recommendations;
    
    const topFactors = this.getTopFactors(5);
    
    switch (this.type) {
      case PredictionType.YIELD:
        if (this.confidence > 0.8 && this.value > 0) {
          recommendations.push('Optimal conditions detected for high yield');
        }
        break;
      case PredictionType.DISEASE:
        if (this.value > 0.7) {
          recommendations.push('High disease risk - consider preventive measures');
          recommendations.push('Monitor affected areas closely');
        }
        break;
      case PredictionType.WEATHER:
        if (this.value < 10 || this.value > 35) {
          recommendations.push('Extreme temperature predicted - protect sensitive crops');
        }
        break;
      case PredictionType.MARKET:
        if (this.confidence > 0.8) {
          recommendations.push('Market conditions favorable for selling');
        }
        break;
    }
    
    return recommendations;
  }
}