import axios from 'axios';
import { logout } from '../tools/serverTools';
import { signOut } from "next-auth/react";

// Pastikan NEXT_PUBLIC_API_DIR_PATH di .env lo isinya 'http://localhost:8000/api/v1'
// Di getData.ts
const Axios = axios.create({
    // UBAH BARIS INI SEMENTARA:
    baseURL: 'http://localhost:8000/api/v1', 
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

        // Hapus slash di depan kalau ada, biar gak numpuk sama baseURL
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const apiEndpoint = query.toString() ? `${cleanEndpoint}?${query.toString()}` : cleanEndpoint;

        // PERBAIKAN: Bikin header jadi flat, jangan dibungkus X-Custom-Header
        const headers: Record<string, string> = {
            'X-ENDPOINT': endpoint,
            'X-Level': "1",
            ...customHeader // x-uniqueid dan Authorization masuk langsung ke sini
        };

        // PERBAIKAN: Masukkan apiEndpoint ke sini, bukan ''
        const response = await Axios.get(apiEndpoint, { headers });
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