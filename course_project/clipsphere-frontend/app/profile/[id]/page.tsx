'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import VideoCard from '@/components/VideoCard';
import Link from 'next/link';

interface Profile {
    _id: string;
    username: string;
    bio?: string;
    avatarKey?: string;
}

interface Video {
    _id: string;
    title: string;
    description?: string;
    duration: number;
    viewsCount: number;
    likesCount: number;
    avgRating?: number;
    reviewCount?: number;
    playbackUrl: string;
    owner?: { _id: string; username: string };
}

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [following, setFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const requests: Promise<unknown>[] = [
                    api.get(`/users/${id}/profile`),
                    api.get(`/users/${id}/followers`),
                    api.get(`/users/${id}/following`),
                    api.get(`/videos?owner=${id}&limit=20&skip=0`)
                ];

                if (user) {
                    requests.push(api.get(`/users/${user._id}/following`));
                }

                const [profileRes, followersRes, followingRes, videosRes, myFollowingRes] = await Promise.all(requests);
                setProfile((profileRes as { data: { user: Profile } }).data.user);
                setFollowersCount((followersRes as { data: { followers: unknown[] } }).data.followers.length);
                setFollowingCount((followingRes as { data: { following: unknown[] } }).data.following.length);
                setVideos((videosRes as { data: { videos: Video[] } }).data.videos);

                if (user && myFollowingRes) {
                    const followingList = (myFollowingRes as { data: { following: { followingId: { _id: string } }[] } }).data.following;
                    setFollowing(followingList.some((entry) => entry.followingId._id === id));
                } else {
                    setFollowing(false);
                }
            } catch (error) {
                console.error(error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user) return;
        setBusy(true);
        try {
            if (following) {
                await api.delete(`/users/${id}/unfollow`);
                setFollowersCount((count) => Math.max(0, count - 1));
            } else {
                await api.post(`/users/${id}/follow`, {});
                setFollowersCount((count) => count + 1);
            }
            setFollowing((value) => !value);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Follow action failed');
        } finally {
            setBusy(false);
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

    if (!profile) {
        return (
            <div className="min-h-screen" style={{ background: '#f8fafc' }}>
                <NavBar />
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>
                    User not found
                </div>
            </div>
        );
    }

    const isSelf = user && user._id === id;

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
            <NavBar />

            <div className="max-w-6xl mx-auto px-4 py-10">
                <section
                    style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 24,
                        padding: 28,
                        boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                            <div
                                style={{
                                    width: 76,
                                    height: 76,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0f172a, #4f46e5)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 30,
                                    fontWeight: 800
                                }}
                            >
                                {profile.username[0].toUpperCase()}
                            </div>

                            <div>
                                <h1 style={{ color: '#0f172a', fontSize: 28, fontWeight: 800, margin: 0 }}>
                                    @{profile.username}
                                </h1>
                                {profile.bio && (
                                    <p style={{ color: '#64748b', fontSize: 15, margin: '8px 0 0 0', maxWidth: 560 }}>
                                        {profile.bio}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
                                    <span style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>{videos.length} videos</span>
                                    <span style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>{followersCount} followers</span>
                                    <span style={{ color: '#334155', fontSize: 14, fontWeight: 600 }}>{followingCount} following</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {isSelf && (
                                <Link
                                    href="/settings"
                                    style={{
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        color: '#334155',
                                        padding: '10px 18px',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Settings
                                </Link>
                            )}
                            {user && !isSelf && (
                                <button
                                    onClick={handleFollow}
                                    disabled={busy}
                                    style={{
                                        background: following ? '#f8fafc' : '#0f172a',
                                        border: '1px solid #e2e8f0',
                                        color: following ? '#334155' : '#ffffff',
                                        padding: '10px 18px',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        opacity: busy ? 0.7 : 1
                                    }}
                                >
                                    {busy ? 'Working...' : following ? 'Unfollow' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section style={{ marginTop: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <h2 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, margin: 0 }}>
                            Videos by @{profile.username}
                        </h2>
                    </div>

                    {videos.length === 0 ? (
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: '36px 24px', textAlign: 'center', color: '#64748b' }}>
                            No public videos yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {videos.map((video) => <VideoCard key={video._id} video={video} />)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
