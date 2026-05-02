'use client';

export default function VideoPlayer({ url }: { url: string }) {
    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <video
                src={url}
                controls
                className="w-full h-full"
                controlsList="nodownload"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
