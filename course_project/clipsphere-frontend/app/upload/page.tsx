'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { getToken } from '@/services/api';

export default function UploadPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setError('');
        setProgress('Uploading...');
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', title);
            if (description) formData.append('description', description);
            const res = await fetch('/api/v1/videos/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');
            setProgress('Upload complete!');
            setTimeout(() => router.push('/feed'), 800);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setProgress('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: '#f7f8fa' }}>
            <NavBar />
            <div className="max-w-xl mx-auto px-4 py-10">
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
                    Upload Video
                </h1>

                <form onSubmit={handleSubmit}
                      style={{
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 16,
                          padding: 28,
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                      }}>
                    <div style={{ marginBottom: 18 }}>
                        <label style={labelStyle}>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                               placeholder="Give your video a title"
                               required
                               style={inputStyle}
                               onFocus={e => focusStyle(e, true)}
                               onBlur={e => focusStyle(e, false)} />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label style={labelStyle}>Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                                  placeholder="Describe your video"
                                  style={{ ...inputStyle, height: 88, resize: 'none' }}
                                  onFocus={e => focusStyle(e, true)}
                                  onBlur={e => focusStyle(e, false)} />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label style={labelStyle}>Video File</label>
                        <label htmlFor="video-input"
                               style={{
                                   display: 'block',
                                   border: '2px dashed #cbd5e1',
                                   background: '#f8fafc',
                                   borderRadius: 12,
                                   padding: 24,
                                   textAlign: 'center',
                                   cursor: 'pointer',
                                   transition: 'border-color 0.15s, background 0.15s'
                               }}
                               onMouseOver={e => {
                                   e.currentTarget.style.borderColor = '#6366f1';
                                   e.currentTarget.style.background = '#eef2ff';
                               }}
                               onMouseOut={e => {
                                   e.currentTarget.style.borderColor = '#cbd5e1';
                                   e.currentTarget.style.background = '#f8fafc';
                               }}>
                            <input type="file" accept="video/mp4"
                                   onChange={e => setFile(e.target.files?.[0] || null)}
                                   style={{ display: 'none' }} id="video-input" />
                            {file ? (
                                <div>
                                    <p style={{ color: '#0f172a', fontSize: 15, fontWeight: 500, margin: 0 }}>{file.name}</p>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0 0' }}>
                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                         stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                         style={{ display: 'block', margin: '0 auto 10px' }}>
                                        <path d="M15 10l4.553-2.277A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                    </svg>
                                    <p style={{ color: '#334155', fontSize: 14, margin: 0, fontWeight: 500 }}>
                                        Click to select an MP4 file
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0 0' }}>
                                        Max 5 minutes · Max 100 MB
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                padding: '10px 14px',
                                borderRadius: 8,
                                fontSize: 14,
                                marginBottom: 12
                             }}>
                            {error}
                        </div>
                    )}

                    {progress && (
                        <div style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#047857',
                                padding: '10px 14px',
                                borderRadius: 8,
                                fontSize: 14,
                                textAlign: 'center',
                                marginBottom: 12
                             }}>
                            {progress}
                        </div>
                    )}

                    <button type="submit" disabled={uploading || !file || !title}
                            style={{
                                width: '100%',
                                background: uploading || !file || !title ? '#a5b4fc' : '#4f46e5',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: 10,
                                fontSize: 15,
                                fontWeight: 600,
                                opacity: uploading || !file || !title ? 0.7 : 1
                            }}
                            onMouseOver={e => { if (!(uploading || !file || !title)) e.currentTarget.style.background = '#4338ca'; }}
                            onMouseOut={e => { if (!(uploading || !file || !title)) e.currentTarget.style.background = '#4f46e5'; }}>
                        {uploading ? 'Processing...' : 'Upload Video'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#334155',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    color: '#0f172a',
    transition: 'border-color 0.15s, background 0.15s'
};

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, focused: boolean) {
    e.currentTarget.style.borderColor = focused ? '#6366f1' : '#e5e7eb';
    e.currentTarget.style.background = focused ? '#ffffff' : '#f8fafc';
}
