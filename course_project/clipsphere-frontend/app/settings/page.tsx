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
        <div className="min-h-screen">
            <NavBar />
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"/>
            </div>
        </div>
    );

    const notifKeys: NotifKey[] = ['followers', 'comments', 'likes', 'tips'];

    return (
        <div className="min-h-screen">
            <NavBar />
            <div className="max-w-lg mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
                {(['inApp', 'email'] as NotifType[]).map(type => (
                    <div key={type} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
                        <h2 className="font-semibold mb-4 text-indigo-400">
                            {type === 'inApp' ? '🔔 In-App Alerts' : '📧 Email Alerts'}
                        </h2>
                        {notifKeys.map(k => (
                            <div key={k} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                <span className="text-sm capitalize">{k}</span>
                                <button onClick={() => toggle(type, k)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${prefs[type][k] ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs[type][k] ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
                <button onClick={handleSave}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold transition-colors">
                    {saved ? '✓ Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
