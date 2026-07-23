import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostHeader = request.headers.get('host') || '';
    const hostname = hostHeader.split(':')[0];

    if (hostname === 'admin.localhost') {
        const targetPath =
            url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;

        return NextResponse.rewrite(new URL(targetPath, request.url));
    }

    if (url.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};