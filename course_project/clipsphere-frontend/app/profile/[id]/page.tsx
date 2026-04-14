'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import Link from 'next/link';

interface Profile {
    _id: string;
    username: string;
    bio?: string;
    avatarKey?: string;
}

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        api.get(`/users/${id}`)
            .then(res => setProfile(res.data.user))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleFollow = async () => {
        try {
            if (following) {
                await api.delete(`/users/${id}/unfollow`);
            } else {
                await api.post(`/users/${id}/follow`, {});
            }
            setFollowing(!following);
        } catch {}
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
        <div className="min-h-screen">
            <NavBar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
                                {profile.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">@{profile.username}</h1>
                                {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
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
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        following
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}>
                                    {following ? 'Unfollow' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
