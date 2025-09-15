import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, FarmAlert, IoTSensorData, DashboardUpdate, RealTimeEvent, NotificationPayload } from '../services/websocket.service';

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastActivity: Date | null;
}

export interface UseWebSocketOptions {
  farmId?: string;
  autoConnect?: boolean;
  subscribeToAlerts?: boolean;
  subscribeToIoT?: boolean;
  subscribeToDashboard?: boolean;
  sensorTypes?: string[];
}

// Main WebSocket hook
export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    farmId,
    autoConnect = true,
    subscribeToAlerts = true,
    subscribeToIoT = true,
    subscribeToDashboard = true,
    sensorTypes
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastActivity: null
  });

  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Connect to WebSocket
  const connect = useCallback(async (targetFarmId?: string) => {
    const connectFarmId = targetFarmId || farmId;
    
    if (!connectFarmId) {
      setState(prev => ({ ...prev, error: 'No farm ID provided' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      await webSocketService.connect(connectFarmId);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastActivity: new Date()
      }));

      // Set up subscriptions
      if (subscribeToAlerts) {
        webSocketService.subscribeToAlerts(connectFarmId);
      }
      if (subscribeToIoT) {
        webSocketService.subscribeToIoT(connectFarmId, sensorTypes);
      }
      if (subscribeToDashboard) {
        webSocketService.subscribeToDashboard(connectFarmId);
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [farmId, subscribeToAlerts, subscribeToIoT, subscribeToDashboard, sensorTypes]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    
    // Clean up event listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastActivity: null
    });
  }, []);

  // Subscribe to events
  const subscribe = useCallback(<T = any>(event: string, callback: (data: T) => void) => {
    const unsubscribe = webSocketService.subscribe(event, callback);
    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  // Request farm status
  const requestFarmStatus = useCallback((targetFarmId?: string) => {
    const requestFarmId = targetFarmId || farmId;
    if (requestFarmId) {
      webSocketService.requestFarmStatus(requestFarmId);
    }
  }, [farmId]);

  // Switch to different farm
  const switchFarm = useCallback(async (newFarmId: string) => {
    setState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      await webSocketService.switchFarm(newFarmId);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastActivity: new Date()
      }));

      // Set up subscriptions for new farm
      if (subscribeToAlerts) {
        webSocketService.subscribeToAlerts(newFarmId);
      }
      if (subscribeToIoT) {
        webSocketService.subscribeToIoT(newFarmId, sensorTypes);
      }
      if (subscribeToDashboard) {
        webSocketService.subscribeToDashboard(newFarmId);
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to switch farm'
      }));
    }
  }, [subscribeToAlerts, subscribeToIoT, subscribeToDashboard, sensorTypes]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && farmId) {
      connect();
    }

    return () => {
      // Clean up on unmount
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    };
  }, [autoConnect, farmId, connect]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = webSocketService.isConnected();
      setState(prev => {
        if (prev.isConnected !== isConnected) {
          return { ...prev, isConnected };
        }
        return prev;
      });
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    subscribe,
    requestFarmStatus,
    switchFarm,
    currentFarmId: webSocketService.getCurrentFarmId()
  };
};

// Hook for farm alerts
export const useFarmAlerts = (farmId?: string) => {
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<FarmAlert | null>(null);
  const { subscribe } = useWebSocket({ farmId, subscribeToAlerts: true });

  useEffect(() => {
    const unsubscribe = subscribe<FarmAlert>('farm_alert', (alert) => {
      setLatestAlert(alert);
      setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    });

    return unsubscribe;
  }, [subscribe]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setLatestAlert(null);
  }, []);

  return {
    alerts,
    latestAlert,
    clearAlerts
  };
};

// Hook for IoT sensor data
export const useIoTSensorData = (farmId?: string, sensorTypes?: string[]) => {
  const [sensorData, setSensorData] = useState<IoTSensorData[]>([]);
  const [latestReading, setLatestReading] = useState<IoTSensorData | null>(null);
  const [sensorsByType, setSensorsByType] = useState<Record<string, IoTSensorData[]>>({});
  
  const { subscribe } = useWebSocket({ 
    farmId, 
    subscribeToIoT: true, 
    sensorTypes 
  });

  useEffect(() => {
    const unsubscribe = subscribe<IoTSensorData>('sensor_data', (data) => {
      setLatestReading(data);
      
      // Add to general sensor data (keep last 100 readings)
      setSensorData(prev => [data, ...prev.slice(0, 99)]);
      
      // Group by sensor type
      setSensorsByType(prev => ({
        ...prev,
        [data.type]: [data, ...(prev[data.type] || []).slice(0, 19)] // Keep last 20 per type
      }));
    });

    return unsubscribe;
  }, [subscribe]);

  const getSensorDataByType = useCallback((type: string) => {
    return sensorsByType[type] || [];
  }, [sensorsByType]);

  const getLatestBySensorId = useCallback((sensorId: string) => {
    return sensorData.find(data => data.sensorId === sensorId) || null;
  }, [sensorData]);

  return {
    sensorData,
    latestReading,
    sensorsByType,
    getSensorDataByType,
    getLatestBySensorId
  };
};

// Hook for dashboard updates
export const useDashboardUpdates = (farmId?: string) => {
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<DashboardUpdate | null>(null);
  const [updatesByType, setUpdatesByType] = useState<Record<string, DashboardUpdate[]>>({});
  
  const { subscribe } = useWebSocket({ 
    farmId, 
    subscribeToDashboard: true 
  });

  useEffect(() => {
    const unsubscribeDashboard = subscribe<DashboardUpdate>('dashboard_update', (update) => {
      setLatestUpdate(update);
      setUpdates(prev => [update, ...prev.slice(0, 49)]);
      
      setUpdatesByType(prev => ({
        ...prev,
        [update.type]: [update, ...(prev[update.type] || []).slice(0, 9)]
      }));
    });

    const unsubscribeLive = subscribe<DashboardUpdate>('live_update', (update) => {
      setLatestUpdate(update);
      setUpdates(prev => [update, ...prev.slice(0, 49)]);
    });

    return () => {
      unsubscribeDashboard();
      unsubscribeLive();
    };
  }, [subscribe]);

  const getUpdatesByType = useCallback((type: string) => {
    return updatesByType[type] || [];
  }, [updatesByType]);

  return {
    updates,
    latestUpdate,
    updatesByType,
    getUpdatesByType
  };
};

// Hook for real-time events
export const useRealTimeEvents = (farmId?: string) => {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<RealTimeEvent | null>(null);
  const { subscribe } = useWebSocket({ farmId });

  useEffect(() => {
    const unsubscribe = subscribe<RealTimeEvent>('real_time_event', (event) => {
      setLatestEvent(event);
      setEvents(prev => [event, ...prev.slice(0, 99)]);
    });

    return unsubscribe;
  }, [subscribe]);

  return {
    events,
    latestEvent
  };
};

// Hook for notifications
export const useNotifications = (farmId?: string) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [latestNotification, setLatestNotification] = useState<NotificationPayload | null>(null);
  const { subscribe } = useWebSocket({ farmId });

  useEffect(() => {
    const unsubscribe = subscribe<NotificationPayload>('notification', (notification) => {
      setLatestNotification(notification);
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    });

    return unsubscribe;
  }, [subscribe]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestNotification(null);
  }, []);

  return {
    notifications,
    latestNotification,
    clearNotifications
  };
};

// Hook for farm status
export const useFarmStatus = (farmId?: string) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { subscribe, requestFarmStatus, isConnected } = useWebSocket({ farmId });

  useEffect(() => {
    const unsubscribe = subscribe('farm_status', (farmStatus) => {
      setStatus(farmStatus);
      setLoading(false);
    });

    return unsubscribe;
  }, [subscribe]);

  const refreshStatus = useCallback(() => {
    if (isConnected && farmId) {
      setLoading(true);
      requestFarmStatus(farmId);
    }
  }, [isConnected, farmId, requestFarmStatus]);

  // Auto-refresh on connection
  useEffect(() => {
    if (isConnected && farmId) {
      refreshStatus();
    }
  }, [isConnected, farmId, refreshStatus]);

  return {
    status,
    loading,
    refreshStatus
  };
};