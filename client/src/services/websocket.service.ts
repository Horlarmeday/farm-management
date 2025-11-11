import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { API_CONFIG } from '../config/api.config';

export interface FarmAlert {
  id: string;
  farmId: string;
  farmName: string;
  type: 'weather' | 'livestock' | 'crop' | 'equipment' | 'financial' | 'iot_sensor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  location?: string;
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
  status: 'normal' | 'abnormal' | 'critical';
  timestamp: Date;
}

export interface DashboardUpdate {
  id: string;
  farmId: string;
  type: 'increase' | 'decrease';
  metric: string;
  description: string;
  value: number;
  unit: string;
  timestamp: Date;
  data?: any;
}

export interface RealTimeEvent {
  type: string;
  farmId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export interface NotificationPayload {
  id: string;
  type: 'alert' | 'update' | 'reminder' | 'system' | 'push';
  title: string;
  body: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

type EventCallback<T = any> = (data: T) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners = new Map<string, Set<EventCallback>>();
  private currentFarmId: string | null = null;

  // Connection management
  public async connect(farmId?: string): Promise<void> {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    this.isConnecting = true;
    this.currentFarmId = farmId || null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const serverUrl = API_CONFIG.BASE_URL;

      this.socket = io(serverUrl, {
        auth: {
          token,
        },
        query: farmId ? { farmId } : {},
        transports: ['websocket', 'polling'],
        timeout: API_CONFIG.REQUEST.TIMEOUT,
        forceNew: true,
      });

      this.setupEventHandlers();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          console.log('🔌 Connected to WebSocket server');
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          reject(error);
        });
      });
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to WebSocket:', error);
      throw error;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentFarmId = null;
    this.eventListeners.clear();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event subscription management
  public subscribe<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }

  // Farm-specific subscriptions
  public subscribeToAlerts(farmId: string): void {
    if (this.socket) {
      this.socket.emit('subscribe_to_alerts', { farmId });
    }
  }

  public subscribeToIoT(farmId: string, sensorTypes?: string[]): void {
    if (this.socket) {
      this.socket.emit('subscribe_to_iot', { farmId, sensorTypes });
    }
  }

  public subscribeToDashboard(farmId: string): void {
    if (this.socket) {
      this.socket.emit('subscribe_to_dashboard', { farmId });
    }
  }

  // Request farm status
  public requestFarmStatus(farmId: string): void {
    if (this.socket) {
      this.socket.emit('request_farm_status', { farmId });
    }
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0;

      // Re-subscribe to farm events if we have a current farm
      if (this.currentFarmId) {
        this.subscribeToAlerts(this.currentFarmId);
        this.subscribeToIoT(this.currentFarmId);
        this.subscribeToDashboard(this.currentFarmId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Farm alerts
    this.socket.on('farm_alert', (alert: FarmAlert) => {
      this.notifyListeners('farm_alert', alert);
      this.handleFarmAlert(alert);
    });

    // IoT sensor data
    this.socket.on('sensor_data', (data: IoTSensorData) => {
      this.notifyListeners('sensor_data', data);
    });

    // Dashboard updates
    this.socket.on('dashboard_update', (update: DashboardUpdate) => {
      this.notifyListeners('dashboard_update', update);
    });

    this.socket.on('live_update', (update: DashboardUpdate) => {
      this.notifyListeners('live_update', update);
    });

    // Real-time events
    this.socket.on('real_time_event', (event: RealTimeEvent) => {
      this.notifyListeners('real_time_event', event);
    });

    // Notifications
    this.socket.on('notification', (notification: NotificationPayload) => {
      this.notifyListeners('notification', notification);
      this.handleNotification(notification);
    });

    // Farm status response
    this.socket.on('farm_status', (status: any) => {
      this.notifyListeners('farm_status', status);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('🔌 WebSocket error:', error);
      this.notifyListeners('error', error);
    });
  }

  // Handle farm alerts with notifications
  private handleFarmAlert(alert: FarmAlert): void {
    const severityConfig = {
      low: { duration: 4000, style: 'info' as const },
      medium: { duration: 6000, style: 'info' as const },
      high: { duration: 8000, style: 'warning' as const },
      critical: { duration: 0, style: 'error' as const }, // Persistent
    };

    const config = severityConfig[alert.severity];

    // Use proper toast method based on style
    const toastOptions = {
      description: alert.message,
      duration: config.duration,
      action: alert.data?.actionUrl
        ? {
            label: 'View Details',
            onClick: () => window.open(alert.data.actionUrl, '_blank'),
          }
        : undefined,
    };

    switch (config.style) {
      case 'error':
        toast.error(alert.title, toastOptions);
        break;
      case 'warning':
        toast.warning(alert.title, toastOptions);
        break;
      case 'info':
        toast.info(alert.title, toastOptions);
        break;
      default:
        toast(alert.title, toastOptions);
        break;
    }

    // Show browser notification if supported and permitted
    this.showBrowserNotification({
      title: `🚨 ${alert.title}`,
      body: alert.message,
      tag: `farm-alert-${alert.type}`,
      data: alert,
    });
  }

  // Handle general notifications
  private handleNotification(notification: NotificationPayload): void {
    const typeConfig = {
      alert: { style: 'error' as const, icon: '🚨' },
      update: { style: 'info' as const, icon: '📊' },
      reminder: { style: 'warning' as const, icon: '⏰' },
      system: { style: 'info' as const, icon: '🔧' },
      push: { style: 'info' as const, icon: '🔔' },
    };

    const config = typeConfig[notification.type] || typeConfig.system;

    const toastOptions = {
      description: notification.message,
      action: notification.actions?.[0]
        ? {
            label: notification.actions[0].title,
            onClick: () => {
              // Handle action - could emit back to server or navigate
              this.socket?.emit('notification_action', {
                action: notification.actions![0].action,
                data: notification.data,
              });
            },
          }
        : undefined,
    };

    const title = `${config.icon} ${notification.title}`;

    switch (config.style) {
      case 'error':
        toast.error(title, toastOptions);
        break;
      case 'warning':
        toast.warning(title, toastOptions);
        break;
      case 'info':
        toast.info(title, toastOptions);
        break;
      default:
        toast(title, toastOptions);
        break;
    }
  }

  // Browser notification support
  private async showBrowserNotification(options: {
    title: string;
    body: string;
    tag?: string;
    data?: any;
  }): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: '/icons/farm-icon.png',
        badge: '/icons/badge-icon.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle notification click - could navigate to relevant page
        if (options.data?.actionUrl) {
          window.location.href = options.data.actionUrl;
        }
      };
    }
  }

  // Reconnection logic
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      toast.error('Connection lost', {
        description: 'Unable to reconnect to server. Please refresh the page.',
        duration: 0,
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`,
    );

    setTimeout(() => {
      if (this.currentFarmId) {
        this.connect(this.currentFarmId).catch(console.error);
      }
    }, delay);
  }

  // Notify event listeners
  private notifyListeners<T>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get current farm ID
  public getCurrentFarmId(): string | null {
    return this.currentFarmId;
  }

  // Switch to different farm
  public async switchFarm(farmId: string): Promise<void> {
    if (this.currentFarmId === farmId) {
      return;
    }

    this.disconnect();
    await this.connect(farmId);
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export { WebSocketService };
