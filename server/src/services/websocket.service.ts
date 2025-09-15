import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { Farm } from '../entities/Farm';

export interface AuthenticatedSocket extends Socket {
  user?: User;
  farmId?: string;
}

export interface RealTimeEvent {
  type: string;
  farmId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export interface FarmAlert {
  id: string;
  farmId: string;
  type: 'weather' | 'livestock' | 'crop' | 'equipment' | 'financial' | 'iot_sensor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export interface IoTSensorData {
  sensorId: string;
  farmId: string;
  type: string;
  value: number;
  unit: string;
  location?: string;
  timestamp: Date;
  metadata?: {
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
    [key: string]: any;
  };
}

export interface DashboardUpdate {
  farmId: string;
  type: 'livestock_count' | 'crop_status' | 'weather_data' | 'financial_summary' | 'equipment_status';
  data: any;
  timestamp: Date;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // farmId -> Set of socketIds
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.cors.origins,
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { id: decoded.userId },
          relations: ['farms']
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        socket.farmId = socket.handshake.query.farmId as string;
        
        // Verify user has access to the farm
        if (socket.farmId) {
          const hasAccess = user.farmUsers.some(farmUser => farmUser.farmId === socket.farmId);
          if (!hasAccess) {
            return next(new Error('Access denied to farm'));
          }
        }

        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: any) => {
      console.log(`🔌 User ${socket.user.id} connected to farm ${socket.farmId}`);

      // Join farm room
      if (socket.farmId) {
        socket.join(`farm:${socket.farmId}`);
        this.addUserToFarm(socket.farmId, socket.id);
      }

      // Store user socket mapping
      this.userSockets.set(socket.user.id, socket.id);

      // Handle real-time events
      socket.on('subscribe_to_alerts', (data: { farmId: string }) => {
        socket.join(`alerts:${data.farmId}`);
      });

      socket.on('subscribe_to_iot', (data: { farmId: string; sensorTypes?: string[] }) => {
        socket.join(`iot:${data.farmId}`);
        if (data.sensorTypes) {
          data.sensorTypes.forEach(type => {
            socket.join(`iot:${data.farmId}:${type}`);
          });
        }
      });

      socket.on('subscribe_to_dashboard', (data: { farmId: string }) => {
        socket.join(`dashboard:${data.farmId}`);
      });

      socket.on('request_farm_status', async (data: { farmId: string }) => {
        try {
          const farmStatus = await this.getFarmStatus(data.farmId);
          socket.emit('farm_status', farmStatus);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get farm status' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.user.id} disconnected from farm ${socket.farmId}`);
        
        if (socket.farmId) {
          this.removeUserFromFarm(socket.farmId, socket.id);
        }
        
        this.userSockets.delete(socket.user.id);
      });
    });
  }

  // Farm alert broadcasting
  /**
   * Broadcasts an alert to all connected clients in the affected farm
   * @param alert - The farm alert object containing alert details
   */
  public broadcastAlert(alert: FarmAlert): void {
    this.io.to(`alerts:${alert.farmId}`).emit('farm_alert', alert);
    this.io.to(`farm:${alert.farmId}`).emit('notification', {
      type: 'alert',
      data: alert
    });
  }

  // IoT sensor data broadcasting
  /**
   * Broadcasts IoT sensor data to all connected clients in the farm
   * @param sensorData - The sensor data object containing readings and metadata
   */
  public broadcastSensorData(sensorData: IoTSensorData): void {
    this.io.to(`iot:${sensorData.farmId}`).emit('sensor_data', sensorData);
    this.io.to(`iot:${sensorData.farmId}:${sensorData.type}`).emit('sensor_data', sensorData);
    
    // Also send to dashboard if it's a critical reading
    this.io.to(`dashboard:${sensorData.farmId}`).emit('dashboard_update', {
      type: 'sensor_reading',
      data: sensorData,
      timestamp: new Date()
    });
  }

  // Dashboard updates
  /**
   * Broadcasts dashboard updates to all connected clients
   * @param update - The dashboard update object containing new data
   */
  public broadcastDashboardUpdate(update: DashboardUpdate): void {
    this.io.to(`dashboard:${update.farmId}`).emit('dashboard_update', update);
    this.io.to(`farm:${update.farmId}`).emit('live_update', update);
  }

  // Send notification to specific user
  /**
   * Sends a notification to a specific user via WebSocket
   * @param userId - The unique identifier of the target user
   * @param notification - The notification object to send
   */
  public sendNotificationToUser(userId: string, notification: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Send notification to all users in a farm
  /**
   * Sends a notification to all users connected to a specific farm
   * @param farmId - The unique identifier of the target farm
   * @param notification - The notification object to send
   */
  public sendNotificationToFarm(farmId: string, notification: any): void {
    this.io.to(`farm:${farmId}`).emit('notification', notification);
  }

  // Broadcast real-time event
  /**
   * Broadcasts a real-time event to all connected clients
   * @param event - The real-time event object to broadcast
   */
  public broadcastEvent(event: RealTimeEvent): void {
    this.io.to(`farm:${event.farmId}`).emit('real_time_event', event);
  }

  // Get connected users count for a farm
  /**
   * Gets the number of users currently connected to a specific farm
   * @param farmId - The unique identifier of the farm
   * @returns The number of connected users for the farm
   */
  public getFarmConnectedUsers(farmId: string): number {
    const users = this.connectedUsers.get(farmId);
    return users ? users.size : 0;
  }

  // Get all connected farms
  /**
   * Gets a list of all farms that have at least one connected user
   * @returns Array of farm IDs with connected users
   */
  public getConnectedFarms(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  private addUserToFarm(farmId: string, socketId: string): void {
    if (!this.connectedUsers.has(farmId)) {
      this.connectedUsers.set(farmId, new Set());
    }
    this.connectedUsers.get(farmId)!.add(socketId);
  }

  private removeUserFromFarm(farmId: string, socketId: string): void {
    const users = this.connectedUsers.get(farmId);
    if (users) {
      users.delete(socketId);
      if (users.size === 0) {
        this.connectedUsers.delete(farmId);
      }
    }
  }

  private async getFarmStatus(farmId: string): Promise<any> {
    try {
      const farmRepository = AppDataSource.getRepository(Farm);
      const farm = await farmRepository.findOne({
        where: { id: farmId },
        relations: ['animals', 'assets', 'birdBatches']
      });

      if (!farm) {
        throw new Error('Farm not found');
      }

      return {
        farmId,
        name: farm.name,
        status: 'active',
        connectedUsers: this.getFarmConnectedUsers(farmId),
        lastUpdate: new Date(),
        summary: {
          animals: farm.animals?.length || 0,
          assets: farm.assets?.length || 0,
          birdBatches: farm.birdBatches?.length || 0
        }
      };
    } catch (error) {
      console.error('Error getting farm status:', error);
      throw error;
    }
  }

  // Get Socket.IO instance for external use
  /**
   * Gets the Socket.IO server instance for advanced usage
   * @returns The Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

export { WebSocketService };