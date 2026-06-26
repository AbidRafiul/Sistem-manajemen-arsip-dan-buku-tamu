import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const publicPaths = ['/auth/login', '/auth/register', '/visitor'];
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (isPublicPath) {
        return NextResponse.next();
    }

    try {
        const a2rCookie = req.cookies.get('_A2R')?.value || '';

        if (!a2rCookie) {
            throw new Error('No A2R cookie - not authenticated');
        }

        const secret = new TextEncoder().encode(process.env.USER_KEY);
        const { payload: userDecrypted } = await jwtVerify(a2rCookie, secret);

        // Terima IdPengguna dalam berbagai bentuk (uid dari route.ts login, IdPengguna dari authTools signIn)
        const activeId = userDecrypted.IdPengguna ?? userDecrypted.id_pengguna ?? userDecrypted.uid ?? userDecrypted.sub;

        if (!activeId) {
            throw new Error('Invalid token: IdPengguna tidak ditemukan');
        }

        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        return response;
    } catch (error) {
        console.error('MIDDLEWARE - Auth failed:', (error as Error).message);
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets|images).*)']
};
