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
        const session = await auth()
        const a2fCookie = cookieStore.get('_A2F');
        console.log('cookie', request.cookies.getAll())

        if (!session) {
            return NextResponse.json(
                {
                    status: 99,
                    message: 'Unauthenticated',
                    datetime: formatDateCalendar(new Date()),
                },
                { status: 401 }
            );
        }
        if (!a2fCookie) {
            return NextResponse.json(
                {
                    status: 99,
                    message: 'Unauthenticated',
                    datetime: formatDateCalendar(new Date()),
                },
                { status: 401 }
            );
        }

        const dNow = new Date();
        const tokenResponse = await axios.get(`${process.env.API_URL}/auth/token`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': formatDateCalendar(dNow),
            },
        });

        const token = tokenResponse.data;

        if (!token?.access_token) {
            return NextResponse.json(
                {
                    status: '99',
                    message: 'Token not found',
                    datetime: formatDateCalendar(new Date()),
                },
                { status: 400 }
            );
        }

        // Process POST request
        return await postCRUD(request, token, a2fCookie.value);

    } catch (error: any) {
        console.error("Bridge error:", error);

        const errorMessage = error.response?.data?.message || error.message || 'Internal server error';
        const isConnectionRefused = /ECONNREFUSED/.test(errorMessage);
        const isIPExposed = /(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?/.test(errorMessage);

        if (isConnectionRefused && isIPExposed) {
            return NextResponse.json(
                {
                    status: '99',
                    message: 'Koneksi ke server gagal. Silakan coba beberapa saat lagi.',
                    datetime: formatDateCalendar(new Date()),
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                status: '99',
                message: error?.response?.data?.message || error?.message || 'Internal server error',
                datetime: formatDateCalendar(new Date()),
                data: error.response?.data || null,
            },
            { status: 400 }
        );
    }
}


async function postCRUD(request: NextRequest, token: any, a2fCookie: string) {
    try {
        const headers: CustomHeaders = {};
        const formData = await request.formData();

        request.headers.forEach((value, key) => {
            if (key.toLowerCase().startsWith('x-')) {
                headers[key.toLowerCase() as keyof CustomHeaders] = value;
            }
        });

        const endpoint = headers['x-endpoint'];
        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint not specified' },
                { status: 400 }
            );
        }

        // Parse custom headers
        let customHeader: Record<string, any> = {};
        if (headers['x-custom-header']) {
            try {
                customHeader = JSON.parse(headers['x-custom-header']);
            } catch (e) {
                console.error('Failed to parse x-custom-header:', e);
            }
        }

        const date = formatDateCalendar(new Date(), 'yyyy-MM-dd');
        let requestHeaders: Record<string, string> = {
            'X-Timestamp': formatDateCalendar(new Date()) as string,
            'Authorization': `Bearer ${token.access_token}`,
            ...customHeader,
        };


        // Selalu pasang x-uniqueid dari token
        try {
            const secret = new TextEncoder().encode(process.env.USER_KEY);
            const { payload } = await jwtVerify<any>(a2fCookie, secret);
            const uid = payload.IdPengguna ?? payload.id_pengguna ?? payload.uid ?? payload.uniqueId ?? payload.id;
            if (uid) requestHeaders['X-UniqueId'] = String(uid);
        } catch { /* ignore jika cookie tidak ada */ }

        // Handle X-Credential
        if (customHeader['X-Credential']) {

        }


        delete requestHeaders['X-Level'];
        delete requestHeaders['x-endpoint'];
        delete requestHeaders['Content-Type'];
        delete requestHeaders['content-type'];

        const newFormData = new FormData();

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const blob = new Blob([await value.arrayBuffer()], { type: value.type });
                newFormData.append(key, blob, value.name);
            } else {
                newFormData.append(key, value);
            }
        }

        const result = await axios.post(
            `${process.env.API_URL}${endpoint}`,
            newFormData,
            { headers: requestHeaders }
        );

        return NextResponse.json(result.data);

    } catch (err: any) {
        console.error("POST CRUD error:", err);

        if (err?.response?.status === 401) {
            // Clear cookies on unauthorized
            const cookieStore = cookies();
            cookieStore.delete('_A2R');
            cookieStore.delete('_A2F');

            return NextResponse.json(
                err?.response?.data || { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            err?.response?.data || { error: 'Internal server error' },
            { status: err?.response?.status || 500 }
        );
    }
}