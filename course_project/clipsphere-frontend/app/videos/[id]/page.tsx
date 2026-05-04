'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import VideoPlayer from '@/components/VideoPlayer';
import ReviewForm from '@/components/ReviewForm';
import TipButton from '@/components/TipButton';
import Link from 'next/link';

interface Review {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        _id: string;
        username: string;
        avatarKey?: string;
    };
}

interface Video {
    _id: string;
    title: string;
    description?: string;
    duration: number;
    viewsCount: number;
    likesCount: number;
    tippedAmount: number;
    avgRating: number;
    reviewCount: number;
    userLiked: boolean;
    playbackUrl: string;
    owner?: { _id: string; username: string };
    reviews: Review[];
    myReview: {
        rating: number;
        comment: string;
    } | null;
}

export default function VideoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [likeBusy, setLikeBusy] = useState(false);
    const viewedRef = useRef(false);
    const { user } = useAuth();

    const loadVideo = async () => {
        try {
            const res = await api.get(`/videos/${id}`);
            setVideo(res.data.video || null);
        } catch (error) {
            console.error(error);
            setVideo(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        viewedRef.current = false;
        setLoading(true);
        loadVideo();
    }, [id]);

    const incrementView = async () => {
        if (viewedRef.current) return;
        viewedRef.current = true;
        try {
            const res = await api.post(`/videos/${id}/view`, {});
            setVideo((current) => current ? { ...current, viewsCount: res.data.viewsCount } : current);
        } catch (error) {
            viewedRef.current = false;
        }
    };

    useEffect(() => {
        if (!video) return;
        incrementView();
    }, [video?._id]);

    const handleLike = async () => {
        if (!user || likeBusy) return;
        setLikeBusy(true);
        try {
            const res = await api.post(`/videos/${id}/like`, {});
            setVideo((current) => current ? {
                ...current,
                likesCount: res.data.likesCount,
                userLiked: res.data.userLiked
            } : current);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to update like');
        } finally {
            setLikeBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${id}`);
            router.push('/feed');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: '#f8fafc' }}>
                <NavBar />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e0e7ff', borderTopColor: '#4f46e5' }} />
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen" style={{ background: '#f8fafc' }}>
                <NavBar />
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>
                    Video not found
                </div>
            </div>
        );
    }

    const ownerId = video.owner?._id || '';
    const ownerName = video.owner?.username || 'Unknown';
    const isOwner = Boolean(user && ownerId && user._id === ownerId);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
            <NavBar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
                    <section
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 24,
                            padding: 20,
                            boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)'
                        }}
                    >
                        <VideoPlayer url={video.playbackUrl} />

                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 style={{ color: '#0f172a', fontSize: 28, fontWeight: 800, margin: 0 }}>
                                    {video.title}
                                </h1>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                                    <Link href={`/profile/${ownerId}`} style={{ color: '#4f46e5', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                                        @{ownerName}
                                    </Link>
                                    <span style={{ color: '#64748b', fontSize: 14 }}>{video.viewsCount} views</span>
                                    <span style={{ color: '#64748b', fontSize: 14 }}>{video.likesCount} likes</span>
                                    <span style={{ color: '#64748b', fontSize: 14 }}>
                                        {video.reviewCount} reviews{video.avgRating ? ` • ${video.avgRating.toFixed(1)}★` : ''}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: 14 }}>${Number(video.tippedAmount || 0).toFixed(2)} tipped</span>
                                </div>
                                {video.description && (
                                    <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, marginTop: 14 }}>
                                        {video.description}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleLike}
                                    disabled={!user || likeBusy}
                                    style={{
                                        background: video.userLiked ? '#eef2ff' : '#ffffff',
                                        border: `1px solid ${video.userLiked ? '#a5b4fc' : '#e2e8f0'}`,
                                        color: video.userLiked ? '#4338ca' : '#334155',
                                        padding: '10px 16px',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        opacity: !user ? 0.6 : 1
                                    }}
                                >
                                    {video.userLiked ? 'Liked' : 'Like'} • {video.likesCount}
                                </button>
                                {user && !isOwner && ownerId && (
                                    <TipButton toUserId={ownerId} videoId={video._id} />
                                )}
                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        style={{
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            color: '#b91c1c',
                                            padding: '10px 16px',
                                            borderRadius: 12,
                                            fontSize: 14,
                                            fontWeight: 700
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <section
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 24,
                                padding: 20
                            }}
                        >
                            <h2 style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: 0 }}>
                                Video Stats
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 16 }}>
                                {[
                                    { label: 'Views', value: String(video.viewsCount) },
                                    { label: 'Likes', value: String(video.likesCount) },
                                    { label: 'Reviews', value: String(video.reviewCount) },
                                    { label: 'Tips', value: `$${Number(video.tippedAmount || 0).toFixed(2)}` }
                                ].map((item) => (
                                    <div key={item.label} style={{ background: '#f8fafc', borderRadius: 16, padding: '14px 16px' }}>
                                        <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                            {item.label}
                                        </div>
                                        <div style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 24,
                                padding: 20
                            }}
                        >
                            <h2 style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: 0 }}>
                                {video.myReview ? 'Edit Your Review' : 'Leave a Review'}
                            </h2>
                            <p style={{ color: '#64748b', fontSize: 14, margin: '8px 0 16px 0' }}>
                                {video.myReview
                                    ? 'You already reviewed this video. Update it here.'
                                    : 'Share feedback so other users can decide what to watch.'}
                            </p>
                            {user ? (
                                <ReviewForm
                                    videoId={id}
                                    initialReview={video.myReview}
                                    onReviewSaved={loadVideo}
                                />
                            ) : (
                                <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                                    <Link href="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                                        Sign in
                                    </Link>{' '}
                                    to leave a review.
                                </p>
                            )}
                        </section>
                    </aside>
                </div>

                <section
                    style={{
                        marginTop: 24,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 24,
                        padding: 24
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <h2 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, margin: 0 }}>
                            Community Reviews
                        </h2>
                        <span style={{ color: '#64748b', fontSize: 14 }}>
                            {video.reviewCount} total
                        </span>
                    </div>

                    {video.reviews.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: 14, margin: '16px 0 0 0' }}>
                            No reviews yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                            {video.reviews.map((review) => (
                                <article
                                    key={review._id}
                                    style={{
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 18,
                                        padding: 16
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                                        <div>
                                            <div style={{ color: '#0f172a', fontSize: 15, fontWeight: 700 }}>
                                                @{review.user.username}
                                            </div>
                                            <div style={{ color: '#f59e0b', fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                                                {'★'.repeat(review.rating)}
                                                <span style={{ color: '#94a3b8', marginLeft: 8 }}>{review.rating}/5</span>
                                            </div>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: 13 }}>
                                            {new Date(review.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.65, margin: '12px 0 0 0' }}>
                                        {review.comment}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
