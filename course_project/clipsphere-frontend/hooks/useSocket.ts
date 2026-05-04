'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const socketUrl = typeof window !== 'undefined'
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost');
        const s = io(socketUrl, {
            auth: { token }
        });
        s.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });
        setSocket(s);
        return () => {
            s.disconnect();
        };
    }, []);

    return { socket };
}
