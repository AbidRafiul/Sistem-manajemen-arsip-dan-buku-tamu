import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const publicPaths = ['/auth/login', '/auth/register'];
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (isPublicPath) {
        return NextResponse.next();
    }

    try {
        const a2fCookie = req.cookies.get('_A2F')?.value || '';
        const a2rCookie = req.cookies.get('_A2R')?.value || '';

        if (!a2fCookie) {
            throw new Error('No A2F cookie');
        }
        if (!a2rCookie) {
            throw new Error('No A2R cookie');
        }

        // PASTIKAN process.env.USER_KEY DI NEXT.JS SAMA PERSIS DENGAN DI EXPRESS
        const secret = new TextEncoder().encode(process.env.USER_KEY);

        const { payload: userDecrypted } = await jwtVerify(a2rCookie, secret);

        //  CCTV PASANG DI SINI
        console.log('CCTV MIDDLEWARE - PAYLOAD DARI EXPRESS:', userDecrypted);

        //  UBAHAN DI SINI: TERIMA IdPengguna (Besar) ATAU IdPengguna (Kecil)
        const activeId = userDecrypted.IdPengguna || userDecrypted.IdPengguna;

        if (!activeId) {
            throw new Error('Invalid user: IdPengguna tidak ditemukan');
        }

        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        const response = NextResponse.next();
        response.headers.set('x-pathname', pathname);
        return response;
    } catch (error) {
        // CCTV ERROR PASANG DI SINI
        console.error('CCTV MIDDLEWARE - ERROR DITENDANG:', error);
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets|images).*)']
};
