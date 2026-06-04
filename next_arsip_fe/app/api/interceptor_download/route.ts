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

        // Get token from your API
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

        const date = formatDateCalendar(new Date(), 'yyyy-MM-dd');
        let requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Timestamp': formatDateCalendar(new Date()) as string,
            'Authorization': `Bearer ${token.access_token}`,
            ...customHeader,
        };


        // Handle X-Level = 1
        if (customHeader['X-Level'] && customHeader['X-Level'] == '1') {
            const secret = new TextEncoder().encode(process.env.USER_KEY);
            const { payload } = await jwtVerify<A2FPayload>(a2fCookie, secret);
            const userPayload = payload;

            requestHeaders['X-UniqueId'] = userPayload.uniqueId ?? '';
        }

        // Handle X-Credential
        if (customHeader['X-Credential']) {
           
        }


        const result = await axios.post(process.env.API_URL + endpoint, body, {
            headers: requestHeaders,
            responseType: "arraybuffer",
            validateStatus: () => true,
        }
        );

        const contentType = result.headers["content-type"] || "";

        if (contentType.includes("application/json")) {
            const text = Buffer.from(result.data).toString("utf-8");
            return NextResponse.json(JSON.parse(text), {
                status: result.status,
            });
        }

        return new NextResponse(Buffer.from(result.data), {
            status: 200,
            headers: {
                "Content-Type": contentType || "application/octet-stream",
                "Content-Disposition":
                    result.headers["content-disposition"] ??
                    'attachment; filename="WO.pdf"',
            },
        });

    } catch (err: any) {
        // console.error("POST CRUD error:", err);

        const resp = err?.response
        if (resp) {
            let payload = resp.data;
            if (Buffer.isBuffer(payload) || payload instanceof ArrayBuffer) {
                try {
                    const buf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
                    const text = buf.toString('utf8');
                    payload = (() => {
                        try { return JSON.parse(text); } catch (e) { return text; }
                    })();
                } catch (e) {
                    payload = String(payload);
                }
            }
        }

        if (err?.response?.status === 401) {
            // Clear cookies on unauthorized
            const cookieStore = cookies();
            cookieStore.delete('_A2R');
            cookieStore.delete('_A2F');

            return NextResponse.json(
                err?.response?.data,
                { status: 401 }
            );
        }

        return NextResponse.json(
            err?.response?.data || err,
            { status: resp?.status || 500 }
        );
    }
}