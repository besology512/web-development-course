'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    creatorId: string;
    videoId: string;
    videoTitle: string;
    onSuccess?: () => void;
}

export const TipModal: React.FC<TipModalProps> = ({
    isOpen,
    onClose,
    creatorId,
    videoId,
    videoTitle,
    onSuccess
}) => {
    const [amount, setAmount] = useState(5);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const presetAmounts = [1, 5, 10, 20, 50];

    const handleTip = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/payments/checkout', {
                amount,
                videoId,
                creatorId,
                message: message || undefined
            });

            // Redirect to Stripe checkout
            if (response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl;
            }

            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create checkout session');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Support Creator
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>

                {/* Video Title */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Tipping for: <span className="font-semibold">{videoTitle}</span>
                </p>

                {/* Amount Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tip Amount ($)
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {presetAmounts.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset)}
                                className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                                    amount === preset
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                ${preset}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        min="1"
                        max="10000"
                        value={amount}
                        onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Message */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message (Optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Send a message with your tip..."
                        maxLength={500}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        rows={3}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {message.length}/500
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Platform Fee (5%):</span>
                        <span>${(amount * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                            <span>Creator Receives:</span>
                            <span className="text-green-600">${(amount * 0.95).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTip}
                        disabled={isLoading}
                        className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Send Tip'}
                    </button>
                </div>
            </div>
        </div>
    );
};
