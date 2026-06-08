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


async function postData(endpoint: string, data = {}, customHeader = {}) {
    try {
        // console.log(process.env.NEXT_PUBLIC_API_DIR_PATH)
        const defaultHeader = {
            'X-ENDPOINT': endpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': "1",
                ...customHeader
            }),
        };

        const headers = {
            ...defaultHeader,
            ...customHeader,
        };

        const response = await Axios.post('', data, {
            headers,
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

export default postData;
