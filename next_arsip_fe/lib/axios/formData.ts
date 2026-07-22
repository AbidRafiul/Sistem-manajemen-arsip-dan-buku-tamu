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

async function formUpload(endpoint: string, formData = {}, customHeader = {}) {
    try {
        let filterHeaders: Record<string, string> = {};
        if (typeof window !== 'undefined') {
            try {
                const savedFilter = localStorage.getItem('globalFilter');
                if (savedFilter) {
                    const parsed = JSON.parse(savedFilter);
                    if (parsed.id_cabang) filterHeaders['x-filter-cabang'] = String(parsed.id_cabang);
                    if (parsed.id_departemen) filterHeaders['x-filter-departemen'] = String(parsed.id_departemen);
                    if (parsed.id_divisi) filterHeaders['x-filter-divisi'] = String(parsed.id_divisi);
                    if (parsed.id_unit_kerja) filterHeaders['x-filter-unit-kerja'] = String(parsed.id_unit_kerja);
                }
            } catch (e) {}
        }

        const mergedCustomHeaders = {
            'X-Level': '1',
            ...filterHeaders,
            ...customHeader
        };

        const header = {
            'X-ENDPOINT': endpoint,
            'X-Custom-Header': JSON.stringify(mergedCustomHeaders),
        };

        const response = await Axios.post('', formData, {
            headers: header,
        });
        return response;
    } catch (error: any) {
        console.log(error);
        if (error?.response?.status == 401) {
            logout(null, true);
        }
        throw error;
    }
}

export default formUpload;
