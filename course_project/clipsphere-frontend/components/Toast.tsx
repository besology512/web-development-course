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
        <div className="fixed top-4 right-4 z-50 animate-slide-in"
             style={{
                 background: '#ffffff',
                 border: '1px solid #e5e7eb',
                 borderLeft: '3px solid #4f46e5',
                 color: '#0f172a',
                 padding: '12px 16px',
                 borderRadius: 8,
                 boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                 maxWidth: 340
             }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{message}</p>
        </div>
    );
}
