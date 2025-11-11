import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import { WebSocketService } from '@/services/websocket.service';
import { useAuth } from '@/hooks/useAuth';
import type { FarmAlert, IoTSensorData, DashboardUpdate, NotificationPayload } from '@/services/websocket.service';
import { toast } from 'sonner';

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  currentFarm: string | null;
}

interface WebSocketContextType {
  // Connection state
  connectionState: WebSocketState;
  currentFarmId: string | null;
  
  // Connection methods
  connect: (farmId: string) => Promise<void>;
  disconnect: () => void;
  queueMessage: (message: any) => void;

  // Real-time data
  latestAlert: FarmAlert | null;
  latestSensorData: IoTSensorData | null;
  latestDashboardUpdate: DashboardUpdate | null;
  latestNotification: NotificationPayload | null;
  notifications: NotificationPayload[];

  // Subscription methods
  subscribeToAlerts: (farmId: string) => void;
  subscribeToIoT: (farmId: string, sensorTypes?: string[]) => void;
  subscribeToDashboard: (farmId: string) => void;

  // Status methods
  requestFarmStatus: (farmId: string) => void;

  // Notification methods
  clearNotifications: () => void;

  // Retry and queue info
  retryCount: number;
  messageQueueLength: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  defaultFarmId?: string;
}

// Enhanced WebSocket state management with retry logic
interface WebSocketContextState {
  currentFarmId: string | null;
  latestAlert: FarmAlert | null;
  latestSensorData: IoTSensorData | null;
  latestDashboardUpdate: DashboardUpdate | null;
  latestNotification: NotificationPayload | null;
  connectionState: WebSocketState;
  retryCount: number;
  retryTimeout: NodeJS.Timeout | null;
  messageQueue: Array<{ event: string; data: any; timestamp: number }>;
  lastConnectionAttempt: number;
}

type WebSocketAction = 
  | { type: 'SET_FARM_ID'; payload: string | null }
  | { type: 'SET_ALERT'; payload: FarmAlert | null }
  | { type: 'SET_SENSOR_DATA'; payload: IoTSensorData | null }
  | { type: 'SET_DASHBOARD_UPDATE'; payload: DashboardUpdate | null }
  | { type: 'SET_NOTIFICATION'; payload: NotificationPayload | null }
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; payload: { farmId?: string } }
  | { type: 'DISCONNECTED'; payload?: { reason?: string } }
  | { type: 'CONNECTION_ERROR'; payload: string }
  | { type: 'RETRY_CONNECTION'; payload?: { attempt: number } }
  | { type: 'RESET_RETRY' }
  | { type: 'QUEUE_MESSAGE'; payload: { event: string; data: any } }
  | { type: 'FLUSH_MESSAGE_QUEUE' }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'CLEAR_NOTIFICATIONS' };

const webSocketReducer = (state: WebSocketContextState, action: WebSocketAction): WebSocketContextState => {
  switch (action.type) {
    case 'SET_FARM_ID':
      return { ...state, currentFarmId: action.payload };
    case 'SET_ALERT':
      return { ...state, latestAlert: action.payload };
    case 'SET_SENSOR_DATA':
      return { ...state, latestSensorData: action.payload };
    case 'SET_DASHBOARD_UPDATE':
      return { ...state, latestDashboardUpdate: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, latestNotification: action.payload };
    
    case 'CONNECTING':
      return {
        ...state,
        connectionState: {
          ...state.connectionState,
          isConnecting: true,
          isConnected: false,
          error: null
        },
        lastConnectionAttempt: Date.now()
      };
    
    case 'CONNECTED':
      return {
        ...state,
        connectionState: {
          ...state.connectionState,
          isConnected: true,
          isConnecting: false,
          error: null,
          currentFarm: action.payload.farmId || state.connectionState.currentFarm
        },
        retryCount: 0,
        retryTimeout: null
      };
    
    case 'DISCONNECTED':
      return {
        ...state,
        connectionState: {
          ...state.connectionState,
          isConnected: false,
          isConnecting: false,
          error: action.payload?.reason || null
        }
      };
    
    case 'CONNECTION_ERROR':
      return {
        ...state,
        connectionState: {
          ...state.connectionState,
          isConnected: false,
          isConnecting: false,
          error: action.payload
        }
      };
    
    case 'RETRY_CONNECTION':
      const newRetryCount = action.payload?.attempt || state.retryCount + 1;
      return {
        ...state,
        retryCount: newRetryCount,
        connectionState: {
          ...state.connectionState,
          isConnecting: true,
          error: `Retrying connection (attempt ${newRetryCount}/5)...`
        }
      };
    
    case 'RESET_RETRY':
      if (state.retryTimeout) {
        clearTimeout(state.retryTimeout);
      }
      return {
        ...state,
        retryCount: 0,
        retryTimeout: null
      };
    
    case 'QUEUE_MESSAGE':
      return {
        ...state,
        messageQueue: [
          ...state.messageQueue,
          {
            event: action.payload.event,
            data: action.payload.data,
            timestamp: Date.now()
          }
        ]
      };
    
    case 'FLUSH_MESSAGE_QUEUE':
      return {
        ...state,
        messageQueue: []
      };
    
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        latestAlert: null,
        latestSensorData: null,
        latestDashboardUpdate: null,
        latestNotification: null,
        messageQueue: []
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, latestNotification: null };
    
    default:
      return state;
  }
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  defaultFarmId 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Initialize state with useReducer
  const [state, dispatch] = useReducer(webSocketReducer, {
    currentFarmId: defaultFarmId || null,
    latestAlert: null,
    latestSensorData: null,
    latestDashboardUpdate: null,
    latestNotification: null,
    connectionState: {
      socket: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      currentFarm: null
    },
    retryCount: 0,
    retryTimeout: null,
    messageQueue: [],
    lastConnectionAttempt: 0
  });
  
  // Use refs to track cleanup and prevent memory leaks
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const wsServiceRef = useRef<WebSocketService>(new WebSocketService());
  
  // Get WebSocket service instance
  const wsService = wsServiceRef.current;

  // Monitor WebSocket service connection state
  useEffect(() => {
    const checkConnectionState = () => {
      const isConnected = wsService.isConnected();
      
      if (state.connectionState.isConnected !== isConnected) {
        if (isConnected) {
          dispatch({ type: 'CONNECTED', payload: { farmId: state.currentFarmId || undefined } });
        } else {
          dispatch({ type: 'DISCONNECTED', payload: { reason: 'Connection lost' } });
        }
      }
    };
    
    // Check connection state periodically
    const interval = setInterval(checkConnectionState, 1000);
    checkConnectionState(); // Initial check
    
    return () => clearInterval(interval);
  }, [wsService, state.connectionState.isConnected, state.currentFarmId]);

  // Memoized derived connection state to prevent unnecessary re-renders
  const connectionState = useMemo(() => ({
    ...state.connectionState,
    hasError: !!state.connectionState.error,
    isReconnecting: state.retryCount > 0 && state.connectionState.isConnecting,
    canRetry: state.retryCount < 5,
    nextRetryDelay: state.retryCount > 0 ? Math.min(1000 * Math.pow(2, state.retryCount - 1), 16000) : 0
  }), [state.connectionState, state.retryCount]);
  
  // Memoized connection status for components that only need basic status
  const connectionStatus = useMemo(() => ({
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    hasError: connectionState.hasError
  }), [connectionState.isConnected, connectionState.isConnecting, connectionState.hasError]);

  // Retry logic with exponential backoff
  const scheduleRetry = useCallback((farmId: string, attempt: number) => {
    if (attempt >= 5) {
      dispatch({ type: 'CONNECTION_ERROR', payload: 'Maximum retry attempts reached' });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, attempt), 16000); // 1s, 2s, 4s, 8s, 16s max
    const timeout = setTimeout(() => {
      dispatch({ type: 'RETRY_CONNECTION', payload: { attempt: attempt + 1 } });
      connectWithRetry(farmId, attempt + 1);
    }, delay);

    dispatch({ type: 'RESET_RETRY' });
    // Store timeout in state for cleanup
    state.retryTimeout = timeout;
  }, [state]);

  // Enhanced connection with retry logic
  const connectWithRetry = useCallback(async (farmId: string, attempt: number = 0) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to connect to WebSocket');
    }
    
    try {
      dispatch({ type: 'CONNECTING' });
      await wsService.connect(farmId);
      dispatch({ type: 'CONNECTED', payload: { farmId } });
      dispatch({ type: 'SET_FARM_ID', payload: farmId });
      
      // Flush queued messages on successful connection
      if (state.messageQueue.length > 0) {
        // Note: WebSocketService doesn't expose emit method directly
        // Messages would need to be handled through service methods
        dispatch({ type: 'FLUSH_MESSAGE_QUEUE' });
      }
    } catch (error) {
      console.error(`Connection attempt ${attempt + 1} failed:`, error);
      dispatch({ type: 'CONNECTION_ERROR', payload: error instanceof Error ? error.message : 'Connection failed' });
      
      // Schedule retry if not at max attempts
      if (attempt < 4) {
        scheduleRetry(farmId, attempt);
      }
    }
  }, [isAuthenticated, wsService, scheduleRetry, state.messageQueue]);

  // Public connect method
  const connect = useCallback(async (farmId: string) => {
    dispatch({ type: 'RESET_RETRY' });
    await connectWithRetry(farmId, 0);
  }, [connectWithRetry]);

  const disconnect = useCallback(() => {
    // Manual cleanup if needed
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];
    
    dispatch({ type: 'RESET_RETRY' });
    dispatch({ type: 'DISCONNECTED', payload: { reason: 'User disconnected' } });
    dispatch({ type: 'SET_FARM_ID', payload: null });
    dispatch({ type: 'CLEAR_ALL_DATA' });
    wsService.disconnect();
  }, [wsService]);

  // Message queuing for offline scenarios
  const queueMessage = useCallback((message: any) => {
    if (!state.connectionState.isConnected) {
      dispatch({ type: 'QUEUE_MESSAGE', payload: { event: 'message', data: message } });
    }
  }, [state.connectionState.isConnected]);

  // Subscribe to alerts
  const subscribeToAlerts = useCallback((farmId: string) => {
    wsService.subscribeToAlerts(farmId);
  }, [wsService]);

  // Subscribe to IoT data
  const subscribeToIoT = useCallback((farmId: string, sensorTypes?: string[]) => {
    wsService.subscribeToIoT(farmId, sensorTypes);
  }, [wsService]);

  // Subscribe to dashboard updates
  const subscribeToDashboard = useCallback((farmId: string) => {
    wsService.subscribeToDashboard(farmId);
  }, [wsService]);

  // Request farm status
  const requestFarmStatus = useCallback((farmId: string) => {
    wsService.requestFarmStatus(farmId);
  }, [wsService]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  // Memoized event handlers to prevent recreation on every render
  const eventHandlers = useMemo(() => ({
    handleAlert: (alert: FarmAlert) => {
      dispatch({ type: 'SET_ALERT', payload: alert });
      
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
    },

    handleSensorData: (data: IoTSensorData) => {
      dispatch({ type: 'SET_SENSOR_DATA', payload: data });
      
      // Show toast for abnormal readings
      if (data.status === 'abnormal' || data.status === 'critical') {
        toast.warning(`Sensor Alert: ${data.type}`, {
          description: `${data.value} ${data.unit} - ${data.location}`,
          duration: 5000,
        });
      }
    },

    handleDashboardUpdate: (update: DashboardUpdate) => {
      dispatch({ type: 'SET_DASHBOARD_UPDATE', payload: update });
    },

    handleNotification: (notification: NotificationPayload) => {
      dispatch({ type: 'SET_NOTIFICATION', payload: notification });
      
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
    }
  }), []);

  // Optimized event listener setup - only updates when connection state changes
  useEffect(() => {
    if (!state.connectionState.isConnected || !wsService) return;

    const unsubscribers: (() => void)[] = [];

    // Note: WebSocketService event subscription would need to be implemented
    // For now, we'll use a simplified approach with the service
    // In a real implementation, these would be:
    // unsubscribers.push(wsService.on('alert', eventHandlers.handleAlert));
    // unsubscribers.push(wsService.on('sensorData', eventHandlers.handleSensorData));
    // unsubscribers.push(wsService.on('dashboardUpdate', eventHandlers.handleDashboardUpdate));
    // unsubscribers.push(wsService.on('notification', eventHandlers.handleNotification));
    
    // Store cleanup functions in ref for potential manual cleanup
    cleanupFunctionsRef.current = unsubscribers;

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      cleanupFunctionsRef.current = [];
    };
  }, [state.connectionState.isConnected, wsService, eventHandlers]);

  // Consolidated connection and error management - single useEffect for all connection logic
  useEffect(() => {
    // Handle connection errors with toast notifications
    if (state.connectionState.error) {
      toast.error('WebSocket Connection Error', {
        description: state.connectionState.error,
        duration: 5000,
      });
    }
    
    // Auto-connect when user is authenticated and has a default farm
    if (isAuthenticated && user && defaultFarmId && !state.connectionState.isConnected && !state.connectionState.isConnecting) {
      connect(defaultFarmId).catch(error => {
        console.error('Failed to auto-connect to WebSocket:', error);
      });
    }
    
    // Disconnect when user logs out
    if (!isAuthenticated && state.connectionState.isConnected) {
      disconnect();
    }
  }, [isAuthenticated, user, defaultFarmId, state.connectionState.isConnected, state.connectionState.isConnecting, state.connectionState.error, connect, disconnect]);

  // Cleanup effect - runs only on unmount and when retry timeout changes
  useEffect(() => {
    return () => {
      // Clear all event listeners
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      
      // Clear any pending retry timeouts
      if (state.retryTimeout) {
        clearTimeout(state.retryTimeout);
      }
    };
  }, [state.retryTimeout]);

  // Memoized connection state to prevent unnecessary re-renders
  const memoizedConnectionState = useMemo(() => connectionState, [
    connectionState.isConnected,
    connectionState.isConnecting,
    connectionState.error
  ]);

  // Memoized notifications array to prevent recreation on every render
  const memoizedNotifications = useMemo(() => 
    state.latestNotification ? [state.latestNotification] : [],
    [state.latestNotification]
  );

  // Memoized subscription methods to prevent recreation
  const subscriptionMethods = useMemo(() => ({
    subscribeToAlerts,
    subscribeToIoT,
    subscribeToDashboard,
    requestFarmStatus
  }), [subscribeToAlerts, subscribeToIoT, subscribeToDashboard, requestFarmStatus]);

  const contextValue = useMemo<WebSocketContextType>(() => ({
    // Connection state
    connectionState: memoizedConnectionState,
    currentFarmId: state.currentFarmId,
    
    // Connection methods
    connect,
    disconnect,
    queueMessage,
    
    // Real-time data
    latestAlert: state.latestAlert,
    latestSensorData: state.latestSensorData,
    latestDashboardUpdate: state.latestDashboardUpdate,
    latestNotification: state.latestNotification,
    notifications: memoizedNotifications,
    
    // Subscription methods
    ...subscriptionMethods,
    
    // Notification methods
    clearNotifications,
    
    // Retry and queue info
    retryCount: state.retryCount,
    messageQueueLength: state.messageQueue.length
  }), [
    memoizedConnectionState,
    state.currentFarmId,
    state.latestAlert,
    state.latestSensorData,
    state.latestDashboardUpdate,
    state.latestNotification,
    state.retryCount,
    state.messageQueue.length,
    connect,
    disconnect,
    queueMessage,
    memoizedNotifications,
    subscriptionMethods,
    clearNotifications
  ]);

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