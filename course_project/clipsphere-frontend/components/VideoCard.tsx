'use client';
import Link from 'next/link';
import { useRef } from 'react';

interface VideoCardProps {
    video: {
        _id: string;
        title: string;
        description?: string;
        duration: number;
        viewsCount: number;
        likesCount: number;
        tippedAmount: number;
        avgRating?: number;
        reviewCount?: number;
        playbackUrl: string;
        owner?: { _id: string; username: string };
    };
}

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video }: VideoCardProps) {
    const previewRef = useRef<HTMLVideoElement>(null);
    const ownerName = video.owner?.username || 'Unknown';
    const rating = video.avgRating ? `${video.avgRating.toFixed(1)}★` : 'New';

    const startPreview = () => {
        previewRef.current?.play().catch(() => {});
    };

    const stopPreview = () => {
        if (!previewRef.current) return;
        previewRef.current.pause();
        previewRef.current.currentTime = 0;
    };

    return (
        <Link href={`/videos/${video._id}`} style={{ textDecoration: 'none' }}>
            <article
                style={{
                    background: '#ffffff',
                    border: '1px solid rgba(201, 214, 228, 0.86)',
                    borderRadius: 24,
                    overflow: 'hidden',
                    boxShadow: '0 18px 40px rgba(22, 34, 58, 0.08)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: 410
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 24px 48px rgba(22, 34, 58, 0.12)';
                    e.currentTarget.style.borderColor = '#9fc9da';
                    startPreview();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 18px 40px rgba(22, 34, 58, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(201, 214, 228, 0.86)';
                    stopPreview();
                }}
            >
                <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0f172a', margin: 12, marginBottom: 0, borderRadius: 18, overflow: 'hidden' }}>
                    <video
                        ref={previewRef}
                        src={video.playbackUrl}
                        muted
                        playsInline
                        preload="metadata"
                        loop
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.62), rgba(15, 23, 42, 0.08))'
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: 'rgba(255, 255, 255, 0.18)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 999,
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        {rating}
                    </span>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <span
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'rgba(17, 24, 39, 0.46)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                                <path d="M8 6.5v11l9-5.5-9-5.5Z" />
                            </svg>
                        </span>
                    </div>
                    <span
                        style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            background: 'rgba(15, 23, 42, 0.82)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 999
                        }}
                    >
                        {formatDuration(video.duration)}
                    </span>
                </div>

                <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <h3 style={{ color: '#16223a', fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                            {video.title}
                        </h3>
                        <p style={{ color: '#46a6be', fontSize: 13, margin: '6px 0 0 0', fontWeight: 600 }}>
                            @{ownerName}
                        </p>
                    </div>

                    {video.description && (
                        <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                            {video.description.length > 120 ? `${video.description.slice(0, 117)}...` : video.description}
                        </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span
                            style={{
                                background: '#f4f9fc',
                                color: '#16223a',
                                borderRadius: 999,
                                padding: '7px 12px',
                                fontSize: 12,
                                fontWeight: 700
                            }}
                        >
                            {video.reviewCount || 0} reviews
                        </span>
                        <span style={{ color: '#7c8ba0', fontSize: 13, fontWeight: 600 }}>
                            {video.viewsCount} views
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, paddingTop: 2 }}>
                        <div style={{ background: '#f8fbfe', borderRadius: 16, padding: '10px 12px' }}>
                            <div style={{ color: '#91a0b5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Likes
                            </div>
                            <div style={{ color: '#16223a', fontSize: 15, fontWeight: 800, marginTop: 4 }}>
                                {video.likesCount}
                            </div>
                        </div>
                        <div style={{ background: '#f8fbfe', borderRadius: 16, padding: '10px 12px' }}>
                            <div style={{ color: '#91a0b5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Rating
                            </div>
                            <div style={{ color: '#16223a', fontSize: 15, fontWeight: 800, marginTop: 4 }}>
                                {rating}
                            </div>
                        </div>
                        <div style={{ background: '#f8fbfe', borderRadius: 16, padding: '10px 12px' }}>
                            <div style={{ color: '#91a0b5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Tips
                            </div>
                            <div style={{ color: '#16223a', fontSize: 15, fontWeight: 800, marginTop: 4 }}>
                                ${Number(video.tippedAmount || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
