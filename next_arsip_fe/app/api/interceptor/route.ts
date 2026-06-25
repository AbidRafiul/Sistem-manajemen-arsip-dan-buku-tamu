import { NextRequest, NextResponse } from 'next/server';
import { encryptChunkRSA } from '@/lib/tools/serverTools';
import axios from 'axios';
import { formatDateCalendar } from '@/lib/tools/dateTools';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { auth } from '@/lib/tools/authTools';
import { A2FPayload } from '@/types/next-auth';

interface CustomHeaders {
    'x-endpoint'?: string;
    'x-custom-header'?: string;
    'x-level'?: string;
    'x-credential'?: string;
}

export const POST = async (request: NextRequest) => {
    try {
        // Check cookies
        const cookieStore = request.cookies;
        const session = await auth();
        const a2fCookie = cookieStore.get('_A2F');
        console.log('cookie', request.cookies.getAll());

        if (!session) {
            return NextResponse.json(
                {
                    status: 99,
                    message: 'Unauthenticated',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 401 }
            );
        }
        if (!a2fCookie) {
            return NextResponse.json(
                {
                    status: 99,
                    message: 'Unauthenticated',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 401 }
            );
        }

        // Get token from your API
        const dNow = new Date();
        const tokenResponse = await axios.get(`${process.env.API_URL}/auth/token`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': formatDateCalendar(dNow)
            }
        });

        const token = tokenResponse.data;

        if (!token?.access_token) {
            return NextResponse.json(
                {
                    status: '99',
                    message: 'Token not found',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 400 }
            );
        }

        // Process POST request
        return await postCRUD(request, token, a2fCookie.value);
    } catch (error: any) {
        console.error('Bridge error:', error);

        const errorMessage = error.response?.data?.message || error.message || 'Internal server error';
        const isConnectionRefused = /ECONNREFUSED/.test(errorMessage);
        const isIPExposed = /(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?/.test(errorMessage);

        if (isConnectionRefused && isIPExposed) {
            return NextResponse.json(
                {
                    status: '99',
                    message: 'Koneksi ke server gagal. Silakan coba beberapa saat lagi.',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                status: '99',
                message: error?.response?.data?.message || error?.message || 'Internal server error',
                datetime: formatDateCalendar(new Date()),
                data: error.response?.data || null
            },
            { status: 400 }
        );
    }
};

export const GET = async (request: NextRequest) => {
    try {
        const cookieStore = request.cookies;
        const session = await auth();
        const a2fCookie = cookieStore.get('_A2F');

        if (!session) {
            return NextResponse.json(
                {
                    status: 99,
                    message: 'Unauthenticated',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 401 }
            );
        }
        if (!a2fCookie) {
            return NextResponse.json(
                {
                    status: 99,
                    message: 'Unauthenticated',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 401 }
            );
        }

        const dNow = new Date();
        const tokenResponse = await axios.get(`${process.env.API_URL}/auth/token`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': formatDateCalendar(dNow)
            }
        });

        const token = tokenResponse.data;

        if (!token?.access_token) {
            return NextResponse.json(
                {
                    status: '99',
                    message: 'Token not found',
                    datetime: formatDateCalendar(new Date())
                },
                { status: 400 }
            );
        }

        return await getCRUD(request, token, a2fCookie.value);
    } catch (error: any) {
        console.error('Bridge error:', error);

        return NextResponse.json(
            {
                status: '99',
                message: error?.response?.data?.message || error?.message || 'Internal server error',
                datetime: formatDateCalendar(new Date()),
                data: error.response?.data || null
            },
            { status: 400 }
        );
    }
};

async function postCRUD(request: NextRequest, token: any, a2fCookie: string) {
    try {
        const headers: CustomHeaders = {};

        request.headers.forEach((value, key) => {
            if (key.toLowerCase().startsWith('x-')) {
                headers[key.toLowerCase() as keyof CustomHeaders] = value;
            }
        });

        const endpoint = headers['x-endpoint'];
        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint not specified' }, { status: 400 });
        }

        const body = await request.json();

        // Parse custom headers
        let customHeader: Record<string, any> = {};
        if (headers['x-custom-header']) {
            try {
                customHeader = JSON.parse(headers['x-custom-header']);
            } catch (e) {
                console.error('Failed to parse x-custom-header:', e);
            }
        }

        let requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Timestamp': formatDateCalendar(new Date()) as string,
            Authorization: `Bearer ${token.access_token}`,
            ...customHeader
        };

        // 🔥 FIX MUTLAK: Selalu bongkar KTP (Token) dan pasang ke Header
        try {
            const secret = new TextEncoder().encode(process.env.USER_KEY);
            const { payload } = await jwtVerify<any>(a2fCookie, secret);
            // Pakai huruf kecil 'x-uniqueid' biar aman dari satpam Express
            requestHeaders['x-uniqueid'] = String(payload.userId || payload.UserId || payload.id || '');
        } catch (e) {
            console.error("Gagal membaca cookie A2F:", e);
        }

        // Handle X-Level = 1 (biarkan kosong jika tidak ada logika khusus lainnya)
        if (customHeader['X-Level'] && customHeader['X-Level'] == '1') {
        }

        if (customHeader['X-Credential']) {
        }

        // Remove our custom headers before sending to backend
        delete requestHeaders['X-Level'];

        // --- TAMBAHKAN KODE INI UNTUK DEBUGGING ---
        const targetUrl = `${process.env.API_URL}/${endpoint.replace(/^\/+/, '')}`;
        console.log(" [DEBUG INTERCEPTOR] Menembak ke Backend:", targetUrl);
        console.log(" [DEBUG INTERCEPTOR] Isi Body:", body);
        // ------------------------------------------

        const result = await axios.post(
            targetUrl,
            body,
            { headers: requestHeaders }
        );

        return NextResponse.json(result.data);
    } catch (err: any) {
        if (err?.response?.status === 401) {
            const cookieStore = cookies();
            cookieStore.delete('_A2R');
            cookieStore.delete('_A2F');
            return NextResponse.json(err?.response?.data || { error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(err?.response?.data || { error: 'Internal server error' }, { status: err?.response?.status || 500 });
    }
}

async function getCRUD(request: NextRequest, token: any, a2fCookie: string) {
    try {
        const headers: CustomHeaders = {};

        request.headers.forEach((value, key) => {
            if (key.toLowerCase().startsWith('x-')) {
                headers[key.toLowerCase() as keyof CustomHeaders] = value;
            }
        });

        const endpoint = headers['x-endpoint'];
        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint not specified' }, { status: 400 });
        }

        let customHeader: Record<string, any> = {};
        if (headers['x-custom-header']) {
            try {
                customHeader = JSON.parse(headers['x-custom-header']);
            } catch (e) {
                console.error('Failed to parse x-custom-header:', e);
            }
        }

        let requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Timestamp': formatDateCalendar(new Date()) as string,
            Authorization: `Bearer ${token.access_token}`,
            ...customHeader
        };

        // 🔥 FIX MUTLAK: Selalu bongkar KTP (Token) dan pasang ke Header
        try {
            const secret = new TextEncoder().encode(process.env.USER_KEY);
            const { payload } = await jwtVerify<any>(a2fCookie, secret);
            requestHeaders['x-uniqueid'] = String(payload.userId || payload.UserId || payload.id || '');
        } catch (e) {
            console.error("Gagal membaca cookie A2F:", e);
        }

        if (customHeader['X-Level'] && customHeader['X-Level'] == '1') {
        }

        delete requestHeaders['X-Level'];
        const result = await axios.get(`${process.env.API_URL}${endpoint}`, { headers: requestHeaders });

        return NextResponse.json(result.data);
    } catch (err: any) {
        if (err?.response?.status === 401) {
            const cookieStore = cookies();
            cookieStore.delete('_A2R');
            cookieStore.delete('_A2F');
            return NextResponse.json(err?.response?.data || { error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(err?.response?.data || { error: 'Internal server error' }, { status: err?.response?.status || 500 });
    }
}