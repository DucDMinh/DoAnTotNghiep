/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
async function verifyAuthToken(token: string | undefined): Promise<{ valid: boolean; decoded?: any; reason?: string }> {
    if (!token) {
        return { valid: false, reason: 'MISSING_TOKEN' };
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
        const { payload } = await jwtVerify(token, secret);

        return { valid: true, decoded: payload };
    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            console.log("Token đã hết hạn!");
            return { valid: false, reason: 'EXPIRED' };
        }
        console.log("Token không hợp lệ hoặc sai chữ ký:", error.message);
        return { valid: false, reason: 'INVALID' };
    }
}

export async function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const hostHeader = request.headers.get('host') || '';
    const hostname = hostHeader.split(':')[0];

    const token = request.cookies.get('accessToken')?.value;
    const { valid: isTokenAlive, decoded } = await verifyAuthToken(token);
    if (hostname === 'admin.localhost') {
        if (url.pathname.startsWith('/auth/signin')) {
            const targetPath = `/admin${url.pathname}`;
            return NextResponse.rewrite(new URL(targetPath, request.url));
        }
        if (!isTokenAlive) {
            const loginUrl = new URL('/auth/signin', request.url);
            loginUrl.searchParams.set('error_message', 'TOKEN_EXPIRED');
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('accessToken');
            return response;
        }
        if (decoded?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('http://localhost:3000/'));
        }

        const targetPath = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
        return NextResponse.rewrite(new URL(targetPath, request.url));
    }

    if (url.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    const protectedUserRoutes = ['/MyItinerary', '/my-itineraries', '/settings'];
    const isAccessingProtectedRoute = protectedUserRoutes.some(route =>
        url.pathname.startsWith(route)
    );
    if (isAccessingProtectedRoute && !isTokenAlive) {
        const userLoginUrl = new URL('/auth/signin', request.url);
        userLoginUrl.searchParams.set('error_message', 'redirect-from-protected-route');
        const response = NextResponse.redirect(userLoginUrl);
        response.cookies.delete('accessToken');
        return response;
    }

    if (!url.pathname.startsWith('/user')) {
        const targetPath = url.pathname === '/' ? '/user' : `/user${url.pathname}`;
        return NextResponse.rewrite(new URL(targetPath, request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};