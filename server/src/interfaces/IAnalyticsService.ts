import { YieldPrediction, WeatherForecast, InsightData } from '../services/analytics.service';

/**
 * Interface for Analytics Service to ensure proper implementation
 * and enable dependency injection through ServiceFactory
 */
export interface IAnalyticsService {
  /**
   * Initialize the analytics service and ML models
   */
  initialize(): Promise<void>;

  /**
   * Predict yield for a specific farm and crop type
   * @param farmId - The farm identifier
   * @param cropType - Type of crop (optional, defaults to 'general')
   * @returns Promise resolving to yield prediction
   */
  predictYield(farmId: string, cropType?: string): Promise<YieldPrediction>;

  /**
   * Generate weather forecast for a farm
   * @param farmId - The farm identifier
   * @param days - Number of days to forecast (optional, defaults to 7)
   * @returns Promise resolving to weather forecast array
   */
  generateWeatherForecast(farmId: string, days?: number): Promise<WeatherForecast[]>;

  /**
   * Generate automated insights for a farm
   * @param farmId - The farm identifier
   * @returns Promise resolving to insights array
   */
  generateAutomatedInsights(farmId: string): Promise<InsightData[]>;

  /**
   * Train the yield prediction model for a specific farm
   * @param farmId - The farm identifier
   * @returns Promise resolving when training is complete
   */
  trainYieldModel(farmId: string): Promise<void>;

  /**
   * Get dashboard analytics data for a farm
   * @param farmId - The farm identifier
   * @param period - Time period for analytics (e.g., '7d', '30d')
   * @returns Promise resolving to dashboard data
   */
  getDashboardData(farmId: string, period: string): Promise<any>;

  /**
   * Get prediction accuracy metrics
   * @param farmId - The farm identifier
   * @param type - Type of prediction (optional)
   * @param days - Number of days to analyze
   * @returns Promise resolving to accuracy metrics
   */
  getAccuracyMetrics(farmId: string, type?: string, days?: number): Promise<any>;

  /**
   * Export prediction data in specified format
   * @param farmId - The farm identifier
   * @param format - Export format ('json' or 'csv')
   * @param type - Type of prediction (optional)
   * @param days - Number of days to export
   * @returns Promise resolving to exported data
   */
  exportPredictionData(farmId: string, format: string, type?: string, days?: number): Promise<any>;

  /**
   * Get historical predictions for a farm
   * @param farmId - The farm identifier
   * @param type - Type of prediction (optional)
   * @param limit - Maximum number of predictions to return
   * @param days - Number of days to look back
   * @returns Promise resolving to historical predictions
   */
  getHistoricalPredictions(farmId: string, type?: string, limit?: number, days?: number): Promise<any[]>;

  /**
   * Clean up resources and dispose of models
   */
  cleanup(): Promise<void>;
}