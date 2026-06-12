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

    if (cleanPath.includes('user-data') || cleanPath.includes('nav')) {
        return {
            data: {
                status: '00',
                message: 'Success',
                data: [
                    {
                        label: 'HOME',
                        items: [
                            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }
                        ]
                    },
                    {
                        label: 'SETUP',
                        items: [
                            { label: 'Users', icon: 'pi pi-fw pi-users', to: '/setup/users' },
                            { label: 'Config', icon: 'pi pi-fw pi-cog', to: '/setup/config' }
                        ]
                    },
                    {
                        label: 'Guest Management',
                        items: [
                            { label: 'Monitoring Guest Book', icon: 'pi pi-fw pi-list', to: '/buku_tamu/monitoring' }
                        ]
                    }
                ]
            }
        };
    }

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

    try {
        const isFormData = data instanceof FormData;
        const headers: Record<string, string> = {
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