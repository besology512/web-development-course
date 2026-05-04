'use client';

import { useState, useEffect, useCallback } from 'react';
import socketService, { Notification } from '@/services/socket';
import { getToken } from '@/services/api';
import { useAuth } from './useAuth';

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    markAsRead: (id: string) => void;
    isConnected: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize Socket connection
    useEffect(() => {
        const token = getToken();
        if (!token || !user) {
            return;
        }

        try {
            socketService.connect(token);

            // Listen for notifications
            const unsubscribe = socketService.onNotification((notification) => {
                setNotifications((prev) => [notification, ...prev]);
            });

            // Listen for connection changes
            const unsubscribeConnection = socketService.onConnectionChange((connected) => {
                setIsConnected(connected);
            });

            return () => {
                unsubscribe();
                unsubscribeConnection();
            };
        } catch (error) {
            console.error('Failed to initialize socket:', error);
        }
    }, [user]);

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );
        socketService.markNotificationAsRead(id);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        clearAll,
        markAsRead,
        isConnected
    };
};
