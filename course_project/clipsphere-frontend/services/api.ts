const BASE = '/api/v1';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function setToken(token: string) {
    localStorage.setItem('token', token);
    // Middleware checks cookie server-side — keep localStorage + cookie in sync.
    if (typeof document !== 'undefined') {
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
    }
}

export function clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof document !== 'undefined') {
        document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    }
}

async function request(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {})
    };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { ...options, headers, cache: 'no-store' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || 'Request failed');
    }
    if (res.status === 204) return null;
    return res.json();
}

export const api = {
    get: (path: string) => request(path),
    post: (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: (path: string, body: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path: string) => request(path, { method: 'DELETE' })
};
