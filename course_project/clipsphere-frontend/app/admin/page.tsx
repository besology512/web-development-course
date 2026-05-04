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
        <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
            <NavBar />
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin"
                     style={{ width: 32, height: 32, borderRadius: '50%',
                              border: '3px solid #e0e7ff', borderTopColor: '#4f46e5' }} />
            </div>
        </div>
    );

    const s = stats as { totalUsers?: number; totalVideos?: number; totalTips?: number;
                         data?: { totalUsers?: number; totalVideos?: number } } | null;
    const statCards = [
        { label: 'Total Users', value: s?.totalUsers ?? s?.data?.totalUsers },
        { label: 'Total Videos', value: s?.totalVideos ?? s?.data?.totalVideos },
        { label: 'Tips Processed', value: s?.totalTips ?? 0 }
    ];

    const h = health as { status?: string; uptime?: number;
                          data?: { dbStatus?: string; uptime?: number } } | null;

    return (
        <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
            <NavBar />
            <div className="max-w-4xl mx-auto px-4 py-10">
                <h1 style={{ color: '#0f172a', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
                    Admin Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {statCards.map(c => (
                        <div key={c.label}
                             style={{
                                 background: '#ffffff',
                                 border: '1px solid #e5e7eb',
                                 borderRadius: 12,
                                 padding: 20
                             }}>
                            <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, margin: 0 }}>
                                {c.label}
                            </p>
                            <p style={{ color: '#0f172a', fontSize: 30, fontWeight: 700, margin: '8px 0 0 0' }}>
                                {c.value ?? '—'}
                            </p>
                        </div>
                    ))}
                </div>

                {h && (
                    <div style={{
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 12,
                            padding: 20
                         }}>
                        <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
                            System Health
                        </h2>
                        <div className="grid grid-cols-2 gap-3" style={{ fontSize: 14 }}>
                            <HealthItem label="Status" value={h.status || 'OK'} success />
                            <HealthItem label="Database" value={h.data?.dbStatus || 'connected'} success />
                            <HealthItem label="Uptime" value={`${h.data?.uptime ?? h.uptime ?? 'N/A'}s`} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function HealthItem({ label, value, success }: { label: string; value: string; success?: boolean }) {
    return (
        <div>
            <span style={{ color: '#64748b' }}>{label}: </span>
            <span style={{ color: success ? '#059669' : '#334155', fontWeight: 500 }}>
                {value}
            </span>
        </div>
    );
}
