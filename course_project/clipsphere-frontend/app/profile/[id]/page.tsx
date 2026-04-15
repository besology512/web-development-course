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
    likesCount?: number;
    reviewCount?: number;
    playbackUrl: string;
    avgRating?: number;
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
                    api.get(`/videos?owner=${id}&limit=12&skip=0`)
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

    if (loading) return (
        <div className="min-h-screen">
            <NavBar />
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"/>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen">
            <NavBar />
            <div className="flex items-center justify-center h-64 text-gray-400">User not found</div>
        </div>
    );

    const isSelf = user && user._id === id;

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)' }}>
            <NavBar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                    <div className="flex items-start justify-between gap-5 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
                                {profile.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">@{profile.username}</h1>
                                {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
                                <div className="flex gap-4 text-sm text-slate-400 mt-3 flex-wrap">
                                    <span>{videos.length} videos</span>
                                    <span>{followersCount} followers</span>
                                    <span>{followingCount} following</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isSelf && (
                                <Link href="/settings" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors">
                                    Settings
                                </Link>
                            )}
                            {user && !isSelf && (
                                <button onClick={handleFollow}
                                    disabled={busy}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        following
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}>
                                    {busy ? 'Working...' : following ? 'Unfollow' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                        <h2 className="text-xl font-semibold">Videos by @{profile.username}</h2>
                        <span className="text-sm text-slate-400">{videos.length} public videos</span>
                    </div>
                    {videos.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
                            No public videos yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {videos.map((video) => <VideoCard key={video._id} video={video} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
