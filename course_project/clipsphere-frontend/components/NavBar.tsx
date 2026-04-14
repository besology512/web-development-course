'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface NavBarProps {
    hasActivity?: boolean;
    onActivityClick?: () => void;
}

export default function NavBar({ hasActivity, onActivityClick }: NavBarProps) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
            <Link href="/feed" className="text-xl font-bold text-indigo-400">ClipSphere</Link>
            <div className="flex items-center gap-4">
                <Link href="/feed" className="text-gray-300 hover:text-white text-sm transition-colors">Feed</Link>
                {user && (
                    <Link href="/upload" className="text-gray-300 hover:text-white text-sm transition-colors">Upload</Link>
                )}
                {user?.role === 'admin' && (
                    <Link href="/admin" className="text-gray-300 hover:text-white text-sm transition-colors">Admin</Link>
                )}
                {user && (
                    <button onClick={() => { onActivityClick?.(); }} className="relative text-gray-300 hover:text-white text-sm transition-colors">
                        Activity
                        {hasActivity && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                        )}
                    </button>
                )}
                {user ? (
                    <>
                        <Link href={`/profile/${user._id}`} className="text-sm text-gray-300 hover:text-white">@{user.username}</Link>
                        <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors">Logout</button>
                    </>
                ) : (
                    <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Login</Link>
                )}
            </div>
        </nav>
    );
}
