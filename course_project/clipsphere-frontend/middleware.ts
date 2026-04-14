import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/upload', '/settings', '/admin'];

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtected = protectedRoutes.some(r => path.startsWith(r));

    if (isProtected) {
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/upload/:path*', '/settings/:path*', '/admin/:path*']
};
