import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useWebSocket, WebSocketState } from '../hooks/useWebSocket';
import { webSocketService, FarmAlert, IoTSensorData, DashboardUpdate, NotificationPayload } from '../services/websocket.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WebSocketContextType {
  // Connection state
  connectionState: WebSocketState;
  currentFarmId: string | null;
  
  // Connection methods
  connect: (farmId: string) => Promise<void>;
  disconnect: () => void;
  switchFarm: (farmId: string) => Promise<void>;
  
  // Real-time data
  latestAlert: FarmAlert | null;
  latestSensorData: IoTSensorData | null;
  latestDashboardUpdate: DashboardUpdate | null;
  latestNotification: NotificationPayload | null;
  
  // Subscription methods
  subscribeToAlerts: (farmId: string) => void;
  subscribeToIoT: (farmId: string, sensorTypes?: string[]) => void;
  subscribeToDashboard: (farmId: string) => void;
  
  // Status methods
  requestFarmStatus: (farmId: string) => void;
  
  // Notification methods
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  defaultFarmId?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  defaultFarmId 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [currentFarmId, setCurrentFarmId] = useState<string | null>(defaultFarmId || null);
  
  // Real-time data state
  const [latestAlert, setLatestAlert] = useState<FarmAlert | null>(null);
  const [latestSensorData, setLatestSensorData] = useState<IoTSensorData | null>(null);
  const [latestDashboardUpdate, setLatestDashboardUpdate] = useState<DashboardUpdate | null>(null);
  const [latestNotification, setLatestNotification] = useState<NotificationPayload | null>(null);
  
  // WebSocket hook with auto-connect disabled (we'll manage it manually)
  const {
    isConnected,
    isConnecting,
    error,
    lastActivity,
    connect: wsConnect,
    disconnect: wsDisconnect,
    subscribe,
    requestFarmStatus: wsRequestFarmStatus,
    switchFarm: wsSwitchFarm
  } = useWebSocket({ 
    autoConnect: false,
    subscribeToAlerts: true,
    subscribeToIoT: true,
    subscribeToDashboard: true
  });

  const connectionState: WebSocketState = {
    isConnected,
    isConnecting,
    error,
    lastActivity
  };

  // Connect to WebSocket
  const connect = useCallback(async (farmId: string) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to connect to WebSocket');
    }
    
    setCurrentFarmId(farmId);
    await wsConnect(farmId);
  }, [isAuthenticated, wsConnect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    wsDisconnect();
    setCurrentFarmId(null);
    
    // Clear real-time data
    setLatestAlert(null);
    setLatestSensorData(null);
    setLatestDashboardUpdate(null);
    setLatestNotification(null);
  }, [wsDisconnect]);

  // Switch to different farm
  const switchFarm = useCallback(async (farmId: string) => {
    setCurrentFarmId(farmId);
    await wsSwitchFarm(farmId);
  }, [wsSwitchFarm]);

  // Subscribe to alerts
  const subscribeToAlerts = useCallback((farmId: string) => {
    webSocketService.subscribeToAlerts(farmId);
  }, []);

  // Subscribe to IoT data
  const subscribeToIoT = useCallback((farmId: string, sensorTypes?: string[]) => {
    webSocketService.subscribeToIoT(farmId, sensorTypes);
  }, []);

  // Subscribe to dashboard updates
  const subscribeToDashboard = useCallback((farmId: string) => {
    webSocketService.subscribeToDashboard(farmId);
  }, []);

  // Request farm status
  const requestFarmStatus = useCallback((farmId: string) => {
    wsRequestFarmStatus(farmId);
  }, [wsRequestFarmStatus]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setLatestNotification(null);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers: (() => void)[] = [];

    // Farm alerts
    unsubscribers.push(
      subscribe<FarmAlert>('farm_alert', (alert) => {
        setLatestAlert(alert);
        
        // Show toast notification for critical alerts
        if (alert.severity === 'critical' || alert.severity === 'high') {
          toast.error(`Farm Alert: ${alert.message}`, {
            description: `${alert.type} - ${alert.farmName}`,
            duration: 10000,
          });
        } else {
          toast.warning(`Farm Alert: ${alert.message}`, {
            description: `${alert.type} - ${alert.farmName}`,
            duration: 5000,
          });
        }
      })
    );

    // IoT sensor data
    unsubscribers.push(
      subscribe<IoTSensorData>('sensor_data', (data) => {
        setLatestSensorData(data);
        
        // Show toast for abnormal readings
        if (data.status === 'abnormal' || data.status === 'critical') {
          toast.warning(`Sensor Alert: ${data.type}`, {
            description: `${data.value} ${data.unit} - ${data.location}`,
            duration: 5000,
          });
        }
      })
    );

    // Dashboard updates
    unsubscribers.push(
      subscribe<DashboardUpdate>('dashboard_update', (update) => {
        setLatestDashboardUpdate(update);
      })
    );

    // Live updates
    unsubscribers.push(
      subscribe<DashboardUpdate>('live_update', (update) => {
        setLatestDashboardUpdate(update);
      })
    );

    // Notifications
    unsubscribers.push(
      subscribe<NotificationPayload>('notification', (notification) => {
        setLatestNotification(notification);
        
        // Show browser notification if permission granted
        if (notification.type === 'push' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: notification.id,
            requireInteraction: notification.priority === 'high'
          });
        }
        
        // Show toast notification
        const toastFn = notification.priority === 'high' ? toast.error : 
                       notification.priority === 'medium' ? toast.warning : toast.info;
        
        toastFn(notification.title, {
          description: notification.body,
          duration: notification.priority === 'high' ? 10000 : 5000,
        });
      })
    );

    // Connection status changes
    unsubscribers.push(
      subscribe('connect', () => {
        toast.success('Connected to real-time updates');
      })
    );

    unsubscribers.push(
      subscribe('disconnect', () => {
        toast.error('Disconnected from real-time updates');
      })
    );

    unsubscribers.push(
      subscribe('reconnect', () => {
        toast.success('Reconnected to real-time updates');
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [isConnected, subscribe]);

  // Auto-connect when user is authenticated and has a default farm
  useEffect(() => {
    if (isAuthenticated && user && defaultFarmId && !isConnected && !isConnecting) {
      connect(defaultFarmId).catch(error => {
        console.error('Failed to auto-connect to WebSocket:', error);
      });
    }
  }, [isAuthenticated, user, defaultFarmId, isConnected, isConnecting, connect]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, isConnected, disconnect]);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      toast.error('WebSocket Connection Error', {
        description: error,
        duration: 5000,
      });
    }
  }, [error]);

  const contextValue: WebSocketContextType = {
    connectionState,
    currentFarmId,
    connect,
    disconnect,
    switchFarm,
    latestAlert,
    latestSensorData,
    latestDashboardUpdate,
    latestNotification,
    subscribeToAlerts,
    subscribeToIoT,
    subscribeToDashboard,
    requestFarmStatus,
    clearNotifications
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

// Hook for connection status
export const useConnectionStatus = () => {
  const { connectionState } = useWebSocketContext();
  return connectionState;
};

// Hook for real-time alerts
export const useRealTimeAlerts = () => {
  const { latestAlert } = useWebSocketContext();
  return { latestAlert };
};

// Hook for real-time sensor data
export const useRealTimeSensorData = () => {
  const { latestSensorData } = useWebSocketContext();
  return { latestSensorData };
};

// Hook for real-time dashboard updates
export const useRealTimeDashboard = () => {
  const { latestDashboardUpdate } = useWebSocketContext();
  return { latestDashboardUpdate };
};

// Hook for real-time notifications
export const useRealTimeNotifications = () => {
  const { latestNotification, clearNotifications } = useWebSocketContext();
  return { latestNotification, clearNotifications };
};