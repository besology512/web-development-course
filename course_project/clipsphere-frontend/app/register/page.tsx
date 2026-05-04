'use client';
import { useState } from 'react';
import { api, setToken } from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', form);
            setToken(res.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.refresh();
            router.push('/feed');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const update = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
             style={{ background: '#f7f8fa' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/feed"
                          style={{ color: '#4f46e5', textDecoration: 'none', fontSize: 28, fontWeight: 700 }}>
                        ClipSphere
                    </Link>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
                        Create your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}
                      style={{
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 16,
                          padding: 32,
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                      }}>
                    {error && (
                        <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                padding: '10px 14px',
                                borderRadius: 8,
                                fontSize: 14,
                                marginBottom: 16
                             }}>
                            {error}
                        </div>
                    )}

                    <Field label="Username" value={form.username} onChange={update('username')} placeholder="coolcreator" />
                    <Field label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
                    <Field label="Password" type="password" value={form.password} onChange={update('password')} placeholder="Minimum 8 characters" />

                    <button type="submit" disabled={loading}
                            style={{
                                width: '100%',
                                background: loading ? '#a5b4fc' : '#4f46e5',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 600,
                                marginTop: 8,
                                opacity: loading ? 0.8 : 1
                            }}
                            onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#4338ca'; }}
                            onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 20 }}>
                        Have an account?{' '}
                        <Link href="/login" style={{ color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

function Field({ label, type = 'text', value, onChange, placeholder }: {
    label: string; type?: string; value: string;
    onChange: (v: string) => void; placeholder: string;
}) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#334155', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                {label}
            </label>
            <input value={value} onChange={e => onChange(e.target.value)}
                   type={type} placeholder={placeholder} required
                   style={{
                       width: '100%',
                       background: '#f8fafc',
                       border: '1px solid #e5e7eb',
                       borderRadius: 10,
                       padding: '11px 14px',
                       fontSize: 14,
                       color: '#0f172a',
                       transition: 'border-color 0.15s, background 0.15s'
                   }}
                   onFocus={e => {
                       e.currentTarget.style.borderColor = '#6366f1';
                       e.currentTarget.style.background = '#ffffff';
                   }}
                   onBlur={e => {
                       e.currentTarget.style.borderColor = '#e5e7eb';
                       e.currentTarget.style.background = '#f8fafc';
                   }} />
        </div>
    );
}
