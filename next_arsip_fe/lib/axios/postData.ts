import axios from 'axios';
import { signOut } from "next-auth/react";

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
            if (typeof window !== "undefined") {
                await signOut({ callbackUrl: "/auth/login" });
            }
        }
        return Promise.reject(error);
    }
);

async function postData(endpoint: string, data = {}, customHeader = {}) {
    // Pastikan endpoint diawali dengan '/'
    const proxyEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
        const header = {
            'X-ENDPOINT': proxyEndpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': '1',
                ...customHeader,
            }),
        };

        // Cukup panggil Axios satu kali saja
        const response = await Axios.post('', data, { headers: header });
        return response;

    } catch (error: any) {
        // Error handling yang rapi tanpa memicu redundant logout
        console.error(`[postData Error] at ${proxyEndpoint}:`, error?.message);
        throw error;
    }
}

export default postData;