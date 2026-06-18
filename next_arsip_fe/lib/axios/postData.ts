import axios from 'axios';
// MATIKAN NEXTAUTH
// import { signOut } from "next-auth/react";

const API_BASE_URL = 'http://localhost:8000/api/v1';

const Axios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

Axios.interceptors.response.use(
    r => r,
    async (error) => {
        if (error.response?.status === 401) {
            // GANTI LOGOUT NEXTAUTH JADI MANUAL (Hapus Cookie)
            // await signOut({ callbackUrl: "/auth/login" });
            document.cookie = "_A2R=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "_A2F=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

async function postData(endpoint: string, data = {}, customHeader = {}) {
    const cleanPath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    try {
        const defaultHeader = {
            'X-ENDPOINT': endpoint,
            'X-Level': '1',
            ...customHeader,
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

        const response = await Axios.post(cleanPath, data, { headers });
        return response;
    } catch (error: any) {
        throw error;
    }
}

export default postData;