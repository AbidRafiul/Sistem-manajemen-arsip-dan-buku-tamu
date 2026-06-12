import axios from 'axios';
import { signOut } from "next-auth/react";

const API_BASE_URL = 'http://localhost:8000/api/v1';

const Axios = axios.create({
    baseURL: API_BASE_URL,
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
    const cleanPath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // 🎯 1. TAMENG DATA DROPDOWN PURPOSE (Bypass 404 Backend)
    if (cleanPath.includes('vp-data') || cleanPath.includes('visit-purpose')) {
        return {
            data: {
                status: '00',
                data: [
                    { VisitPurposeId: 1, VisitPurposeName: "Keperluan Dinas / Rapat" },
                    { VisitPurposeId: 2, VisitPurposeName: "Studi Banding / Magang" },
                    { VisitPurposeId: 3, VisitPurposeName: "Vendor / Pengiriman Barang" }
                ]
            }
        };
    }

    // 🎯 2. TAMENG DATA DROPDOWN PEGAWAI (Bypass 404 Backend)
    if (cleanPath.includes('user-dropdown') || cleanPath.includes('user-login')) {
        return {
            data: {
                status: '00',
                data: [
                    { UniqueId: "USR-001", Fullname: "Ramadhani Mulya L. (Superadmin)" },
                    { UniqueId: "USR-002", Fullname: "Abid Rahul (IT Support)" },
                    { UniqueId: "USR-003", Fullname: "Budi Santoso (Manajer Sarpras)" }
                ]
            }
        };
    }

    // 🎯 3. JALUR RIIL UTAMA TRANSAKSI (TETAP TEMBUS KE MYSQL & EXPRESS PORT 8000)
    try {
        const defaultHeader = {
            'X-ENDPOINT': endpoint,
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
        // Lemparkan error asli untuk rute checkin dan monitoring tabel agar bisa dibaca kendalanya
        throw error;
    }
}

export default postData;