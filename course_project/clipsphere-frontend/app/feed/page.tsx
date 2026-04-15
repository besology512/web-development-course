'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import NavBar from '@/components/NavBar';
import VideoCard from '@/components/VideoCard';
import SkeletonCard from '@/components/SkeletonCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/hooks/useAuth';

interface Video {
    _id: string;
    title: string;
    description?: string;
    duration: number;
    viewsCount: number;
    likesCount?: number;
    reviewCount?: number;
    playbackUrl: string;
    avgRating?: number;
    owner?: { _id: string; username: string };
}

export default function FeedPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [tab, setTab] = useState<'trending' | 'following'>('trending');
    const { user } = useAuth();

    const fetchVideos = useCallback(async (reset = false, currentSkip = 0) => {
        setLoading(true);
        try {
            const res = await api.get(`/videos?limit=8&skip=${currentSkip}&feed=${tab}`);
            const newVideos = res.data.videos as Video[];
            setVideos((prev) => reset ? newVideos : [...prev, ...newVideos]);
            setSkip(currentSkip + newVideos.length);
            setHasMore(newVideos.length === 8);
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
    }, [tab, fetchVideos]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) fetchVideos(false, skip);
    }, [loading, hasMore, fetchVideos, skip]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)' }}>
            <NavBar />
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Discover Videos</h1>
                        <p className="text-sm text-slate-400 mt-2">
                            {tab === 'trending'
                                ? 'Browse the highest performing public videos.'
                                : user
                                    ? 'Videos from creators you follow.'
                                    : 'Sign in to see videos from creators you follow.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {(['trending', 'following'] as const).map((currentTab) => (
                            <button
                                key={currentTab}
                                onClick={() => setTab(currentTab)}
                                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                                    tab === currentTab
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                {currentTab === 'trending' ? 'Trending' : 'Following'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {loading && videos.length === 0
                        ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
                        : videos.map((video) => <VideoCard key={video._id} video={video} />)}
                </div>

                {!loading && videos.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-4xl mb-3">🎬</p>
                        <p className="text-lg">{tab === 'following' ? 'Follow some creators to see their videos here' : 'No videos yet'}</p>
                        {user && <a href="/upload" className="mt-4 inline-block text-indigo-400 hover:underline text-sm">Upload the first one</a>}
                    </div>
                )}

                {loading && videos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                        {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                )}

                <div ref={sentinelRef} className="h-4 mt-4" />
                {!hasMore && videos.length > 0 && (
                    <p className="text-center text-slate-500 text-sm mt-4 pb-8">You&apos;ve reached the end.</p>
                )}
            </div>
        </div>
    );
}
