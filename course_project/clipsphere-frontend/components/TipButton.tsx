'use client';
import { useState } from 'react';

interface TipButtonProps {
    toUserId: string;
}

export default function TipButton({ toUserId }: TipButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleTip = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/tips/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ toUserId, amountCents: 500 })
            });
            const data = await res.json();
            if (data.data?.url) {
                window.location.href = data.data.url;
            } else {
                alert(data.message || 'Tip failed');
            }
        } catch {
            alert('Failed to start tip. Make sure you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleTip} disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            {loading ? '...' : '💰 Tip $5'}
        </button>
    );
}
