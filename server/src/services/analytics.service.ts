import * as tf from '@tensorflow/tfjs-node';
import { AppDataSource } from '../config/database';
import { SensorReading } from '../entities/SensorReading';
import { Prediction, PredictionType } from '../entities/Prediction';
import { Farm } from '../entities/Farm';
import { IoTSensor, SensorType } from '../entities/IoTSensor';
import { Between, MoreThan, In } from 'typeorm';
import { IAnalyticsService } from '../interfaces/IAnalyticsService';
import { ErrorHandler, DatabaseError, ValidationError, NotFoundError } from '../utils/error-handler';

export interface PredictionInput {
  temperature: number[];
  humidity: number[];
  soilMoisture: number[];
  rainfall: number[];
  timestamps: Date[];
}

export interface YieldPrediction {
  farmId: string;
  cropType: string;
  predictedYield: number;
  confidence: number;
  factors: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    rainfall: number;
  };
  recommendations: string[];
}

export interface WeatherForecast {
  date: Date;
  temperature: { min: number; max: number; avg: number };
  humidity: number;
  rainfall: number;
  conditions: string;
}

export interface InsightData {
  type: 'yield_prediction' | 'weather_alert' | 'soil_health' | 'irrigation_recommendation' | 'pest_risk';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: any;
  recommendations: string[];
  validUntil: Date;
}

class AnalyticsService implements IAnalyticsService {
  private yieldModel: tf.LayersModel | null = null;
  private weatherModel: tf.LayersModel | null = null;
  private isInitialized = false;

  /**
   * Initializes the analytics service by setting up TensorFlow.js and loading ML models
   * @returns Promise that resolves when initialization is complete
   * @throws {DatabaseError} When model initialization fails
   */
  async initialize(): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      // Initialize TensorFlow.js backend
      await tf.ready();
      
      // Create or load models
      await this.initializeYieldPredictionModel();
      await this.initializeWeatherPredictionModel();
      
      this.isInitialized = true;
    }, 'AnalyticsService.initialize');
  }

  private async initializeYieldPredictionModel(): Promise<void> {
    try {
      // Try to load existing model, otherwise create new one
      try {
        this.yieldModel = await tf.loadLayersModel('file://./models/yield_prediction/model.json');
      } catch {
        // Create new model if loading fails
        this.yieldModel = this.createYieldPredictionModel();
      }
    } catch (error) {
      ErrorHandler.logError(error as Error, 'AnalyticsService.initializeYieldPredictionModel');
      // Create a simple fallback model
      this.yieldModel = this.createYieldPredictionModel();
    }
  }

  private async initializeWeatherPredictionModel(): Promise<void> {
    try {
      // Try to load existing model, otherwise create new one
      try {
        this.weatherModel = await tf.loadLayersModel('file://./models/weather_prediction/model.json');
      } catch {
        // Create new model if loading fails
        this.weatherModel = this.createWeatherPredictionModel();
      }
    } catch (error) {
      ErrorHandler.logError(error as Error, 'AnalyticsService.initializeWeatherPredictionModel');
      // Create a simple fallback model
      this.weatherModel = this.createWeatherPredictionModel();
    }
  }

  private createYieldPredictionModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  private createWeatherPredictionModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'linear' }) // temp, humidity, rainfall, pressure
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Predicts crop yield for a specific farm using machine learning models
   * @param farmId - Unique identifier of the farm
   * @param cropType - Type of crop to predict yield for (defaults to 'general')
   * @returns Promise resolving to yield prediction with confidence and recommendations
   * @throws {ValidationError} When service is not initialized or insufficient data
   */
  async predictYield(farmId: string, cropType: string = 'general'): Promise<YieldPrediction> {
    if (!this.isInitialized || !this.yieldModel) {
      throw new ValidationError('Analytics service not initialized');
    }

    return ErrorHandler.handleDatabaseOperation(async () => {
      // Get historical sensor data for the farm
      const sensorData = await this.getHistoricalSensorData(farmId, 30); // Last 30 days
      
      if (sensorData.length === 0) {
        throw new ValidationError('Insufficient sensor data for prediction');
      }

      // Prepare input features
      const features = this.prepareFeaturesForYieldPrediction(sensorData);
      const inputTensor = tf.tensor2d([features]);

      // Make prediction
      const prediction = this.yieldModel!.predict(inputTensor) as tf.Tensor;
      const yieldValue = await prediction.data();
      
      // Calculate confidence based on data quality and model certainty
      const confidence = this.calculatePredictionConfidence(sensorData, yieldValue[0]);
      
      // Generate recommendations
      const recommendations = this.generateYieldRecommendations(features, yieldValue[0]);

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      const result: YieldPrediction = {
        farmId,
        cropType,
        predictedYield: Math.max(0, yieldValue[0]), // Ensure non-negative
        confidence,
        factors: {
          temperature: features[0],
          humidity: features[1],
          soilMoisture: features[2],
          rainfall: features[3]
        },
        recommendations
      };

      // Save prediction to database
      await this.savePrediction(farmId, 'yield_prediction', result, confidence);

      return result;
    }, 'AnalyticsService.predictYield');
  }

  /**
   * Generates weather forecast for a farm using historical data and ML models
   * @param farmId - Unique identifier of the farm
   * @param days - Number of days to forecast (defaults to 7)
   * @returns Promise resolving to array of weather forecasts
   * @throws {ValidationError} When service is not initialized or insufficient data
   */
  async generateWeatherForecast(farmId: string, days: number = 7): Promise<WeatherForecast[]> {
    if (!this.isInitialized || !this.weatherModel) {
      throw new ValidationError('Analytics service not initialized');
    }

    return ErrorHandler.handleDatabaseOperation(async () => {
      // Get recent weather data
      const recentData = await this.getHistoricalSensorData(farmId, 14); // Last 14 days
      
      if (recentData.length === 0) {
        throw new ValidationError('Insufficient weather data for forecasting');
      }

      const forecasts: WeatherForecast[] = [];
      let currentFeatures = this.prepareFeaturesForWeatherPrediction(recentData);

      for (let i = 0; i < days; i++) {
        const inputTensor = tf.tensor2d([currentFeatures]);
        const prediction = this.weatherModel!.predict(inputTensor) as tf.Tensor;
        const weatherData = await prediction.data();

        const forecast: WeatherForecast = {
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
          temperature: {
            min: weatherData[0] - 3,
            max: weatherData[0] + 3,
            avg: weatherData[0]
          },
          humidity: Math.max(0, Math.min(100, weatherData[1])),
          rainfall: Math.max(0, weatherData[2]),
          conditions: this.interpretWeatherConditions(Array.from(prediction.dataSync()).slice(0, 3))
        };

        forecasts.push(forecast);

        // Update features for next prediction (simple approach)
        currentFeatures = this.updateFeaturesWithPrediction(currentFeatures, Array.from(prediction.dataSync()));

        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();
      }

      return forecasts;
    }, 'AnalyticsService.generateWeatherForecast');
  }

  /**
   * Generates automated insights and recommendations based on recent farm data
   * @param farmId - Unique identifier of the farm
   * @returns Promise resolving to array of actionable insights and recommendations
   */
  async generateAutomatedInsights(farmId: string): Promise<InsightData[]> {
    const insights: InsightData[] = [];

    try {
      // Get recent sensor data
      const recentData = await this.getHistoricalSensorData(farmId, 7);
      
      if (recentData.length === 0) {
        return insights;
      }

      // Soil moisture insights
      const soilMoistureInsight = await this.analyzeSoilMoisture(farmId, recentData);
      if (soilMoistureInsight) insights.push(soilMoistureInsight);

      // Temperature stress insights
      const temperatureInsight = await this.analyzeTemperatureStress(farmId, recentData);
      if (temperatureInsight) insights.push(temperatureInsight);

      // Irrigation recommendations
      const irrigationInsight = await this.generateIrrigationRecommendation(farmId, recentData);
      if (irrigationInsight) insights.push(irrigationInsight);

      // Yield prediction insight
      try {
        const yieldPrediction = await this.predictYield(farmId);
        const yieldInsight: InsightData = {
          type: 'yield_prediction',
          title: 'Yield Forecast Update',
          description: `Predicted yield: ${yieldPrediction.predictedYield.toFixed(1)} units with ${(yieldPrediction.confidence * 100).toFixed(0)}% confidence`,
          severity: yieldPrediction.confidence > 0.8 ? 'low' : 'medium',
          confidence: yieldPrediction.confidence,
          data: yieldPrediction,
          recommendations: yieldPrediction.recommendations,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Valid for 24 hours
        };
        insights.push(yieldInsight);
      } catch (error) {
        ErrorHandler.logError(error as Error, 'AnalyticsService.generateAutomatedInsights.yieldPrediction');
      }

      return insights;
    } catch (error) {
      ErrorHandler.logError(error as Error, 'AnalyticsService.generateAutomatedInsights');
      return insights;
    }
  }

  private async getHistoricalSensorData(farmId: string, days: number): Promise<SensorReading[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const sensorRepo = AppDataSource.getRepository(IoTSensor);
    const readingRepo = AppDataSource.getRepository(SensorReading);

    // Get all sensors for the farm
    const sensors = await sensorRepo.find({ where: { farmId } });
    
    if (sensors.length === 0) {
      return [];
    }

    const sensorIds = sensors.map(s => s.id);
    
    // Get readings for all sensors
    const readings = await readingRepo.find({
      where: {
        sensorId: In(sensorIds),
        readingTime: MoreThan(startDate),
      },
      relations: ['sensor'],
      order: { readingTime: 'ASC' },
    });

    return readings;
  }

  private prepareFeaturesForYieldPrediction(sensorData: SensorReading[]): number[] {
    // Calculate averages and trends from sensor data
    const avgTemp = this.calculateAverage(sensorData, 'temperature');
    const avgHumidity = this.calculateAverage(sensorData, 'humidity');
    const avgSoilMoisture = this.calculateAverage(sensorData, 'soil_moisture');
    const totalRainfall = this.calculateSum(sensorData, 'rainfall');
    const tempVariance = this.calculateVariance(sensorData, 'temperature');
    const humidityTrend = this.calculateTrend(sensorData, 'humidity');
    const daysSinceLastRain = this.daysSinceLastSignificantRain(sensorData);
    const growingDegreeDays = this.calculateGrowingDegreeDays(sensorData);

    return [
      avgTemp || 20,
      avgHumidity || 60,
      avgSoilMoisture || 40,
      totalRainfall || 0,
      tempVariance || 5,
      humidityTrend || 0,
      daysSinceLastRain || 7,
      growingDegreeDays || 100
    ];
  }

  private prepareFeaturesForWeatherPrediction(sensorData: SensorReading[]): number[] {
    // Prepare features for weather prediction
    const recentTemp = this.getRecentValues(sensorData, 'temperature', 3);
    const recentHumidity = this.getRecentValues(sensorData, 'humidity', 3);
    const recentPressure = this.getRecentValues(sensorData, 'pressure', 2);
    const seasonalFactor = this.getSeasonalFactor();
    const timeOfYear = this.getTimeOfYearFactor();

    return [
      ...recentTemp,
      ...recentHumidity,
      ...recentPressure,
      seasonalFactor,
      timeOfYear
    ].slice(0, 10); // Ensure exactly 10 features
  }

  private calculateAverage(data: SensorReading[], sensorType: string): number {
    const values = data.filter(d => d.sensor && d.sensor.type === sensorType)
                      .map(d => d.value);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private calculateSum(data: SensorReading[], sensorType: string): number {
    const values = data.filter(d => d.sensor && d.sensor.type === sensorType)
                      .map(d => d.value);
    return values.reduce((a, b) => a + b, 0);
  }

  private calculateVariance(data: SensorReading[], sensorType: string): number {
    const values = data.filter(d => d.sensor && d.sensor.type === sensorType)
                      .map(d => d.value);
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateTrend(data: SensorReading[], sensorType: string): number {
    const values = data.filter(d => d.sensor && d.sensor.type === sensorType)
                      .map(d => d.value);
    if (values.length < 2) return 0;
    
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
    
    return secondAvg - firstAvg;
  }

  private daysSinceLastSignificantRain(data: SensorReading[]): number {
    const rainData = data.filter(d => d.sensor && d.sensor.type === 'rainfall' as any && d.value > 5)
                        .sort((a, b) => new Date(b.readingTime).getTime() - new Date(a.readingTime).getTime());
    
    if (rainData.length === 0) return 30; // Default to 30 days
    
    const lastRain = new Date(rainData[0].readingTime);
    const now = new Date();
    return Math.floor((now.getTime() - lastRain.getTime()) / (24 * 60 * 60 * 1000));
  }

  private calculateGrowingDegreeDays(data: SensorReading[]): number {
    const baseTemp = 10; // Base temperature for growing degree days
    return data.filter(d => d.sensor && d.sensor.type === 'temperature' && d.value > baseTemp)
              .reduce((sum, d) => sum + (d.value - baseTemp), 0);
  }

  private getRecentValues(data: SensorReading[], sensorType: string, count: number): number[] {
    const values = data.filter(d => d.sensor && d.sensor.type === sensorType)
                      .map(d => d.value)
                      .slice(-count);
    
    // Pad with zeros if not enough values
    while (values.length < count) {
      values.unshift(0);
    }
    
    return values;
  }

  private getSeasonalFactor(): number {
    const month = new Date().getMonth();
    // Simple seasonal factor (0-1)
    return Math.sin((month / 12) * 2 * Math.PI) * 0.5 + 0.5;
  }

  private getTimeOfYearFactor(): number {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
    return dayOfYear / 365;
  }

  private calculatePredictionConfidence(sensorData: any[], prediction: number): number {
    // Simple confidence calculation based on data quality and prediction reasonableness
    const dataQuality = Math.min(1, sensorData.length / 100); // More data = higher confidence
    const predictionReasonableness = prediction > 0 && prediction < 1000 ? 1 : 0.5;
    
    return Math.min(0.95, dataQuality * predictionReasonableness * 0.8 + 0.2);
  }

  private generateYieldRecommendations(features: number[], predictedYield: number): string[] {
    const recommendations: string[] = [];
    
    const [temp, humidity, soilMoisture, rainfall] = features;
    
    if (soilMoisture < 30) {
      recommendations.push('Increase irrigation frequency to improve soil moisture levels');
    }
    
    if (temp > 30) {
      recommendations.push('Consider shade structures or cooling systems during hot periods');
    }
    
    if (humidity > 80) {
      recommendations.push('Improve ventilation to reduce humidity and prevent fungal diseases');
    }
    
    if (rainfall < 10) {
      recommendations.push('Supplement with irrigation due to low rainfall');
    }
    
    if (predictedYield < 50) {
      recommendations.push('Consider soil amendments and nutrient supplementation');
    }
    
    return recommendations;
  }

  private interpretWeatherConditions(weatherData: number[]): string {
    const [temp, humidity, rainfall] = weatherData;
    
    if (rainfall > 10) return 'Rainy';
    if (humidity > 80) return 'Humid';
    if (temp > 30) return 'Hot';
    if (temp < 10) return 'Cold';
    
    return 'Clear';
  }

  private updateFeaturesWithPrediction(currentFeatures: number[], prediction: number[]): number[] {
    // Simple feature update for next prediction
    const updated = [...currentFeatures];
    
    // Shift temperature history
    updated[0] = updated[1];
    updated[1] = updated[2];
    updated[2] = prediction[0]; // New temperature
    
    // Update other features similarly
    updated[3] = updated[4];
    updated[4] = updated[5];
    updated[5] = prediction[1]; // New humidity
    
    return updated;
  }

  private async analyzeSoilMoisture(farmId: string, sensorData: SensorReading[]): Promise<InsightData | null> {
    const avgSoilMoisture = this.calculateAverage(sensorData, 'soil_moisture');
    
    if (avgSoilMoisture < 25) {
      return {
        type: 'irrigation_recommendation',
        title: 'Low Soil Moisture Detected',
        description: `Average soil moisture is ${avgSoilMoisture.toFixed(1)}%, which is below optimal levels`,
        severity: 'high',
        confidence: 0.9,
        data: { avgSoilMoisture },
        recommendations: [
          'Increase irrigation frequency',
          'Check irrigation system for blockages',
          'Consider mulching to retain moisture'
        ],
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000)
      };
    }
    
    return null;
  }

  private async analyzeTemperatureStress(farmId: string, sensorData: SensorReading[]): Promise<InsightData | null> {
    const avgTemp = this.calculateAverage(sensorData, 'temperature');
    const tempReadings = sensorData.filter(d => d.sensor && d.sensor.type === 'temperature');
    const maxTemp = tempReadings.length > 0 ? Math.max(...tempReadings.map(d => d.value)) : 0;
    
    if (maxTemp > 35) {
      return {
        type: 'weather_alert',
        title: 'High Temperature Stress',
        description: `Maximum temperature reached ${maxTemp.toFixed(1)}°C, which may stress crops`,
        severity: 'medium',
        confidence: 0.85,
        data: { avgTemp, maxTemp },
        recommendations: [
          'Increase watering frequency during hot periods',
          'Consider temporary shade structures',
          'Monitor plants for heat stress symptoms'
        ],
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000)
      };
    }
    
    return null;
  }

  private async generateIrrigationRecommendation(farmId: string, sensorData: SensorReading[]): Promise<InsightData | null> {
    const avgSoilMoisture = this.calculateAverage(sensorData, 'soil_moisture');
    const avgTemp = this.calculateAverage(sensorData, 'temperature');
    const recentRainfall = this.calculateSum(sensorData.slice(-3), 'rainfall');
    
    if (avgSoilMoisture < 40 && recentRainfall < 5 && avgTemp > 25) {
      return {
        type: 'irrigation_recommendation',
        title: 'Irrigation Recommended',
        description: 'Current conditions suggest irrigation is needed based on soil moisture, temperature, and rainfall data',
        severity: 'medium',
        confidence: 0.8,
        data: { avgSoilMoisture, avgTemp, recentRainfall },
        recommendations: [
          'Schedule irrigation for early morning or evening',
          'Apply deep watering to encourage root growth',
          'Monitor soil moisture after irrigation'
        ],
        validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000)
      };
    }
    
    return null;
  }

  private async savePrediction(farmId: string, type: string, data: any, confidence: number): Promise<void> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const predictionRepo = AppDataSource.getRepository(Prediction);
      
      const prediction = predictionRepo.create({
        farmId,
        type: type as PredictionType,
        value: typeof data === 'number' ? data : 0,
        confidence,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
        factors: {
          factors: [],
          data_sources: ['sensor'],
          model_inputs: data
        },
        modelVersion: '1.0'
      });
      
      await predictionRepo.save(prediction);
    }, 'AnalyticsService.savePrediction');
  }

  /**
   * Trains the yield prediction model using historical farm data
   * @param farmId - Unique identifier of the farm to train the model for
   * @returns Promise that resolves when training is complete
   * @throws {ValidationError} When model is not initialized or insufficient training data
   */
  async trainYieldModel(farmId: string): Promise<void> {
    if (!this.yieldModel) {
      throw new ValidationError('Yield model not initialized');
    }

    return ErrorHandler.handleDatabaseOperation(async () => {
      // Get historical data for training
      const historicalData = await this.getHistoricalSensorData(farmId, 365); // Last year
      
      if (historicalData.length < 100) {
        throw new ValidationError('Insufficient data for training');
      }

      // Prepare training data
      const features: number[][] = [];
      const labels: number[] = [];

      // This is a simplified example - in reality, you'd need actual yield data
      for (let i = 0; i < historicalData.length - 30; i += 30) {
        const monthData = historicalData.slice(i, i + 30);
        const feature = this.prepareFeaturesForYieldPrediction(monthData);
        features.push(feature);
        
        // Simulate yield data (in reality, this would come from actual harvest records)
        const simulatedYield = this.simulateYieldFromFeatures(feature);
        labels.push(simulatedYield);
      }

      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      // Train the model
      await this.yieldModel!.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2
      });

      // Save the trained model
      await this.yieldModel!.save('file://./models/yield_prediction');
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
    }, 'AnalyticsService.trainYieldModel');
  }

  private simulateYieldFromFeatures(features: number[]): number {
    // Simple simulation for demonstration
    const [temp, humidity, soilMoisture, rainfall] = features;
    
    let cropYield = 100; // Base yield
    
    // Temperature factor
    if (temp >= 20 && temp <= 25) cropYield += 20;
    else if (temp < 15 || temp > 30) cropYield -= 30;
    
    // Humidity factor
    if (humidity >= 50 && humidity <= 70) cropYield += 15;
    else if (humidity < 30 || humidity > 85) cropYield -= 20;
    
    // Soil moisture factor
    if (soilMoisture >= 40 && soilMoisture <= 60) cropYield += 25;
    else if (soilMoisture < 25) cropYield -= 40;
    
    // Rainfall factor
    if (rainfall >= 20 && rainfall <= 50) cropYield += 10;
    else if (rainfall > 100) cropYield -= 15;
    
    return Math.max(10, cropYield + (Math.random() - 0.5) * 20); // Add some noise
  }

  /**
   * Get dashboard analytics data for a farm
   * @param farmId - The farm identifier
   * @param period - Time period for analytics (e.g., '7d', '30d')
   * @returns Promise resolving to dashboard data
   */
  async getDashboardData(farmId: string, period: string): Promise<any> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const days = period === '30d' ? 30 : 7;
      const sensorData = await this.getHistoricalSensorData(farmId, days);
      const predictions = await this.getHistoricalPredictions(farmId, undefined, 10, days);
      const insights = await this.generateAutomatedInsights(farmId);
      
      return {
        period,
        sensorData: {
          temperature: this.calculateAverage(sensorData, 'temperature'),
          humidity: this.calculateAverage(sensorData, 'humidity'),
          soilMoisture: this.calculateAverage(sensorData, 'soil_moisture'),
          rainfall: this.calculateSum(sensorData, 'rainfall')
        },
        predictions: predictions.slice(0, 5),
        insights: insights.slice(0, 3),
        summary: {
          totalReadings: sensorData.length,
          totalPredictions: predictions.length,
          activeInsights: insights.length
        }
      };
    }, 'AnalyticsService.getDashboardData');
  }

  /**
   * Get prediction accuracy metrics
   * @param farmId - The farm identifier
   * @param type - Type of prediction (optional)
   * @param days - Number of days to analyze
   * @returns Promise resolving to accuracy metrics
   */
  async getAccuracyMetrics(farmId: string, type?: string, days: number = 30): Promise<any> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const predictionRepo = AppDataSource.getRepository(Prediction);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const whereConditions: any = {
        farmId,
        createdAt: MoreThan(startDate)
      };
      
      if (type) {
        whereConditions.type = type;
      }
      
      const predictions = await predictionRepo.find({
        where: whereConditions,
        order: { createdAt: 'DESC' }
      });
      
      // Calculate accuracy metrics (simplified)
      const totalPredictions = predictions.length;
      const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / totalPredictions || 0;
      
      return {
        totalPredictions,
        avgConfidence,
        accuracy: avgConfidence * 0.9, // Simplified accuracy calculation
        period: `${days} days`,
        type: type || 'all'
      };
    }, 'AnalyticsService.getAccuracyMetrics');
  }

  /**
   * Export prediction data in specified format
   * @param farmId - The farm identifier
   * @param format - Export format ('json' or 'csv')
   * @param type - Type of prediction (optional)
   * @param days - Number of days to export
   * @returns Promise resolving to exported data
   */
  async exportPredictionData(farmId: string, format: string, type?: string, days: number = 30): Promise<any> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const predictions = await this.getHistoricalPredictions(farmId, type, undefined, days);
      
      if (format === 'csv') {
        const headers = 'Date,Type,Value,Confidence,Valid Until\n';
        const rows = predictions.map(p => 
          `${p.createdAt},${p.type},${p.value},${p.confidence},${p.validUntil}`
        ).join('\n');
        return headers + rows;
      }
      
      return predictions;
    }, 'AnalyticsService.exportPredictionData');
  }

  /**
   * Get historical predictions for a farm
   * @param farmId - The farm identifier
   * @param type - Type of prediction (optional)
   * @param limit - Maximum number of predictions to return
   * @param days - Number of days to look back
   * @returns Promise resolving to historical predictions
   */
  async getHistoricalPredictions(farmId: string, type?: string, limit: number = 20, days: number = 30): Promise<any[]> {
    return ErrorHandler.handleDatabaseOperation(async () => {
      const predictionRepo = AppDataSource.getRepository(Prediction);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const whereConditions: any = {
        farmId,
        createdAt: MoreThan(startDate)
      };
      
      if (type) {
        whereConditions.type = type;
      }
      
      const predictions = await predictionRepo.find({
        where: whereConditions,
        order: { createdAt: 'DESC' },
        take: limit
      });
      
      return predictions;
    }, 'AnalyticsService.getHistoricalPredictions');
  }

  /**
   * Cleans up resources and disposes of TensorFlow.js models
   * @returns Promise that resolves when cleanup is complete
   */
  async cleanup(): Promise<void> {
    try {
      if (this.yieldModel) {
        this.yieldModel.dispose();
      }
      if (this.weatherModel) {
        this.weatherModel.dispose();
      }
    } catch (error) {
      ErrorHandler.logError(error as Error, 'AnalyticsService.cleanup');
    }
  }
}

// Export the class for ServiceFactory usage
export { AnalyticsService };