'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import NavBar from '@/components/NavBar';
import VideoCard from '@/components/VideoCard';
import SkeletonCard from '@/components/SkeletonCard';
import Toast from '@/components/Toast';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

interface Video {
    _id: string;
    title: string;
    duration: number;
    viewsCount: number;
    avgRating?: number;
    ownerData?: { _id: string; username: string };
    owner?: { _id: string; username: string };
}

export default function FeedPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [tab, setTab] = useState<'trending' | 'following'>('trending');
    const [toast, setToast] = useState<string | null>(null);
    const [hasActivity, setHasActivity] = useState(false);
    const { user } = useAuth();
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;
        const handler = (data: { likerUsername: string; videoTitle: string }) => {
            setToast(`${data.likerUsername} liked your video "${data.videoTitle}"`);
            setHasActivity(true);
        };
        socket.on('new-like', handler);
        return () => { socket.off('new-like', handler); };
    }, [socket]);

    const fetchVideos = useCallback(async (reset = false, currentSkip = 0) => {
        setLoading(true);
        try {
            const res = await api.get(`/videos?limit=10&skip=${currentSkip}&feed=${tab}`);
            const newVideos = res.data.videos;
            setVideos(prev => reset ? newVideos : [...prev, ...newVideos]);
            const nextSkip = currentSkip + newVideos.length;
            setSkip(nextSkip);
            setHasMore(newVideos.length === 10);
        } catch {
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        setVideos([]);
        setSkip(0);
        setHasMore(true);
        fetchVideos(true, 0);
    }, [tab]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) fetchVideos(false, skip);
    }, [loading, hasMore, fetchVideos, skip]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

    return (
        <div className="min-h-screen">
            <NavBar hasActivity={hasActivity} onActivityClick={() => setHasActivity(false)} />
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-3 mb-6">
                    {(['trending', 'following'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                                tab === t
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}>
                            {t === 'trending' ? '🔥 Trending' : '👥 Following'}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading && videos.length === 0
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                        : videos.map(v => <VideoCard key={v._id} video={v} />)
                    }
                </div>
                {!loading && videos.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-4xl mb-3">🎬</p>
                        <p className="text-lg">{tab === 'following' ? 'Follow some creators to see their videos here' : 'No videos yet'}</p>
                        {user && <a href="/upload" className="mt-4 inline-block text-indigo-400 hover:underline text-sm">Upload the first one</a>}
                    </div>
                )}
                {loading && videos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}
                <div ref={sentinelRef} className="h-4 mt-4" />
                {!hasMore && videos.length > 0 && (
                    <p className="text-center text-gray-600 text-sm mt-4 pb-8">You've seen it all ✓</p>
                )}
            </div>
        </div>
    );
}
