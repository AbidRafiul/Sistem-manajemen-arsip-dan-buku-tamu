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
        // Jangan auto-redirect — biarkan halaman yang handle error
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

        let filterHeaders: Record<string, string> = {};
        if (typeof window !== 'undefined') {
            try {
                const savedFilter = localStorage.getItem('globalFilter');
                if (savedFilter) {
                    const parsed = JSON.parse(savedFilter);
                    if (parsed.id_cabang) {
                        filterHeaders['x-filter-cabang'] = String(parsed.id_cabang);
                        if (parsed.exact_cabang) filterHeaders['x-exact-cabang'] = 'true';
                    }
                    if (parsed.id_departemen) filterHeaders['x-filter-departemen'] = String(parsed.id_departemen);
                    if (parsed.id_divisi) filterHeaders['x-filter-divisi'] = String(parsed.id_divisi);
                    if (parsed.id_unit_kerja) filterHeaders['x-filter-unit-kerja'] = String(parsed.id_unit_kerja);
                }
            } catch (e) {}
        }

        // 1. Gabungkan header tambahan
        const mergedCustomHeaders = {
            'X-Level': "1",
            ...filterHeaders,
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
        throw error;
    }
}

export default getData;