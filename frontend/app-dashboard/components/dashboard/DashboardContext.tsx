'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';

interface Notification {
    id: string | number;
    title: string;
    message: string;
    time?: string;
    createdAt?: string;
    unread: boolean;
}

interface DashboardContextType {
    isSidebarCollapsed: boolean;
    toggleSidebarCollapse: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    notifications: Notification[];
    unreadCount: number;
    markAllAsRead: () => void;
    membership: any;
    setMembership: (membership: any) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [membership, setMembership] = useState<any>(null);
    const { socket } = useSocket();

    // 1. Sidebar persistence
    useEffect(() => {
        const savedCollapsed = localStorage.getItem('sidebar_collapsed');
        if (savedCollapsed === 'true') {
            setIsSidebarCollapsed(true);
        }
    }, []);

    const toggleSidebarCollapse = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', newState.toString());
    };

    // 2. Notifications & Sockets (Isolated here)
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (payload: any) => {
            const newNotif: Notification = {
                id: Date.now(),
                title: 'New message received',
                message: `From ${payload.phone}`,
                time: 'Just now',
                unread: true
            };
            setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);

            // Sound logic
            const soundEnabled = localStorage.getItem('sound_enabled') !== 'false';
            if (soundEnabled) {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(() => {/* Blocked by browser */});
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => { socket.off('newMessage', handleNewMessage); };
    }, [socket]);

    const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        api.post('/users/me/notifications/read-all').catch(() => {});
    };

    const value = useMemo(() => ({
        isSidebarCollapsed,
        toggleSidebarCollapse,
        isSidebarOpen,
        setIsSidebarOpen,
        notifications,
        unreadCount,
        markAllAsRead,
        membership,
        setMembership
    }), [isSidebarCollapsed, isSidebarOpen, notifications, unreadCount, membership]);

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
