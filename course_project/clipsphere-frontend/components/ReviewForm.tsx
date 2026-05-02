'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface ReviewFormProps {
    videoId: string;
    initialReview?: {
        rating: number;
        comment: string;
    } | null;
    onReviewSaved: () => void;
}

function StarIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="m12 3.6 2.61 5.29 5.84.85-4.22 4.11 1 5.81L12 16.92 6.77 19.66l1-5.81-4.22-4.11 5.84-.85L12 3.6Z"
                fill={filled ? '#f59e0b' : 'none'}
                stroke={filled ? '#f59e0b' : '#cbd5e1'}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function ReviewForm({ videoId, initialReview, onReviewSaved }: ReviewFormProps) {
    const [rating, setRating] = useState(initialReview?.rating || 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(initialReview?.comment || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setRating(initialReview?.rating || 0);
        setComment(initialReview?.comment || '');
        setSuccess('');
        setError('');
    }, [initialReview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (initialReview) {
                await api.patch(`/videos/${videoId}/reviews/me`, { rating, comment });
                setSuccess('Your review was updated.');
            } else {
                await api.post(`/videos/${videoId}/reviews`, { rating, comment });
                setSuccess('Review submitted. Thanks for your feedback.');
            }
            onReviewSaved();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((score) => (
                    <button
                        key={score}
                        type="button"
                        onClick={() => setRating(score)}
                        onMouseEnter={() => setHover(score)}
                        onMouseLeave={() => setHover(0)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 2,
                            cursor: 'pointer'
                        }}
                    >
                        <StarIcon filled={score <= (hover || rating)} />
                    </button>
                ))}
                {rating > 0 && (
                    <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>
                        {rating}/5
                    </span>
                )}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this video..."
                required
                style={{
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 14,
                    height: 96,
                    resize: 'vertical',
                    color: '#0f172a',
                    transition: 'border-color 0.15s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />

            {error && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>}
            {success && <p style={{ color: '#059669', fontSize: 13, margin: 0 }}>{success}</p>}

            <button
                type="submit"
                disabled={loading}
                style={{
                    background: loading ? '#a5b4fc' : '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    alignSelf: 'flex-start',
                    opacity: loading ? 0.8 : 1
                }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = '#4338ca'; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
            >
                {loading ? 'Saving...' : initialReview ? 'Update Review' : 'Submit Review'}
            </button>
        </form>
    );
}
