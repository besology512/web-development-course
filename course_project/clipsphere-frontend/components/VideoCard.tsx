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
        likesCount?: number;
        reviewCount?: number;
        playbackUrl: string;
        avgRating?: number;
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
                    background: '#111827',
                    border: '1px solid rgba(55, 65, 81, 0.95)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 18px 36px rgba(2, 6, 23, 0.28)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 24px 42px rgba(15, 23, 42, 0.34)';
                    e.currentTarget.style.borderColor = '#6366f1';
                    startPreview();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 18px 36px rgba(2, 6, 23, 0.28)';
                    e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 0.95)';
                    stopPreview();
                }}
            >
                <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#020617' }}>
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
                            background: 'linear-gradient(to top, rgba(2, 6, 23, 0.72), rgba(2, 6, 23, 0.08))'
                        }}
                    />
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
                                background: 'rgba(15, 23, 42, 0.52)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
                                <path d="M8 6.5v11l9-5.5-9-5.5Z" />
                            </svg>
                        </span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md">
                        {formatDuration(video.duration)}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 text-xs text-amber-300 px-2 py-1 rounded-full">
                        {rating}
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <div>
                        <p className="font-semibold text-base leading-6 line-clamp-2">{video.title}</p>
                        <p className="text-gray-400 text-sm mt-1">@{ownerName}</p>
                    </div>
                    {video.description && (
                        <p className="text-gray-300 text-sm leading-6 line-clamp-2">
                            {video.description}
                        </p>
                    )}
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
                        <span>{video.viewsCount} views</span>
                        <span>{video.reviewCount || 0} reviews</span>
                        <span>{video.likesCount || 0} likes</span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
