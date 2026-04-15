'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import VideoPlayer from '@/components/VideoPlayer';
import ReviewForm from '@/components/ReviewForm';
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
    reviewCount: number;
    avgRating: number;
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
        } catch (e) {
            console.error(e);
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
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : 'Delete failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen">
            <NavBar />
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"/>
            </div>
        </div>
    );

    if (!video) return (
        <div className="min-h-screen">
            <NavBar />
            <div className="flex items-center justify-center h-64 text-gray-400">
                Video not found
            </div>
        </div>
    );

    const ownerId = video.owner?._id || '';
    const ownerName = video.owner?.username || 'Unknown';
    const isOwner = Boolean(user && ownerId && user._id === ownerId);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)' }}>
            <NavBar />
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
                    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                        <VideoPlayer url={video.playbackUrl} />

                        <div className="flex items-start justify-between gap-4 mt-5 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold">{video.title}</h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-slate-400">
                                    <Link href={`/profile/${ownerId}`} className="text-indigo-400 hover:underline">
                                        @{ownerName}
                                    </Link>
                                    <span>{video.viewsCount} views</span>
                                    <span>{video.likesCount} likes</span>
                                    <span>{video.reviewCount} reviews</span>
                                    {video.avgRating ? <span>{video.avgRating.toFixed(1)}★</span> : null}
                                </div>
                                {video.description && (
                                    <p className="text-gray-300 text-sm mt-3 leading-6">{video.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                <button
                                    onClick={handleLike}
                                    disabled={!user || likeBusy}
                                    className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                                        video.userLiked
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    } disabled:opacity-50`}
                                >
                                    {video.userLiked ? 'Liked' : 'Like'} • {video.likesCount}
                                </button>
                                {isOwner && (
                                    <button onClick={handleDelete}
                                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 px-3 py-2 rounded-xl text-sm transition-colors">
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                            <h2 className="text-lg font-semibold">Video Stats</h2>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {[
                                    { label: 'Views', value: String(video.viewsCount) },
                                    { label: 'Likes', value: String(video.likesCount) },
                                    { label: 'Reviews', value: String(video.reviewCount) },
                                    { label: 'Rating', value: video.avgRating ? `${video.avgRating.toFixed(1)}★` : 'New' }
                                ].map((item) => (
                                    <div key={item.label} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                                        <div className="text-xs uppercase tracking-wide text-slate-500">{item.label}</div>
                                        <div className="text-lg font-semibold mt-2">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                            <h2 className="text-lg font-semibold">
                                {video.myReview ? 'Edit Your Review' : 'Leave a Review'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-2 mb-4">
                                {video.myReview
                                    ? 'You already reviewed this video. Update it here.'
                                    : 'Share feedback so other viewers know what to watch.'}
                            </p>
                            {user ? (
                                <ReviewForm
                                    videoId={id}
                                    initialReview={video.myReview}
                                    onReviewSaved={loadVideo}
                                />
                            ) : (
                                <p className="text-gray-400 text-sm">
                                    <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link> to leave a review.
                                </p>
                            )}
                        </section>
                    </aside>
                </div>

                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h2 className="text-xl font-semibold">Community Reviews</h2>
                        <span className="text-sm text-slate-400">{video.reviewCount} total</span>
                    </div>

                    {video.reviews.length === 0 ? (
                        <p className="text-slate-400 text-sm mt-5">No reviews yet.</p>
                    ) : (
                        <div className="space-y-4 mt-5">
                            {video.reviews.map((review) => (
                                <article key={review._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <div className="font-medium">@{review.user.username}</div>
                                            <div className="text-amber-400 text-sm mt-1">
                                                {'★'.repeat(review.rating)}
                                                <span className="text-slate-400 ml-2">{review.rating}/5</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(review.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-3 leading-6">{review.comment}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
