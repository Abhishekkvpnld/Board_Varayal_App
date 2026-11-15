import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentRoomRef = useRef(null);

  useEffect(() => {
    // In Vite dev proxy, socket.io connects to window.location.origin
    const socketInstance = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      // console.log('[Socket] Connected with id:', socketInstance.id);
      setIsConnected(true);

      // Re-join user channel if authenticated
      if (user?.id) {
        socketInstance.emit('join_game', { userId: user.id });
      }

      // Re-join active game room if user was in one
      if (currentRoomRef.current) {
        socketInstance.emit('join_game', { gameId: currentRoomRef.current, userId: user?.id });
      }

      if (user?.role === 'admin') {
        socketInstance.emit('join_admin', { adminToken: true });
      }
    });

    socketInstance.on('disconnect', () => {
      // console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, user?.role]);

  const joinGame = (gameId) => {
    currentRoomRef.current = gameId;
    if (socket && isConnected) {
      socket.emit('join_game', { gameId, userId: user?.id });
    }
  };

  const leaveGame = (gameId) => {
    if (currentRoomRef.current === gameId) {
      currentRoomRef.current = null;
    }
    if (socket && isConnected) {
      socket.emit('leave_game', { gameId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinGame, leaveGame }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
}

