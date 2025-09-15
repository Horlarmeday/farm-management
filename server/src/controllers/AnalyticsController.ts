import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services/ServiceFactory';
import { ApiResponse } from '../types/api.types';

export class AnalyticsController {
  private analyticsService = ServiceFactory.getInstance().getAnalyticsService();

  // Get yield prediction for a farm
  async getYieldPrediction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { cropType = 'general' } = req.query;
      
      const prediction = await this.analyticsService.predictYield(farmId, cropType as string);
      
      res.json({
        success: true,
        message: 'Yield prediction generated successfully',
        data: prediction
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error generating yield prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate yield prediction',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Get weather forecast for a farm
  async getWeatherForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { days = 7 } = req.query;
      
      const forecast = await this.analyticsService.generateWeatherForecast(farmId, parseInt(days as string));
      
      res.json({
        success: true,
        message: 'Weather forecast generated successfully',
        data: {
          farmId,
          forecast,
          generatedAt: new Date(),
          validFor: `${days} days`
        }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error generating weather forecast:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate weather forecast',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Get automated insights for a farm
  async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { type } = req.query;
      
      const insights = await this.analyticsService.generateAutomatedInsights(farmId);
      
      // Filter by type if specified
      const filteredInsights = type ? insights.filter(insight => insight.type === type) : insights;
      
      res.json({
        success: true,
        message: 'Automated insights generated successfully',
        data: {
          farmId,
          insights: filteredInsights,
          generatedAt: new Date(),
          totalInsights: filteredInsights.length
        }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error generating automated insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate automated insights',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Get historical predictions
  async getHistoricalPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { type, limit = 20, days = 30 } = req.query;
      
      const predictions = await this.analyticsService.getHistoricalPredictions(
        farmId,
        type as string,
        parseInt(limit as string),
        parseInt(days as string)
      );
      
      res.json({
        success: true,
        message: 'Historical predictions retrieved successfully',
        data: {
          farmId,
          predictions,
          period: `${days} days`,
          total: predictions.length
        }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error getting historical predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get historical predictions',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Train yield prediction model
  async trainYieldModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      
      // This is a long-running operation, so we'll start it asynchronously
      this.analyticsService.trainYieldModel(farmId)
        .then(() => {
          console.log(`Yield model training completed for farm ${farmId}`);
        })
        .catch((error) => {
          console.error(`Yield model training failed for farm ${farmId}:`, error);
        });
      
      res.json({
        success: true,
        message: 'Yield model training started successfully',
        data: {
          farmId,
          status: 'training_started',
          estimatedDuration: '10-30 minutes'
        }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error starting yield model training:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start yield model training',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Get analytics dashboard data
  async getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { period = '7d' } = req.query;
      
      const dashboardData = await this.analyticsService.getDashboardData(farmId, period as string);
      
      res.json({
        success: true,
        message: 'Analytics dashboard data retrieved successfully',
        data: dashboardData
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error getting analytics dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics dashboard data',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Get prediction accuracy metrics
  async getAccuracyMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { type, days = 30 } = req.query;
      
      const metrics = await this.analyticsService.getAccuracyMetrics(
        farmId, 
        type as string, 
        parseInt(days as string)
      );
      
      res.json({
        success: true,
        message: 'Prediction accuracy metrics retrieved successfully',
        data: {
          farmId,
          metrics,
          generatedAt: new Date()
        }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error('Error getting prediction accuracy metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get prediction accuracy metrics',
        error: error.message
      } as ApiResponse<null>);
    }
  }

  // Export prediction data
  async exportPredictionData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { farmId } = req.params;
      const { format = 'json', type, days = 30 } = req.query;
      
      const exportData = await this.analyticsService.exportPredictionData(
        farmId,
        format as string,
        type as string,
        parseInt(days as string)
      );
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="predictions_${farmId}_${Date.now()}.csv"`);
        res.send(exportData);
      } else {
        res.json({
          success: true,
          message: 'Prediction data exported successfully',
          data: exportData
        } as ApiResponse<any>);
      }
    } catch (error: any) {
      console.error('Error exporting prediction data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export prediction data',
        error: error.message
      } as ApiResponse<null>);
    }
  }
}