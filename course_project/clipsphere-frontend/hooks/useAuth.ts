'use client';
import { useState, useEffect } from 'react';
import { api, setToken, clearToken, setStoredUser } from '@/services/api';

export interface AuthUser {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatarKey: string;
    bio?: string;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const cachedUser = localStorage.getItem('user');

        if (cachedUser) {
            try {
                const parsedUser = JSON.parse(cachedUser);
                setUser(parsedUser);
                setStoredUser(parsedUser);
            } catch {
                localStorage.removeItem('user');
            }
        }

        if (!token) { setLoading(false); return; }
        api.get('/users/me').then(res => {
            setUser(res.data.user);
            setStoredUser(res.data.user);
        }).catch(() => {
            clearToken();
        }).finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        setToken(res.token);
        setUser(res.data.user);
        setStoredUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        clearToken();
        setUser(null);
        if (typeof window !== 'undefined') window.location.href = '/login';
    };

    return { user, loading, login, logout };
}
