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

        // Use base URL since frontend and backend are on same host but different ports/paths
        // In local: localhost:3001
        // In production: api.aimstore.in or same host
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
