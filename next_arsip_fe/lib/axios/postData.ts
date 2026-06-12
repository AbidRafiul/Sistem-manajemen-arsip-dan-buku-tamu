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
    const cleanPath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const proxyEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const forwardHeader = { ...(customHeader as Record<string, string>) };
    delete forwardHeader['Content-Type'];
    delete forwardHeader['content-type'];


    try {
        const defaultHeader = {
            'X-ENDPOINT': proxyEndpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': '1',
                ...forwardHeader,
            }),
        };

        const isFormData = data instanceof FormData;
        const headers: Record<string, string> = {
            ...defaultHeader,
            ...customHeader,
        };

        if (isFormData) {
            delete headers['Content-Type'];
            delete headers['content-type'];
        } else {
            headers['Content-Type'] = 'application/json';
        }

        const isNextProxy = API_BASE_URL.includes('/api/interceptor');
        const response = await Axios.post(isNextProxy ? '' : cleanPath, data, { headers });
        return response;
    } catch (error: any) {
        throw error;
    }
}

export default postData;
