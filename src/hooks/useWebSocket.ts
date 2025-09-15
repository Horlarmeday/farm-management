import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  url: string;
  options?: {
    auth?: {
      token?: string;
    };
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
  };
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const useWebSocket = ({
  url,
  options = {}
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    auth,
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Create socket connection
      const socket = io(url, {
        auth: auth || {},
        autoConnect: false,
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        transports: ['websocket', 'polling']
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Handle different disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          setError('Server disconnected the connection');
        } else if (reason === 'transport close' || reason === 'transport error') {
          // Network issues, attempt to reconnect
          setError('Connection lost due to network issues');
        }
      });

      socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setIsConnecting(false);
        setError(`Connection failed: ${err.message}`);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
        setError(null);
      });

      socket.on('reconnect_error', (err) => {
        console.error('WebSocket reconnection error:', err);
        setError(`Reconnection failed: ${err.message}`);
      });

      socket.on('reconnect_failed', () => {
        console.error('WebSocket reconnection failed after all attempts');
        setError('Failed to reconnect after multiple attempts');
        setIsConnecting(false);
      });

      socketRef.current = socket;
      socket.connect();
    } catch (err: any) {
      console.error('Error creating WebSocket connection:', err);
      setError(`Failed to create connection: ${err.message}`);
      setIsConnecting(false);
    }
  }, [url, auth, reconnection, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);

    // Clear any pending reconnection timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Update auth token when it changes
  useEffect(() => {
    if (socketRef.current && auth?.token) {
      socketRef.current.auth = auth;
      
      // If connected, reconnect with new auth
      if (socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current.connect();
      }
    }
  }, [auth?.token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off
  };
};

export default useWebSocket;