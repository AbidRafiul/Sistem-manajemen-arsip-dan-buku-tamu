import axios from 'axios';
import { logout } from '../tools/serverTools';
import { signOut } from "next-auth/react";

const Axios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_DIR_DOWNLOAD_PATH,
    headers: {
        'Content-Type': 'application/json',

    },
    withCredentials: true,
});


Axios.interceptors.response.use(
    r => r,
    async (error) => {
        if (error.config?.responseType === 'blob') {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            await signOut({ callbackUrl: "/auth/login" });
        }
        return Promise.reject(error);
    }
);


async function fileDownload(endpoint: string, data = {}, customHeader = {}) {
    try {
        // console.log(process.env.NEXT_PUBLIC_API_DIR_PATH)
        const header = {
            'X-ENDPOINT': endpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': "1",
                ...customHeader
            }),
        };

        const response = await Axios.post('', data, {
            headers: header,
            responseType: 'blob',
            transitional: {
                silentJSONParsing: true
            }
        });
        return response;
    } catch (error: any) {
        const resp = error?.response;
        if (resp && resp.data) {
            try {
                // baca blob jadi teks
                const text = await resp.data.text();
                let parsed;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    parsed = text;
                }
                error.response.data = parsed;
            } catch {
                error.response.data = { message: "Gagal membaca response error" };
            }
        }
        if (error?.response?.status == 401) {
            logout(null, true);
        }
        throw error;
    }
}

export default fileDownload;
