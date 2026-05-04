'use client';
import { useState } from 'react';
import { api } from '@/services/api';

interface TipButtonProps {
    toUserId: string;
    videoId: string;
}

export default function TipButton({ toUserId, videoId }: TipButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleTip = async () => {
        setLoading(true);
        try {
            const data = await api.post('/tips/checkout', { toUserId, videoId, amountCents: 500 });
            if (data.data?.url) {
                window.location.href = data.data.url;
            } else {
                alert(data.message || 'Tip failed');
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to start tip. Make sure you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleTip} disabled={loading}
                style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: loading ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#fde68a'; }}
                onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#fef3c7'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            {loading ? 'Processing...' : 'Tip $5'}
        </button>
    );
}
