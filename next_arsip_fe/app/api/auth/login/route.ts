import { formatDateCalendar } from "@/lib/tools/dateTools";
import axios from "axios";
import { jwtVerify, SignJWT } from "jose";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Credentials {
    username: string;
    password: string;
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

        const credentials = await req.json()


        const dNow = new Date();
        const tokenResponse = await axios.get<TokenData>(`${process.env.API_URL}/auth/token`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': formatDateCalendar(dNow),
            },
        });

        const data = tokenResponse.data;

        if (!data?.access_token) {
            throw new Error('Token tidak ditemukan');
        }

        const credential: Credentials | any = {
            username: credentials?.username as string,
            password: credentials?.password as string,
        };


        const headers = {
            'Authorization': `${data.token_type} ${data.access_token}`,
            'Content-Type': 'application/json',
            'X-Timestamp': formatDateCalendar(new Date()),
        };

        const result = await axios.post<AuthResponse & User>(
            `${process.env.API_URL}/auth/login`,
            { ...credential },
            { headers }
        );

        const dataResponse = result.data;

        if (dataResponse?.credential) {
            const { payload: userDecrypted } = await jwtVerify(
                dataResponse.credential,
                new TextEncoder().encode(process.env.USER_KEY!)
            ) as { payload: any };

            const userData = {
                id: userDecrypted?.uniqueId || userDecrypted?.username,
                role: userDecrypted?.role,
                name: userDecrypted?.fullname,
                username: userDecrypted?.username,
                UserId: userDecrypted?.UserId,
                remember_me: credentials?.remember_me === '1',
                credential: dataResponse.credential
            };

            const response = NextResponse.json(
                {
                    status: '00',
                    message: 'Login Berhasil',
                    datetime: formatDateCalendar(new Date()),
                    data: userData
                },
                { status: 200 }
            );

            const maxAge = credentials?.remember_me === '1' ? 60 * 60 * 24 : 60 * 60 * 7;
            const secret = new TextEncoder().encode(process.env.USER_KEY!);
            const payload = {
                uid: userData.uniqueId,
                name: userData.name,
            };
            const token = await new SignJWT(payload)
                .setProtectedHeader({ alg: "HS512" })
                .setExpirationTime(credentials?.remember_me === '1' ? "1d" : "7h")
                .sign(secret);

            response.cookies.set('_A2F', dataResponse.credential, {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge,
            });

            response.cookies.set('_A2R', token, {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge,
            });

            return response;

        }

        return NextResponse.json(
            {
                status: '99',
                message: 'Login Gagal Credential Tidak Ditemukan',
                datetime: formatDateCalendar(new Date()),
            },
            { status: 500 }
        );

    } catch (error: any) {
        let errorMessage = 'Login gagal';
        console.log(error)

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
                    datetime: formatDateCalendar(new Date()),
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                status: '99',
                message: errorMessage,
                datetime: formatDateCalendar(new Date()),
            },
            { status: 500 }
        );
    }
}