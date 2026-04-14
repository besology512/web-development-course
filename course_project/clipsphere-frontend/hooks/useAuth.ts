'use client';
import { useState, useEffect } from 'react';
import { api, setToken, clearToken } from '@/services/api';

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
        if (!token) { setLoading(false); return; }
        api.get('/users/me').then(res => {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }).catch(() => {
            clearToken();
        }).finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data.user;
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return { user, loading, login, logout };
}
