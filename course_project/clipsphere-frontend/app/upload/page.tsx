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
            setTimeout(() => router.push('/feed'), 1000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setProgress('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <NavBar />
            <div className="max-w-xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
                <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your video a title"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your video"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm h-20 resize-none focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Video File</label>
                        <label htmlFor="video-input"
                            className="block border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors">
                            <input type="file" accept="video/mp4" onChange={e => setFile(e.target.files?.[0] || null)}
                                className="hidden" id="video-input" />
                            {file ? (
                                <div>
                                    <p className="text-white font-medium">{file.name}</p>
                                    <p className="text-gray-400 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-4xl mb-2">🎬</p>
                                    <p className="text-gray-400 text-sm">Click to select MP4 video</p>
                                    <p className="text-gray-600 text-xs mt-1">Max 5 minutes · Max 100 MB</p>
                                </div>
                            )}
                        </label>
                    </div>
                    {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
                    {progress && <p className="text-green-400 text-sm text-center">{progress}</p>}
                    <button type="submit" disabled={uploading || !file || !title}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition-colors">
                        {uploading ? 'Processing...' : 'Upload Video'}
                    </button>
                </form>
            </div>
        </div>
    );
}
