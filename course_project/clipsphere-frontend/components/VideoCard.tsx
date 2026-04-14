'use client';
import Link from 'next/link';

interface VideoCardProps {
    video: {
        _id: string;
        title: string;
        duration: number;
        viewsCount: number;
        avgRating?: number;
        ownerData?: { _id: string; username: string };
        owner?: { _id: string; username: string };
    };
}

function formatDuration(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video }: VideoCardProps) {
    const ownerName = video.ownerData?.username || video.owner?.username || 'Unknown';

    return (
        <Link href={`/videos/${video._id}`}>
            <div className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group">
                <div className="relative w-full aspect-video bg-gray-800 flex items-center justify-center">
                    <div className="text-gray-600 text-5xl group-hover:text-gray-500 transition-colors">▶</div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md">
                        {formatDuration(video.duration)}
                    </div>
                    <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
                <div className="p-3">
                    <p className="font-semibold text-sm truncate">{video.title}</p>
                    <p className="text-gray-400 text-xs mt-1">@{ownerName} · {video.viewsCount} views</p>
                    {video.avgRating !== undefined && video.avgRating !== null && (
                        <p className="text-yellow-400 text-xs mt-0.5">★ {Number(video.avgRating).toFixed(1)}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}
