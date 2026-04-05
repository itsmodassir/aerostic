'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinTenant: (tenantId: string) => void;
    leaveTenant: (tenantId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    joinTenant: () => { },
    leaveTenant: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // In production, Nginx proxies /socket.io/ → localhost:3001.
        // So the browser just connects to the same origin (wss://app.aimstore.in/).
        // For local dev, we fall back to localhost:3001 directly.
        let socketUrl: string;
        if (process.env.NEXT_PUBLIC_WS_URL) {
            socketUrl = process.env.NEXT_PUBLIC_WS_URL;
        } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            socketUrl = window.location.origin;  // Nginx proxies /socket.io/ to API
        } else {
            socketUrl = 'http://localhost:3001';
        }

        const socketInstance = io(socketUrl, {
            transports: ['websocket'],
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('[Socket] Connection Error:', error);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user]);

    const joinTenant = useCallback((tenantId: string) => {
        if (socket && isConnected) {
            socket.emit('joinTenant', tenantId);
        }
    }, [socket, isConnected]);

    const leaveTenant = useCallback((tenantId: string) => {
        if (socket && isConnected) {
            socket.emit('leaveTenant', tenantId);
        }
    }, [socket, isConnected]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinTenant, leaveTenant }}>
            {children}
        </SocketContext.Provider>
    );
};
