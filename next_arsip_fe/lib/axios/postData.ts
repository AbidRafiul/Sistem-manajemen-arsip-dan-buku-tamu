import axios from 'axios';
// MATIKAN NEXTAUTH
// import { signOut } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/interceptor';

const Axios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
<<<<<<< HEAD
            if (typeof window !== "undefined") {
                await signOut({ callbackUrl: "/auth/login" });
            }
=======
            // GANTI LOGOUT NEXTAUTH JADI MANUAL (Hapus Cookie)
            // await signOut({ callbackUrl: "/auth/login" });
            document.cookie = "_A2R=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "_A2F=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/auth/login";
>>>>>>> fix/login-session-crash
        }
        return Promise.reject(error);
    }
);

async function postData(endpoint: string, data = {}, customHeader = {}) {
    // Pastikan endpoint diawali dengan '/'
    const proxyEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
<<<<<<< HEAD
        const header = {
            'X-ENDPOINT': proxyEndpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': '1',
                ...customHeader,
            }),
=======
        const defaultHeader = {
            'X-ENDPOINT': endpoint,
            'X-Level': '1',
            ...customHeader,
>>>>>>> fix/login-session-crash
        };

        // Cukup panggil Axios satu kali saja
        const response = await Axios.post('', data, { headers: header });
        return response;

    } catch (error: any) {
<<<<<<< HEAD
        // Error handling yang rapi tanpa memicu redundant logout
        console.error(`[postData Error] at ${proxyEndpoint}:`, error?.message);
=======
>>>>>>> fix/login-session-crash
        throw error;
    }
}

export default postData;