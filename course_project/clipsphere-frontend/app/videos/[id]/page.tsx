'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import VideoPlayer from '@/components/VideoPlayer';
import ReviewForm from '@/components/ReviewForm';
import TipButton from '@/components/TipButton';
import Link from 'next/link';

interface Video {
    _id: string;
    title: string;
    description?: string;
    duration: number;
    viewsCount: number;
    ownerData?: { _id: string; username: string };
    owner?: { _id: string; username: string };
}

export default function VideoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<Video | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadVideo = async () => {
        try {
            const [listRes, urlRes] = await Promise.all([
                api.get(`/videos?limit=100&skip=0`),
                api.get(`/videos/${id}/url`)
            ]);
            const found = listRes.data.videos.find((v: Video) => v._id === id);
            setVideo(found || null);
            setVideoUrl(urlRes.data.url);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadVideo(); }, [id]);

    const handleLike = async () => {
        try { await api.post(`/videos/${id}/like`, {}); } catch {}
    };

    const handleDelete = async () => {
        if (!confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${id}`);
            window.location.href = '/feed';
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

    const ownerId = video.ownerData?._id || video.owner?._id || '';
    const ownerName = video.ownerData?.username || video.owner?.username || 'Unknown';
    const isOwner = user && ownerId && user._id === ownerId;

    return (
        <div className="min-h-screen">
            <NavBar />
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                {videoUrl ? (
                    <VideoPlayer url={videoUrl} />
                ) : (
                    <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-500">
                        Video unavailable
                    </div>
                )}

                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold truncate">{video.title}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <Link href={`/profile/${ownerId}`} className="text-indigo-400 text-sm hover:underline">
                                @{ownerName}
                            </Link>
                            <span className="text-gray-500 text-sm">{video.viewsCount} views</span>
                        </div>
                        {video.description && (
                            <p className="text-gray-300 text-sm mt-2">{video.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={handleLike}
                            className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl text-sm transition-colors">
                            👍 Like
                        </button>
                        {user && !isOwner && ownerId && <TipButton toUserId={ownerId} />}
                        {isOwner && (
                            <button onClick={handleDelete}
                                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 px-3 py-2 rounded-xl text-sm transition-colors">
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                {user ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <h3 className="font-semibold mb-4">Leave a Review</h3>
                        <ReviewForm videoId={id} onReview={loadVideo} />
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                        <p className="text-gray-400 text-sm">
                            <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link> to leave a review
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
