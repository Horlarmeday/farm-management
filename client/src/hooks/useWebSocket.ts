import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SensorReading, SensorType } from '@/types/iot';

export interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  currentFarm: string | null;
}

interface FarmAlert {
  id: string;
  type: 'weather' | 'livestock' | 'crop' | 'equipment' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  farmId: string;
  isRead: boolean;
}

// Use SensorReading from types instead of local SensorData
type SensorData = SensorReading & {
  farmId: string;
  type: SensorType;
  location: {
    x: number;
    y: number;
  };
  timestamp: string;
}

interface DashboardUpdate {
  id: string;
  type: 'increase' | 'decrease' | 'livestock_count' | 'crop_status' | 'weather_alert' | 'task_completion';
  metric: string;
  description: string;
  value: number;
  unit: string;
  farmId: string;
  timestamp: Date;
}

interface RealTimeEvent {
  id: string;
  type: 'system' | 'user' | 'sensor' | 'alert';
  event: string;
  data: any;
  timestamp: Date;
  farmId: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  farmId: string;
  actionUrl?: string;
}

interface FarmStatus {
  farmId: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: Date;
  activeDevices: number;
  alerts: number;
  criticalIssues: number;
}

// Shared WebSocket manager to reduce useEffect usage
export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: Socket | null = null;
  private isConnected = false;
  private isConnecting = false;
  private error: string | null = null;
  private currentFarm: string | null = null;
  private connectionListeners = new Set<(state: WebSocketState) => void>();
  private eventListeners = new Map<string, Set<(data: any) => void>>();
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private notifyConnectionListeners() {
    const state: WebSocketState = {
      socket: this.socket,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      error: this.error,
      currentFarm: this.currentFarm
    };
    this.connectionListeners.forEach(listener => listener(state));
  }

  private notifyEventListeners(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.isConnecting = false;
      this.error = null;
      this.notifyConnectionListeners();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.isConnecting = false;
      this.notifyConnectionListeners();
    });

    this.socket.on('connect_error', (error) => {
      this.error = error.message;
      this.isConnecting = false;
      this.notifyConnectionListeners();
    });

    // Setup event forwarding
    const events = [
      'farm_alert',
      'sensor_data',
      'dashboard_update',
      'real_time_event',
      'notification',
      'farm_status'
    ];

    events.forEach(event => {
      this.socket?.on(event, (data) => {
        this.notifyEventListeners(event, data);
      });
    });
  }

  private startConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    this.connectionCheckInterval = setInterval(() => {
      if (this.socket && !this.isConnected && !this.isConnecting) {
        this.socket.connect();
      }
    }, 5000);
  }

  connect(url?: string): void {
    if (this.socket?.connected) return;

    this.isConnecting = true;
    this.error = null;
    this.notifyConnectionListeners();

    const socketUrl = url || import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5058';
    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupSocketListeners();
    this.startConnectionCheck();
  }

  disconnect(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.error = null;
    this.currentFarm = null;
    this.notifyConnectionListeners();
  }

  switchFarm(farmId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_farm', farmId);
      if (this.currentFarm) {
        this.socket.emit('leave_farm', this.currentFarm);
      }
      this.currentFarm = farmId;
      this.notifyConnectionListeners();
    }
  }

  subscribeToConnection(callback: (state: WebSocketState) => void) {
    this.connectionListeners.add(callback);
    // Call immediately with current state
    callback({
      socket: this.socket,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      error: this.error,
      currentFarm: this.currentFarm
    });

    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  subscribeToEvent(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

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

  getCurrentState(): WebSocketState {
    return {
      socket: this.socket,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      error: this.error,
      currentFarm: this.currentFarm
    };
  }

  getCurrentFarmId(): string | null {
    return this.currentFarm;
  }

  getState(): WebSocketState {
    return this.getCurrentState();
  }

  subscribe(callback: (state: WebSocketState) => void) {
    return this.subscribeToConnection(callback);
  }
}

// Hook for using the WebSocket manager
export const useWebSocket = () => {
  const [state, setState] = useState<WebSocketState>(() => 
    WebSocketManager.getInstance().getCurrentState()
  );

  const connect = useCallback((url?: string) => {
    WebSocketManager.getInstance().connect(url);
  }, []);

  const disconnect = useCallback(() => {
    WebSocketManager.getInstance().disconnect();
  }, []);

  const switchFarm = useCallback((farmId: string) => {
    WebSocketManager.getInstance().switchFarm(farmId);
  }, []);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    
    // Subscribe to connection state changes
    const unsubscribe = manager.subscribeToConnection(setState);
    
    // Auto-connect on mount
    manager.connect();
    
    return () => {
      unsubscribe();
      // Don't disconnect on unmount as other components might be using it
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchFarm
  };
};

// Hook for subscribing to specific events
export const useWebSocketEvent = <T = any>(event: string, callback: (data: T) => void) => {
  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent(event, callback);
    return unsubscribe;
  }, [event, callback]);
};

export interface UseWebSocketOptions {
  farmId?: string;
  autoConnect?: boolean;
  subscribeToAlerts?: boolean;
  subscribeToIoT?: boolean;
  subscribeToDashboard?: boolean;
  sensorTypes?: string[];
}

// Enhanced WebSocket hook with manager integration
export const useWebSocketWithService = (options: UseWebSocketOptions = {}) => {
  const {
    farmId,
    autoConnect = true
  } = options;

  const manager = WebSocketManager.getInstance();
  const [state, setState] = useState<WebSocketState>(() => manager.getState());

  // Connect to WebSocket
  const connect = useCallback(async (targetFarmId?: string) => {
    const connectFarmId = targetFarmId || farmId;
    if (connectFarmId) {
      await manager.connect(connectFarmId);
    }
  }, [farmId, manager]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    manager.disconnect();
  }, [manager]);

  // Switch to different farm
  const switchFarm = useCallback(async (newFarmId: string) => {
    await manager.switchFarm(newFarmId);
  }, [manager]);

  // Subscribe to state changes and auto-connect
  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setState(newState);
    });

    if (autoConnect && farmId && !manager.getState().isConnected) {
      connect();
    }

    return unsubscribe;
  }, [manager, autoConnect, farmId, connect]);

  return {
    ...state,
    connect,
    disconnect,
    switchFarm,
    currentFarmId: manager.getCurrentFarmId()
  };
};

// Hook for farm alerts
export const useFarmAlerts = (farmId?: string) => {
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  }, []);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent('farm_alert', (alert: FarmAlert) => {
      if (!farmId || alert.farmId === farmId) {
        setAlerts(prev => [alert, ...prev]);
      }
    });
    setLoading(false);
    return unsubscribe;
  }, [farmId]);

  return {
    alerts,
    loading,
    error,
    markAsRead,
    clearAlert
  };
};

// Hook for IoT sensor data
export const useIoTSensorData = (farmId?: string, sensorType?: string) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestReading, setLatestReading] = useState<SensorData | null>(null);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent('sensor_data', (data: SensorData) => {
      if ((!farmId || data.farmId === farmId) && (!sensorType || data.type === sensorType)) {
        setLatestReading(data);
        setSensorData(prev => [data, ...prev.slice(0, 99)]); // Keep last 100 readings
      }
    });

    return unsubscribe;
  }, [farmId, sensorType]);

  const getAverageValue = useCallback((timeRange: number = 3600000) => { // Default 1 hour
    const cutoff = new Date(Date.now() - timeRange);
    const recentData = sensorData.filter(data => new Date(data.timestamp) > cutoff);
    
    if (recentData.length === 0) return null;
    
    const sum = recentData.reduce((acc, data) => acc + data.value, 0);
    return sum / recentData.length;
  }, [sensorData]);

  const sensorsByType = useMemo(() => {
    const grouped: Record<string, SensorData[]> = {};
    sensorData.forEach(data => {
      if (!grouped[data.type]) {
        grouped[data.type] = [];
      }
      grouped[data.type].push(data);
    });
    return grouped;
  }, [sensorData]);

  const getSensorDataByType = useCallback((type: string) => {
    return sensorData.filter(data => data.type === type);
  }, [sensorData]);

  return {
    sensorData,
    latestReading,
    getAverageValue,
    sensorsByType,
    getSensorDataByType
  };
};

// Hook for dashboard updates
export const useDashboardUpdates = (farmId?: string) => {
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<DashboardUpdate | null>(null);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent('dashboard_update', (update: DashboardUpdate) => {
      if (!farmId || update.farmId === farmId) {
        setLatestUpdate(update);
        setUpdates(prev => [update, ...prev.slice(0, 29)]); // Keep last 30 updates
      }
    });

    return unsubscribe;
  }, [farmId]);

  const getUpdatesByType = useCallback((type: DashboardUpdate['type']) => {
    return updates.filter(update => update.type === type);
  }, [updates]);

  return {
    updates,
    latestUpdate,
    getUpdatesByType
  };
};

// Hook for real-time events
export const useRealTimeEvents = (farmId?: string, eventTypes?: string[]) => {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<RealTimeEvent | null>(null);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent('real_time_event', (event: RealTimeEvent) => {
      if ((!farmId || event.farmId === farmId) && (!eventTypes || eventTypes.includes(event.type))) {
        setLatestEvent(event);
        setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
      }
    });

    return unsubscribe;
  }, [farmId, eventTypes]);

  const getEventsByType = useCallback((type: string) => {
    return events.filter(event => event.type === type);
  }, [events]);

  return {
    events,
    latestEvent,
    getEventsByType
  };
};

// Hook for notifications
export const useNotifications = (farmId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent('notification', (notification: Notification) => {
      if (!farmId || notification.farmId === farmId) {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    return unsubscribe;
  }, [farmId]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  };
};

// Hook for farm status monitoring
export const useFarmStatus = (farmId?: string) => {
  const [farmStatus, setFarmStatus] = useState<FarmStatus | null>(null);
  const [statusHistory, setStatusHistory] = useState<FarmStatus[]>([]);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();
    const unsubscribe = manager.subscribeToEvent('farm_status', (status: FarmStatus) => {
      if (!farmId || status.farmId === farmId) {
        setFarmStatus(status);
        setStatusHistory(prev => [status, ...prev.slice(0, 19)]); // Keep last 20 status updates
      }
    });

    return unsubscribe;
  }, [farmId]);

  const isOnline = farmStatus?.status === 'online';
  const hasAlerts = (farmStatus?.alerts || 0) > 0;
  const hasCriticalIssues = (farmStatus?.criticalIssues || 0) > 0;

  return {
    farmStatus,
    statusHistory,
    isOnline,
    hasAlerts,
    hasCriticalIssues
  };
};