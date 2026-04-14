'use client';
import { useState } from 'react';
import { api } from '@/services/api';

interface ReviewFormProps {
    videoId: string;
    onReview: () => void;
}

export default function ReviewForm({ videoId, onReview }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { setError('Please select a rating'); return; }
        setError('');
        setLoading(true);
        try {
            await api.post(`/videos/${videoId}/reviews`, { rating, comment });
            setSuccess(true);
            onReview();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <p className="text-green-400 text-sm flex items-center gap-2">
            <span>✓</span> Review submitted! Thanks for your feedback.
        </p>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        className={`text-2xl transition-colors ${s <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'}`}>
                        ★
                    </button>
                ))}
                {rating > 0 && <span className="text-gray-400 text-sm ml-2 self-center">{rating}/5</span>}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this video..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-indigo-500 transition-colors" required />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
