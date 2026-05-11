'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'notification';
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type = 'info',
    duration = 5000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getStyles = () => {
        const baseStyles = 'fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 max-w-sm z-50';
        const visibleStyles = isVisible
            ? 'opacity-100 transform translate-x-0'
            : 'opacity-0 transform translate-x-full pointer-events-none';

        const typeStyles = {
            success: 'bg-green-500/80 text-white border border-green-400/50',
            error: 'bg-red-500/80 text-white border border-red-400/50',
            info: 'bg-blue-500/80 text-white border border-blue-400/50',
            notification: 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border border-purple-400/50'
        };

        return `${baseStyles} ${visibleStyles} ${typeStyles[type]}`;
    };

    const getIcon = () => {
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            notification: '♥'
        };
        return icons[type];
    };

    return (
        <div className={getStyles()}>
            <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{getIcon()}</span>
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' | 'notification' }>;
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-4 right-4 space-y-2 pointer-events-none z-50">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type || 'info'}
                    onClose={onClose}
                />
            ))}
        </div>
    );
};
