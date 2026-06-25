import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/interceptor';

const Axios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            document.cookie = "_A2R=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "_A2F=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

async function postData(endpoint: string, data = {}, customHeader = {}) {
    try {
        // 1. Gabungkan X-Level dengan customHeader (kalau misalnya ada tambahan lain dari luar)
        const mergedCustomHeaders = {
            'X-Level': '1',
            ...customHeader,
        };
        
        // 2. Bungkus ke dalam format yang dimengerti oleh route.ts
        const defaultHeader = {
            'X-ENDPOINT': endpoint, // Interceptor bakal baca tujuan aslinya dari sini
            'x-custom-header': JSON.stringify(mergedCustomHeaders), // WAJIB di-stringify
        };
        
        // Kosongkan path parameter pertama ('') agar Axios HANYA menembak baseURL (/api/interceptor)
        const response = await Axios.post('', data, { headers: defaultHeader });
        
        return response;
    } catch (error: any) {
        throw error;
    }
}

export default postData;