'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

interface NavBarProps {
    hasActivity?: boolean;
    notifications?: string[];
    onActivityClick?: () => void;
}

const mobileLinks = [
    { href: '/feed', label: 'Feed', icon: 'home' },
    { href: '/upload', label: 'Upload', icon: 'plus' },
    { href: '/settings', label: 'Settings', icon: 'settings' }
] as const;

function Icon({ name, active = false }: { name: 'home' | 'plus' | 'settings' | 'bell' | 'user' | 'search'; active?: boolean }) {
    const stroke = active ? '#0f172a' : '#718197';
    switch (name) {
        case 'home':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 9.8V21h14V9.8" />
                </svg>
            );
        case 'plus':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                </svg>
            );
        case 'settings':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .17 1.7 1.7 0 0 0-.8 1.45V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.8-1.45 1.7 1.7 0 0 0-1-.17 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.17-1 1.7 1.7 0 0 0-1.45-.8H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.45-.8 1.7 1.7 0 0 0 .17-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6c.33 0 .67-.06 1-.17a1.7 1.7 0 0 0 .8-1.45V3a2 2 0 1 1 4 0v.09c0 .62.3 1.2.8 1.45.33.11.67.17 1 .17a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .33.06.67.17 1 .25.5.83.8 1.45.8H21a2 2 0 1 1 0 4h-.09c-.62 0-1.2.3-1.45.8-.11.33-.17.67-.17 1Z" />
                </svg>
            );
        case 'bell':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18H5.5a1 1 0 0 1-.8-1.6L6 14.5V10a6 6 0 1 1 12 0v4.5l1.3 1.9a1 1 0 0 1-.8 1.6H18" />
                    <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
                </svg>
            );
        case 'user':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.8-3.4 5-5 8-5s6.2 1.6 8 5" />
                </svg>
            );
        case 'search':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
            );
    }
}

export default function NavBar({ hasActivity, notifications = [], onActivityClick }: NavBarProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showActivity, setShowActivity] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(0);
    const activityRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateViewport = () => setViewportWidth(window.innerWidth);
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    useEffect(() => {
        if (!showActivity) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (activityRef.current && !activityRef.current.contains(e.target as Node)) {
                setShowActivity(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActivity]);

    const mergedNotifications = notifications.slice(0, 20);
    const compactGuestAction = !user && viewportWidth > 0 && viewportWidth < 480;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const toggleActivity = () => {
        setShowActivity((value) => !value);
        onActivityClick?.();
    };

    return (
        <>
            <nav
                style={{
                    background: 'rgba(255,255,255,0.86)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border)',
                    height: 76
                }}
                className="sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-3 md:px-6 h-full flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/feed" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <span
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #28b7d6 0%, #7c3aed 100%)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: 15,
                                    fontWeight: 800
                                }}
                            >
                                C
                            </span>
                            <span style={{ color: 'var(--navy)', fontSize: 'clamp(15px, 4.2vw, 22px)', fontWeight: 800 }}>
                                ClipSphere
                            </span>
                        </Link>
                    </div>

                    <div
                        className="hidden md:flex items-center gap-3"
                        style={{
                            flex: 1,
                            maxWidth: 420,
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: '0 14px',
                            height: 46,
                            boxShadow: 'var(--card-shadow)'
                        }}
                    >
                        <Icon name="search" />
                        <input
                            aria-label="Search"
                            placeholder="Search videos, creators, activity..."
                            style={{
                                width: '100%',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text)',
                                fontSize: 14
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        {user && (
                            <div ref={activityRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={toggleActivity}
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 14,
                                        border: '1px solid var(--border)',
                                        background: '#fff',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        boxShadow: 'var(--card-shadow)'
                                    }}
                                >
                                    <Icon name="bell" />
                                    {(hasActivity || mergedNotifications.length > 0) && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: 7,
                                                right: 8,
                                                width: 9,
                                                height: 9,
                                                borderRadius: '50%',
                                                background: '#ef4444',
                                                border: '2px solid #fff'
                                            }}
                                        />
                                    )}
                                </button>

                                {showActivity && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 12px)',
                                            right: 0,
                                            width: 340,
                                            maxWidth: '85vw',
                                            background: '#fff',
                                            border: '1px solid var(--border)',
                                            borderRadius: 18,
                                            boxShadow: '0 24px 50px rgba(15, 23, 42, 0.14)',
                                            overflow: 'hidden',
                                            zIndex: 50
                                        }}
                                    >
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--navy)', fontSize: 14, fontWeight: 800 }}>
                                            Activity
                                        </div>
                                        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                            {mergedNotifications.length === 0 ? (
                                                <p style={{ padding: '24px 16px', color: 'var(--text-subtle)', fontSize: 14, textAlign: 'center', margin: 0 }}>
                                                    No activity yet.
                                                </p>
                                            ) : (
                                                mergedNotifications.map((item, index) => (
                                                    <div
                                                        key={`${item}-${index}`}
                                                        style={{
                                                            padding: '13px 16px',
                                                            borderBottom: index < mergedNotifications.length - 1 ? '1px solid #eff4f8' : 'none',
                                                            color: 'var(--text-muted)',
                                                            fontSize: 13,
                                                            lineHeight: 1.55
                                                        }}
                                                    >
                                                        {item}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <>
                                <Link
                                    href={`/profile/${user._id}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        textDecoration: 'none',
                                        background: '#fff',
                                        border: '1px solid var(--border)',
                                        borderRadius: 16,
                                        padding: '8px 14px',
                                        boxShadow: 'var(--card-shadow)'
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                                            color: '#fff',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 800
                                        }}
                                    >
                                        {user.username[0].toUpperCase()}
                                    </span>
                                    <span className="hidden md:inline" style={{ color: 'var(--navy)', fontSize: 14, fontWeight: 700 }}>
                                        @{user.username}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:inline-flex"
                                    style={{
                                        background: 'var(--navy)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '11px 16px',
                                        borderRadius: 14,
                                        fontSize: 14,
                                        fontWeight: 700
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                style={{
                                    background: 'var(--navy)',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    padding: compactGuestAction ? '9px' : '8px 10px',
                                    borderRadius: 14,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    minWidth: compactGuestAction ? 38 : undefined,
                                    minHeight: compactGuestAction ? 38 : undefined,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {compactGuestAction ? <Icon name="user" active /> : 'Login'}
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {user && (
                <div
                    className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
                    style={{
                        width: 'calc(100% - 24px)',
                        maxWidth: 420,
                        background: 'rgba(255,255,255,0.94)',
                        border: '1px solid var(--border)',
                        borderRadius: 22,
                        boxShadow: '0 18px 38px rgba(15, 23, 42, 0.14)',
                        padding: '8px 10px'
                    }}
                >
                    <div className="flex items-center justify-between gap-2">
                        {mobileLinks.map((link) => {
                            const active = pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    style={{
                                        flex: 1,
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4,
                                        borderRadius: 16,
                                        padding: '10px 8px',
                                        background: active ? 'var(--primary-soft)' : 'transparent',
                                        color: active ? 'var(--primary-text)' : 'var(--text-subtle)',
                                        fontSize: 11,
                                        fontWeight: 700
                                    }}
                                >
                                    <Icon name={link.icon} active={active} />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <Link
                            href={`/profile/${user._id}`}
                            style={{
                                flex: 1,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                                borderRadius: 16,
                                padding: '10px 8px',
                                background: pathname.startsWith('/profile') ? 'var(--primary-soft)' : 'transparent',
                                color: pathname.startsWith('/profile') ? 'var(--primary-text)' : 'var(--text-subtle)',
                                fontSize: 11,
                                fontWeight: 700
                            }}
                        >
                            <Icon name="user" active={pathname.startsWith('/profile')} />
                            Profile
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
