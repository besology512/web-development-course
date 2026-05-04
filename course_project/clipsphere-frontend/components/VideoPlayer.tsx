'use client';

export default function VideoPlayer({ url }: { url: string }) {
    return (
        <div style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: '#000',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
             }}>
            <video src={url} controls controlsList="nodownload"
                   style={{ width: '100%', height: '100%', display: 'block' }}>
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
