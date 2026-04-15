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
        setError('');
        setSuccess('');
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
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                    <button
                        key={score}
                        type="button"
                        onClick={() => setRating(score)}
                        onMouseEnter={() => setHover(score)}
                        onMouseLeave={() => setHover(0)}
                        className={`text-2xl transition-colors ${score <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                        ★
                    </button>
                ))}
                {rating > 0 && <span className="text-gray-400 text-sm ml-2 self-center">{rating}/5</span>}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this video..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-indigo-500 transition-colors"
                required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
                {loading ? 'Saving...' : initialReview ? 'Update Review' : 'Submit Review'}
            </button>
        </form>
    );
}
