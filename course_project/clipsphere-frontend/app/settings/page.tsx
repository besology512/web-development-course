'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import NavBar from '@/components/NavBar';

type NotifKey = 'followers' | 'comments' | 'likes' | 'tips';
type NotifType = 'inApp' | 'email';

interface Prefs {
    inApp: Record<NotifKey, boolean>;
    email: Record<NotifKey, boolean>;
}

const defaultPrefs: Prefs = {
    inApp: { followers: true, comments: true, likes: true, tips: true },
    email: { followers: true, comments: true, likes: true, tips: true }
};

export default function SettingsPage() {
    const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/me').then(res => {
            if (res.data.user?.notifications) setPrefs(res.data.user.notifications);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            await api.patch('/users/preferences', prefs);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {}
    };

    const toggle = (type: NotifType, key: NotifKey) => {
        setPrefs(prev => ({
            ...prev,
            [type]: { ...prev[type], [key]: !prev[type][key] }
        }));
    };

    if (loading) return (
        <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
            <NavBar />
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin"
                     style={{ width: 32, height: 32, borderRadius: '50%',
                              border: '3px solid #e0e7ff', borderTopColor: '#4f46e5' }} />
            </div>
        </div>
    );

    const notifKeys: NotifKey[] = ['followers', 'comments', 'likes', 'tips'];

    return (
        <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
            <NavBar />
            <div className="max-w-lg mx-auto px-4 py-10">
                <h1 style={{ color: '#0f172a', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
                    Notification Settings
                </h1>

                {(['inApp', 'email'] as NotifType[]).map(type => (
                    <div key={type}
                         style={{
                             background: '#ffffff',
                             border: '1px solid #e5e7eb',
                             borderRadius: 12,
                             padding: 20,
                             marginBottom: 16
                         }}>
                        <h2 style={{
                                color: '#0f172a',
                                fontSize: 15,
                                fontWeight: 600,
                                marginBottom: 14
                             }}>
                            {type === 'inApp' ? 'In-App Alerts' : 'Email Alerts'}
                        </h2>
                        {notifKeys.map((k, i) => (
                            <div key={k}
                                 style={{
                                     display: 'flex',
                                     justifyContent: 'space-between',
                                     alignItems: 'center',
                                     padding: '10px 0',
                                     borderBottom: i < notifKeys.length - 1 ? '1px solid #f1f5f9' : 'none'
                                 }}>
                                <span style={{ color: '#334155', fontSize: 14, textTransform: 'capitalize' }}>{k}</span>
                                <button onClick={() => toggle(type, k)}
                                        style={{
                                            width: 42,
                                            height: 24,
                                            borderRadius: 999,
                                            background: prefs[type][k] ? '#4f46e5' : '#cbd5e1',
                                            border: 'none',
                                            position: 'relative',
                                            transition: 'background 0.2s'
                                        }}>
                                    <span style={{
                                              position: 'absolute',
                                              top: 2,
                                              left: prefs[type][k] ? 20 : 2,
                                              width: 20,
                                              height: 20,
                                              background: '#ffffff',
                                              borderRadius: '50%',
                                              transition: 'left 0.2s',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                          }} />
                                </button>
                            </div>
                        ))}
                    </div>
                ))}

                <button onClick={handleSave}
                        style={{
                            width: '100%',
                            background: saved ? '#059669' : '#4f46e5',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: 10,
                            fontSize: 15,
                            fontWeight: 600,
                            transition: 'background 0.2s'
                        }}>
                    {saved ? 'Saved' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
