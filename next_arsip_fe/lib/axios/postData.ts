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
        // Jangan auto-redirect atau hapus cookie — biarkan halaman yang handle error
        return Promise.reject(error);
    }
);

async function postData(endpoint: string, data = {}, customHeader = {}) {
    try {
        let filterHeaders: Record<string, string> = {};
        if (typeof window !== 'undefined') {
            try {
                const savedFilter = localStorage.getItem('globalFilter');
                if (savedFilter) {
                    const parsed = JSON.parse(savedFilter);
                    if (parsed.id_cabang) {
                        filterHeaders['x-filter-cabang'] = String(parsed.id_cabang);
                        // Jadikan exact match (tanpa turun level) sebagai default sistem
                        filterHeaders['x-exact-cabang'] = 'true';
                    }
                    if (parsed.id_departemen) filterHeaders['x-filter-departemen'] = String(parsed.id_departemen);
                    if (parsed.id_divisi) filterHeaders['x-filter-divisi'] = String(parsed.id_divisi);
                    if (parsed.id_unit_kerja) filterHeaders['x-filter-unit-kerja'] = String(parsed.id_unit_kerja);
                }
            } catch (e) {}
        }

        // 1. Gabungkan X-Level dengan customHeader (kalau misalnya ada tambahan lain dari luar)
        const mergedCustomHeaders = {
            'X-Level': '1',
            ...filterHeaders,
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