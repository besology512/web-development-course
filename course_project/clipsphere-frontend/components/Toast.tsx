'use client';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-in max-w-sm">
            <p className="text-sm font-medium">🔔 {message}</p>
        </div>
    );
}
