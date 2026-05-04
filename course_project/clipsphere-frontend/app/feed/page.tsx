'use client';
import { Suspense, useState, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
    description?: string;
    duration: number;
    viewsCount: number;
    likesCount: number;
    tippedAmount: number;
    avgRating?: number;
    reviewCount?: number;
    playbackUrl: string;
    owner?: { _id: string; username: string };
}

interface CreatorSummary {
    id: string;
    username: string;
    tipped: number;
    views: number;
}

function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <div
            className="min-h-screen"
            style={{
                background: 'radial-gradient(circle at top left, rgba(40,183,214,0.12), transparent 28%), linear-gradient(180deg, #eef3f8 0%, #f7fafc 100%)',
                overflowX: 'hidden'
            }}
        >
            {children}
        </div>
    );
}

function FeedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [tab, setTab] = useState<'trending' | 'following'>('trending');
    const [toast, setToast] = useState<string | null>(null);
    const [liveNotifications, setLiveNotifications] = useState<string[]>([]);
    const [tipSyncing, setTipSyncing] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(0);
    const { user } = useAuth();
    const { socket } = useSocket();

    useEffect(() => {
        const updateViewport = () => setViewportWidth(window.innerWidth);
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handler = (data: { likerUsername: string; videoTitle: string }) => {
            const message = `${data.likerUsername} liked your video "${data.videoTitle}"`;
            setToast(message);
            setLiveNotifications((prev) => [message, ...prev].slice(0, 10));
        };

        socket.on('new-like', handler);
        return () => {
            socket.off('new-like', handler);
        };
    }, [socket]);

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

    useEffect(() => {
        const onFocus = () => fetchVideos(true, 0);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchVideos]);

    useEffect(() => {
        const tipStatus = searchParams.get('tip');
        const sessionId = searchParams.get('session_id');

        if (tipStatus === 'cancelled') {
            setToast('Tip payment was cancelled.');
            router.replace('/feed');
            return;
        }

        if (tipStatus === 'success' && !sessionId) {
            setToast('Payment completed. Refreshing tip data.');
            fetchVideos(true, 0).finally(() => router.replace('/feed'));
            return;
        }

        if (tipStatus !== 'success' || !sessionId || !user || tipSyncing) return;

        const confirmTip = async () => {
            setTipSyncing(true);
            try {
                const res = await api.post('/tips/confirm', { sessionId });
                if (res.data.paymentStatus === 'paid') {
                    setToast(`Tip payment confirmed. $${(Number(res.data.amountTotal || 0) / 100).toFixed(2)} was added.`);
                } else {
                    setToast('Payment was received, but it is still processing.');
                }
                await fetchVideos(true, 0);
            } catch (error) {
                setToast(error instanceof Error ? error.message : 'Tip confirmation failed.');
            } finally {
                setTipSyncing(false);
                router.replace('/feed');
            }
        };

        confirmTip();
    }, [searchParams, user, tipSyncing, fetchVideos, router]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) fetchVideos(false, skip);
    }, [loading, hasMore, fetchVideos, skip]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

    const topCreators = videos.reduce<CreatorSummary[]>((acc, video) => {
        if (!video.owner?._id || !video.owner.username) return acc;

        const existing = acc.find((item) => item.id === video.owner?._id);
        if (existing) {
            existing.tipped += Number(video.tippedAmount || 0);
            existing.views += Number(video.viewsCount || 0);
            return acc;
        }

        acc.push({
            id: video.owner._id,
            username: video.owner.username,
            tipped: Number(video.tippedAmount || 0),
            views: Number(video.viewsCount || 0)
        });
        return acc;
    }, []).sort((a, b) => (b.tipped + b.views) - (a.tipped + a.views)).slice(0, 4);

    const statCards = [
        { label: 'Videos', value: videos.length, accent: '#28b7d6' },
        { label: 'Likes', value: videos.reduce((sum, video) => sum + Number(video.likesCount || 0), 0), accent: '#fb7185' },
        { label: 'Views', value: videos.reduce((sum, video) => sum + Number(video.viewsCount || 0), 0), accent: '#94a3b8' }
    ];
    const showLeftRail = viewportWidth >= 1024;
    const showRightRail = viewportWidth >= 1280;
    const useTwoColumnCards = viewportWidth >= 900;
    const dashboardColumns = showRightRail
        ? '220px minmax(0, 1fr) 290px'
        : showLeftRail
            ? '220px minmax(0, 1fr)'
            : 'minmax(0, 1fr)';

    const menuItems = [
        { label: 'Home', active: tab === 'trending', action: () => setTab('trending') },
        { label: 'Trending', active: tab === 'trending', action: () => setTab('trending') },
        { label: 'Following', active: tab === 'following', action: () => setTab('following') },
        { label: 'Profile', active: false, action: () => user && router.push(`/profile/${user._id}`) },
        { label: 'Settings', active: false, action: () => router.push('/settings') }
    ];

    return (
        <DashboardShell>
            <NavBar notifications={liveNotifications} />
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-5 md:py-8">
                <div
                    style={{
                        display: 'grid',
                        gap: viewportWidth >= 1280 ? 24 : 20,
                        gridTemplateColumns: dashboardColumns
                    }}
                >
                    <aside
                        style={{
                            display: showLeftRail ? 'block' : 'none',
                            background: 'rgba(255,255,255,0.9)',
                            border: '1px solid rgba(201, 214, 228, 0.82)',
                            borderRadius: 30,
                            padding: 18,
                            boxShadow: '0 24px 48px rgba(22, 34, 58, 0.08)',
                            alignSelf: 'start',
                            position: 'sticky',
                            top: 96
                        }}
                    >
                        <Link href="/feed" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                            <span
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #28b7d6 0%, #7c3aed 100%)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: 15,
                                    fontWeight: 800
                                }}
                            >
                                C
                            </span>
                            <span style={{ color: '#16223a', fontSize: 20, fontWeight: 800 }}>ClipSphere</span>
                        </Link>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: item.active ? 'linear-gradient(135deg, rgba(40,183,214,0.18), rgba(40,183,214,0.08))' : 'transparent',
                                        color: item.active ? '#16223a' : '#74849b',
                                        borderRadius: 16,
                                        padding: '12px 14px',
                                        fontSize: 14,
                                        fontWeight: item.active ? 800 : 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: 24,
                                background: 'linear-gradient(180deg, #202736 0%, #293348 100%)',
                                borderRadius: 24,
                                padding: 18,
                                color: '#fff'
                            }}
                        >
                            <p style={{ margin: 0, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                                Feed Mode
                            </p>
                            <h3 style={{ margin: '8px 0 6px', fontSize: 20, fontWeight: 800 }}>
                                {tab === 'trending' ? 'Trending' : 'Following'}
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.72)' }}>
                                {tab === 'trending'
                                    ? 'Browse the strongest clips with live previews and visible engagement.'
                                    : 'See only videos from creators you chose to follow.'}
                            </p>
                        </div>
                    </aside>

                    <main style={{ minWidth: 0 }}>
                        <section
                            style={{
                                background: 'rgba(255,255,255,0.92)',
                                border: '1px solid rgba(201, 214, 228, 0.82)',
                                borderRadius: 30,
                                padding: 18,
                                boxShadow: '0 24px 48px rgba(22, 34, 58, 0.08)'
                            }}
                        >
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <p style={{ color: '#49acc3', fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', margin: 0 }}>
                                        Feed Dashboard
                                    </p>
                                    <h1 style={{ color: '#16223a', fontSize: 28, fontWeight: 800, margin: '8px 0 0' }}>
                                        {tab === 'trending' ? 'Trending Videos' : 'Following Feed'}
                                    </h1>
                                    <p style={{ color: '#74849b', fontSize: 14, margin: '10px 0 0', maxWidth: 520, lineHeight: 1.6 }}>
                                        {tab === 'trending'
                                            ? 'Smaller, cleaner cards with real previews, live engagement, and better spacing on every screen.'
                                            : 'Only creators you follow appear here, with the same compact responsive layout.'}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <div style={{ display: 'inline-flex', gap: 8, background: '#f4f8fb', borderRadius: 999, padding: 6, border: '1px solid #dfebf2' }}>
                                        {(['following', 'trending'] as const).map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => setTab(value)}
                                                style={{
                                                    background: tab === value ? '#ffffff' : 'transparent',
                                                    color: tab === value ? '#16223a' : '#74849b',
                                                    border: 'none',
                                                    padding: '10px 18px',
                                                    borderRadius: 999,
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    textTransform: 'capitalize',
                                                    cursor: 'pointer',
                                                    boxShadow: tab === value ? '0 8px 20px rgba(22,34,58,0.08)' : 'none'
                                                }}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:min-w-[240px]">
                                        {statCards.map((item) => (
                                            <div
                                                key={item.label}
                                                style={{
                                                    background: '#f8fbfe',
                                                    borderRadius: 18,
                                                    padding: '11px 12px',
                                                    border: '1px solid #e6eef4'
                                                }}
                                            >
                                                <div style={{ color: '#8ea0b4', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                                                    {item.label}
                                                </div>
                                                <div style={{ color: item.accent, fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                                                    {item.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {!loading && videos.length === 0 && (
                            <section
                                style={{
                                    marginTop: 20,
                                    background: '#ffffff',
                                    border: '1px solid rgba(201, 214, 228, 0.82)',
                                    borderRadius: 30,
                                    padding: '44px 24px',
                                    textAlign: 'center',
                                    boxShadow: '0 20px 40px rgba(22, 34, 58, 0.06)'
                                }}
                            >
                                <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>
                                    {tab === 'following'
                                        ? user
                                            ? 'You are not following anyone yet, so the following feed is empty.'
                                            : 'Sign in to see videos only from the creators you follow.'
                                        : 'No videos are available yet.'}
                                </p>
                                {!user && tab === 'following' && (
                                    <Link href="/login" style={{ display: 'inline-block', marginTop: 16, color: '#1d2230', fontWeight: 800, textDecoration: 'none' }}>
                                        Sign in to use Following
                                    </Link>
                                )}
                            </section>
                        )}

                        <div
                            style={{
                                marginTop: 20,
                                alignItems: 'stretch',
                                justifyItems: 'center',
                                display: 'grid',
                                gap: viewportWidth >= 768 ? 20 : 16,
                                gridTemplateColumns: useTwoColumnCards ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)'
                            }}
                        >
                            {loading && videos.length === 0
                                ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                                : videos.map((video) => <VideoCard key={video._id} video={video} />)}
                        </div>

                        {loading && videos.length > 0 && (
                            <div
                                style={{
                                    marginTop: 20,
                                    justifyItems: 'center',
                                    display: 'grid',
                                    gap: viewportWidth >= 768 ? 20 : 16,
                                    gridTemplateColumns: useTwoColumnCards ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)'
                                }}
                            >
                                {Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} />)}
                            </div>
                        )}

                        <div ref={sentinelRef} style={{ height: 20, marginTop: 20 }} />

                        {!hasMore && videos.length > 0 && (
                            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 12, paddingBottom: 36 }}>
                                You&apos;ve reached the end of this feed.
                            </p>
                        )}
                    </main>

                    <aside style={{ display: showRightRail ? 'block' : 'none', alignSelf: 'start', position: 'sticky', top: 96 }}>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.92)',
                                border: '1px solid rgba(201, 214, 228, 0.82)',
                                borderRadius: 30,
                                padding: 18,
                                boxShadow: '0 24px 48px rgba(22, 34, 58, 0.08)'
                            }}
                        >
                            <div style={{ marginBottom: 18 }}>
                                <p style={{ color: '#8ea0b4', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>
                                    Top Creators
                                </p>
                                <h2 style={{ color: '#16223a', fontSize: 19, fontWeight: 800, margin: '8px 0 0' }}>
                                    Creator Snapshot
                                </h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {topCreators.length === 0 ? (
                                    <p style={{ color: '#7c8ba0', fontSize: 14, margin: 0 }}>Creator stats will appear once videos are loaded.</p>
                                ) : (
                                    topCreators.map((creator, index) => (
                                        <Link
                                            key={creator.id}
                                            href={`/profile/${creator.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 12,
                                                background: '#f8fbfe',
                                                border: '1px solid #e7eef5',
                                                borderRadius: 20,
                                                padding: '13px 14px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span
                                                    style={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: '50%',
                                                        background: index === 0 ? 'linear-gradient(135deg, #ffb057, #fb7185)' : 'linear-gradient(135deg, #28b7d6, #7c3aed)',
                                                        color: '#fff',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 14,
                                                        fontWeight: 800
                                                    }}
                                                >
                                                    {creator.username[0].toUpperCase()}
                                                </span>
                                                <div>
                                                    <div style={{ color: '#16223a', fontSize: 14, fontWeight: 800 }}>@{creator.username}</div>
                                                    <div style={{ color: '#7c8ba0', fontSize: 12 }}>{creator.views} views</div>
                                                </div>
                                            </div>
                                            <div style={{ color: '#fb7185', fontSize: 13, fontWeight: 800 }}>
                                                ${creator.tipped.toFixed(2)}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop: 18,
                                    background: 'linear-gradient(180deg, #f8fbfe 0%, #ffffff 100%)',
                                    border: '1px solid #e7eef5',
                                    borderRadius: 24,
                                    padding: 16
                                }}
                            >
                                <p style={{ color: '#8ea0b4', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>
                                    Live Activity
                                </p>
                                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {(liveNotifications.length > 0 ? liveNotifications : ['Likes, tips, and reviews will appear here as they happen.']).slice(0, 4).map((item, index) => (
                                        <div
                                            key={`${item}-${index}`}
                                            style={{
                                                background: '#fff',
                                                borderRadius: 18,
                                                border: '1px solid #e7eef5',
                                                padding: '12px 13px',
                                                color: '#5f6f85',
                                                fontSize: 13,
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardShell>
    );
}

export default function FeedPage() {
    return (
        <Suspense fallback={<DashboardShell><NavBar /></DashboardShell>}>
            <FeedContent />
        </Suspense>
    );
}
