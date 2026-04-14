'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/feed');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md space-y-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-400">ClipSphere</h1>
                    <p className="text-gray-400 text-sm mt-1">Sign in to continue</p>
                </div>
                {error && <p className="text-red-400 text-sm text-center bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" required />
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" required />
                <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition-colors">
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <p className="text-center text-sm text-gray-400">
                    No account?{' '}
                    <Link href="/register" className="text-indigo-400 hover:underline">Register</Link>
                </p>
            </form>
        </div>
    );
}
