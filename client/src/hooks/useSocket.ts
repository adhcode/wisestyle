import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthHook } from './useAuth';

interface UseSocketReturn {
  viewerCount: number;
  isConnected: boolean;
}

export function useSocket(productId: string): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthHook();
  const userId = user?.id;

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      query: { productId },
      withCredentials: true,
      auth: {
        userId
      }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('viewerCount', (data: { count: number }) => {
      setViewerCount(data.count);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [productId, userId]);

  return { viewerCount, isConnected };
} 