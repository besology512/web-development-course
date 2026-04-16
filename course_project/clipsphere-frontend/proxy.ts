import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authProtectedRoutes = ['/upload', '/settings'];

function renderNotFound() {
    return new NextResponse('Not Found', {
        status: 404,
        headers: {
            'content-type': 'text/plain; charset=utf-8'
        }
    });
}

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    if (path.startsWith('/admin')) {
        const role = request.cookies.get('user_role')?.value;
        if (!token || role !== 'admin') {
            return renderNotFound();
        }
        return NextResponse.next();
    }

    const isProtected = authProtectedRoutes.some((route) => path.startsWith(route));
    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/upload/:path*', '/settings/:path*', '/admin/:path*']
};
