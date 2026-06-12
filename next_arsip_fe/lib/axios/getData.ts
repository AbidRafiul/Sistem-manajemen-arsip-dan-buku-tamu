import axios from 'axios';
import { logout } from '../tools/serverTools';
import { signOut } from "next-auth/react";

const Axios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_DIR_PATH,
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

        const header = {
            'X-ENDPOINT': apiEndpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': "1",
                ...customHeader
            }),
        };

        const response = await Axios.get('', {
            headers: header,
        });
        return response;
    } catch (error: any) {
        console.log(error)
        if (error?.response?.status == 401) {
            logout(null, true);
        }
        throw error;
    }
}

export default getData;
