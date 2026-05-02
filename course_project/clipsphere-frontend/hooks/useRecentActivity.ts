'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';

export interface ActivityItem {
    type: string;
    message: string;
    createdAt: string;
    actor?: {
        _id: string;
        username: string;
        avatarKey?: string;
    };
    video?: {
        _id: string;
        title: string;
    };
}

export function useRecentActivity(enabled: boolean, limit = 8) {
    const [activity, setActivity] = useState<ActivityItem[]>([]);

    const fetchActivity = useCallback(async () => {
        if (!enabled) {
            setActivity([]);
            return;
        }

        try {
            const res = await api.get(`/users/me/activity?limit=${limit}`);
            setActivity((res.data.activity as ActivityItem[]) || []);
        } catch {
            setActivity([]);
        }
    }, [enabled, limit]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    useEffect(() => {
        if (!enabled) return;

        const onFocus = () => fetchActivity();
        const interval = window.setInterval(fetchActivity, 15000);
        window.addEventListener('focus', onFocus);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, [enabled, fetchActivity]);

    return { activity, refreshActivity: fetchActivity };
}
