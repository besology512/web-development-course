const BASE = '/api/v1';
const COOKIE_MAX_AGE = 60 * 60 * 24;

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

function setCookie(name: string, value: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setToken(token: string) {
    localStorage.setItem('token', token);
    setCookie('token', token);
}

export function setStoredUser(user: { role?: string } | null) {
    if (typeof window === 'undefined') return;

    if (!user) {
        localStorage.removeItem('user');
        clearCookie('user_role');
        return;
    }

    localStorage.setItem('user', JSON.stringify(user));
    if (user.role) {
        setCookie('user_role', user.role);
    } else {
        clearCookie('user_role');
    }
}

export function clearToken() {
    localStorage.removeItem('token');
    setStoredUser(null);
    clearCookie('token');
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
