import axios from 'axios';
import { logout } from '../tools/serverTools';
import { signOut } from "next-auth/react";

const Axios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_DIR_FORMDATA_PATH,
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


async function formUpload(endpoint: string, formData = {}, customHeader: {},) {
    try {
        const header = {
            'X-ENDPOINT': endpoint,
            'X-Custom-Header': JSON.stringify({
                'X-Level': "1",
                ...customHeader
            }),
        };

        const response = await Axios.post('', formData, {
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

export default formUpload;
