import { formatDateCalendar } from '@/lib/tools/dateTools';
import axios from 'axios';
import { jwtVerify, SignJWT } from 'jose';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Credentials {
    nama_pengguna: string;
    kata_sandi: string;
    remember_me?: string;
}

interface TokenData {
    access_token?: string;
    token_type?: string;
}

interface AuthResponse {
    status?: string;
    message?: string;
    datetime?: string;
}

export const POST = async (req: NextRequest) => {
    try {
        const credentials = await req.json();

        const dNow = new Date();
        const tokenResponse = await axios.get<TokenData>(`${process.env.API_URL}/auth/token`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': formatDateCalendar(dNow)
            }
        });

        const data = tokenResponse.data;

        if (!data?.access_token) {
            throw new Error('Token tidak ditemukan');
        }

        const credential: Credentials | any = {
            nama_pengguna: credentials?.nama_pengguna as string,
            kata_sandi: credentials?.kata_sandi as string
        };

        const headers = {
            Authorization: `${data.token_type} ${data.access_token}`,
            'Content-Type': 'application/json',
            'X-Timestamp': formatDateCalendar(new Date())
        };

        const result = await axios.post<AuthResponse & User>(`${process.env.API_URL}/auth/login`, { ...credential }, { headers });

        const dataResponse = result.data;

        const maxAge = credentials?.remember_me === '1' ? 60 * 60 * 24 : 60 * 60 * 7;
        const secret = new TextEncoder().encode(process.env.USER_KEY!);

        // Jika backend mengirim credential (JWT dari Express)
        if (dataResponse?.credential) {
            const { payload: userDecrypted } = (await jwtVerify(dataResponse.credential, secret)) as { payload: any };

            const userData = {
                id: userDecrypted?.IdPengguna || userDecrypted?.id_pengguna || userDecrypted?.uniqueId || userDecrypted?.uid || userDecrypted?.nama_pengguna,
                role: userDecrypted?.role || userDecrypted?.roleCode,
                roleCode: userDecrypted?.roleCode,
                roleId: userDecrypted?.roleId,
                name: userDecrypted?.nama_lengkap || userDecrypted?.name,
                nama_pengguna: userDecrypted?.nama_pengguna,
                IdPengguna: userDecrypted?.IdPengguna || userDecrypted?.id_pengguna || userDecrypted?.uniqueId || userDecrypted?.uid,
                id_pengguna: userDecrypted?.IdPengguna || userDecrypted?.id_pengguna || userDecrypted?.uniqueId || userDecrypted?.uid,
                uniqueId: userDecrypted?.IdPengguna || userDecrypted?.id_pengguna || userDecrypted?.uniqueId || userDecrypted?.uid,
                remember_me: credentials?.remember_me === '1',
                credential: dataResponse.credential
            };
            const activeId = userData.IdPengguna || userData.id;

            const jwtPayload = {
                uid: activeId,
                IdPengguna: activeId,
                id_pengguna: activeId,
                uniqueId: activeId,
                name: userData.name,
                nama_pengguna: userData.nama_pengguna
            };
            const token = await new SignJWT(jwtPayload)
                .setProtectedHeader({ alg: 'HS512' })
                .setExpirationTime(credentials?.remember_me === '1' ? '1d' : '7h')
                .sign(secret);

            const response = NextResponse.json(
                { status: '00', message: 'Login Berhasil', datetime: formatDateCalendar(new Date()), data: userData },
                { status: 200 }
            );

            response.cookies.set('_A2F', dataResponse.credential, { httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge });
            response.cookies.set('_A2R', token, { httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge });
            return response;
        }

        // Fallback: backend tidak mengirim credential, tapi tetap buat _A2R dari data login
        const fallbackData = dataResponse as any;
        const fallbackId = fallbackData?.IdPengguna || fallbackData?.id_pengguna || fallbackData?.id || fallbackData?.nama_pengguna;

        if (fallbackId) {
            const userData = {
                id: fallbackId,
                IdPengguna: fallbackId,
                name: fallbackData?.nama_lengkap || fallbackData?.name || '',
                nama_pengguna: fallbackData?.nama_pengguna || credentials?.nama_pengguna || '',
                remember_me: credentials?.remember_me === '1'
            };

            const jwtPayload = {
                uid: fallbackId,
                IdPengguna: fallbackId,
                id_pengguna: fallbackId,
                uniqueId: fallbackId,
                name: userData.name,
                nama_pengguna: userData.nama_pengguna
            };
            const token = await new SignJWT(jwtPayload)
                .setProtectedHeader({ alg: 'HS512' })
                .setExpirationTime(credentials?.remember_me === '1' ? '1d' : '7h')
                .sign(secret);

            const response = NextResponse.json(
                { status: '00', message: 'Login Berhasil', datetime: formatDateCalendar(new Date()), data: userData },
                { status: 200 }
            );
            response.cookies.set('_A2R', token, { httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge });
            return response;
        }

        return NextResponse.json(
            { status: '99', message: 'Login Gagal: Credential Tidak Ditemukan', datetime: formatDateCalendar(new Date()) },
            { status: 500 }
        );
    } catch (error: any) {
        let errorMessage = 'Login gagal';
        console.log(error);

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || error.message || 'Login gagal';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

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
                message: errorMessage,
                datetime: formatDateCalendar(new Date())
            },
            { status: 500 }
        );
    }
};
