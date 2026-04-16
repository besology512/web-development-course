'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';

interface ActiveUser {
    _id?: string;
    username: string;
    videoCount: number;
}

interface ModerationVideo {
    _id: string;
    title: string;
    status: string;
    owner?: {
        _id: string;
        username: string;
    };
}

interface AdminStats {
    totalUsers: number;
    totalVideos: number;
    totalTips: number;
    mostActiveUsers: ActiveUser[];
}

interface AdminHealth {
    uptime?: string;
    dbConnection?: string;
    memory?: {
        rss?: string;
        heapTotal?: string;
        heapUsed?: string;
    };
}

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [health, setHealth] = useState<AdminHealth | null>(null);
    const [moderation, setModeration] = useState<ModerationVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 'admin') {
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/health'),
            api.get('/admin/moderation')
        ])
            .then(([statsRes, healthRes, moderationRes]) => {
                setStats((statsRes.data as AdminStats) || null);
                setHealth((healthRes.data as AdminHealth) || null);
                setModeration((moderationRes.data?.videos as ModerationVideo[]) || []);
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : 'Failed to load admin data';
                if (/permission|logged in|access/i.test(message)) {
                    setAccessDenied(true);
                } else {
                    setError(message);
                }
            })
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen">
                <NavBar />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen">
                <NavBar />
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">404</p>
                    <h1 className="mt-3 text-3xl font-bold text-slate-900">Admin page not found</h1>
                    <p className="mt-3 text-slate-600">
                        This panel is only available to the seeded admin account.
                    </p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? '—' },
        { label: 'Total Videos', value: stats?.totalVideos ?? '—' },
        { label: 'Tips Processed', value: stats?.totalTips ?? '—' }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar />
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Admin</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">Platform Dashboard</h1>
                    <p className="mt-2 text-slate-600">
                        Restricted access for the seeded admin account only.
                    </p>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statCards.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">{item.label}</p>
                            <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-slate-500">Database</span>
                                <p className="mt-1 font-medium text-slate-900">{health?.dbConnection ?? 'unknown'}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">Uptime</span>
                                <p className="mt-1 font-medium text-slate-900">{health?.uptime ?? 'unknown'}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">RSS Memory</span>
                                <p className="mt-1 font-medium text-slate-900">{health?.memory?.rss ?? 'unknown'}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">Heap Used</span>
                                <p className="mt-1 font-medium text-slate-900">{health?.memory?.heapUsed ?? 'unknown'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">Most Active Users</h2>
                        <div className="mt-4 space-y-3">
                            {(stats?.mostActiveUsers?.length ? stats.mostActiveUsers : []).map((entry) => (
                                <div key={`${entry.username}-${entry.videoCount}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="font-medium text-slate-900">@{entry.username}</span>
                                    <span className="text-sm text-slate-500">{entry.videoCount} videos</span>
                                </div>
                            ))}
                            {!stats?.mostActiveUsers?.length && (
                                <p className="text-sm text-slate-500">No activity data is available yet.</p>
                            )}
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">Moderation Queue</h2>
                    <div className="mt-4 space-y-3">
                        {moderation.length === 0 ? (
                            <p className="text-sm text-slate-500">No flagged or reported content right now.</p>
                        ) : (
                            moderation.map((video) => (
                                <div key={video._id} className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">{video.title}</p>
                                        <p className="text-sm text-slate-500">
                                            {video.owner?.username ? `@${video.owner.username}` : 'Unknown creator'}
                                        </p>
                                    </div>
                                    <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                                        {video.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
