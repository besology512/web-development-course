'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const [stats, setStats] = useState<Record<string, unknown> | null>(null);
    const [health, setHealth] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            router.push('/feed');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        Promise.all([api.get('/admin/stats'), api.get('/admin/health')])
            .then(([s, h]) => { setStats(s); setHealth(h); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    if (authLoading || loading) return (
        <div className="min-h-screen">
            <NavBar />
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"/>
            </div>
        </div>
    );

    const s = stats as { totalUsers?: number; totalVideos?: number; totalTips?: number; data?: { totalUsers?: number; totalVideos?: number } } | null;
    const statCards = [
        { label: 'Total Users', value: s?.totalUsers ?? s?.data?.totalUsers },
        { label: 'Total Videos', value: s?.totalVideos ?? s?.data?.totalVideos },
        { label: 'Tips Processed', value: s?.totalTips ?? 0 }
    ];

    return (
        <div className="min-h-screen">
            <NavBar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {statCards.map(s => (
                        <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-gray-400 text-sm">{s.label}</p>
                            <p className="text-3xl font-bold mt-2 text-white">{s.value ?? '—'}</p>
                        </div>
                    ))}
                </div>
                {health && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <h2 className="font-semibold mb-4 text-indigo-400">System Health</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-400">Status: </span>
                                <span className="text-green-400 font-medium">
                                    {((health as Record<string, unknown>).status as string) || 'OK'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">DB: </span>
                                <span className="text-green-400 font-medium">
                                    {((health as Record<string, unknown>).data as Record<string, unknown>)?.dbStatus as string || 'connected'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Uptime: </span>
                                <span>
                                    {((health as Record<string, unknown>).data as Record<string, unknown>)?.uptime as number ?? (health as Record<string, unknown>).uptime as number ?? 'N/A'}s
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
