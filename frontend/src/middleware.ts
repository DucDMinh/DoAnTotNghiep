import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostHeader = request.headers.get('host') || '';
    const hostname = hostHeader.split(':')[0];

    const token = request.cookies.get('accessToken')?.value;
    if (hostname === 'admin.localhost') {
        if (url.pathname.startsWith('/auth/signin')) {
            const targetPath = `/admin${url.pathname}`;
            return NextResponse.rewrite(new URL(targetPath, request.url));
        }
        if (!token) {
            const loginUrl = new URL('/auth/signin', request.url);
            return NextResponse.redirect(loginUrl);
        }
        const targetPath = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
        return NextResponse.rewrite(new URL(targetPath, request.url));
    }
    if (url.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    const protectedUserRoutes = ['/profile', '/my-itineraries', '/settings'];

    const isAccessingProtectedRoute = protectedUserRoutes.some(route =>
        url.pathname.startsWith(route)
    );

    if (isAccessingProtectedRoute && !token) {
        const userLoginUrl = new URL('/signin', request.url);
        userLoginUrl.searchParams.set('callbackUrl', url.pathname);
        return NextResponse.redirect(userLoginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};