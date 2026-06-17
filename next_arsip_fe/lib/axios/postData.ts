import axios from 'axios';
import { signOut } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/interceptor';

const Axios = axios.create({
    baseURL: API_BASE_URL,
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

async function postData(endpoint: string, data = {}, customHeader = {}) {
    const proxyEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
        const header = {
            'X-ENDPOINT': proxyEndpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': '1',
                ...customHeader,
            }),
        };

        const response = await Axios.post('', data, { headers: header });
        return response;
    } catch (error: any) {
        throw error;
    }
}

export default postData;
