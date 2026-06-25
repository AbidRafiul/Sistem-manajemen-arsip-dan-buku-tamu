import axios from 'axios';
import { logout } from '../tools/serverTools';
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
    r => r,
    async (error) => {
        if (error.response?.status === 401) {
            await signOut({ callbackUrl: "/auth/login" });
        }
        return Promise.reject(error);
    }
);

async function getData(endpoint: string, params: Record<string, any> = {}, customHeader = {}) {
    try {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });

        const apiEndpoint = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;

        // 1. Gabungkan header tambahan
        const mergedCustomHeaders = {
            'X-Level': "1",
            ...customHeader
        };

        // 2. Bungkus ke dalam x-custom-header (Sesuai maunya Interceptor)
        const headers: Record<string, string> = {
            'X-ENDPOINT': apiEndpoint,
            'x-custom-header': JSON.stringify(mergedCustomHeaders) // <-- INI KUNCINYA
        };

        const response = await Axios.get('', { headers });
        return response;
        
    } catch (error: any) {
        console.log("Error GET Data:", error?.response?.data || error);
        if (error?.response?.status == 401) {
            logout(null, true);
        }
        throw error;
    }
}

export default getData;