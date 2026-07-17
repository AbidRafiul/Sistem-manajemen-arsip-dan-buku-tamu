'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { FilterMatchMode } from 'primereact/api';
import { State } from './components/interfaces';
import { apiEndpointGet, apiEndpointApproval } from './components/endpoints';
import GuestDataTable from './components/display/table';
import { CheckoutDialog, DetailVisitorDialog } from './components/display/dialogs';
import { useSession } from 'next-auth/react';

interface BranchRaw {
    id: number;
    name: string;
    id_induk: number | null;
}

const groupBranches = (list: BranchRaw[]): any[] => {
    const pusat: any[] = [];
    const cabang: any[] = [];
    const unit: any[] = [];

    const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));

    for (const item of sortedList) {
        const lowerName = item.name.toLowerCase();
        if (lowerName.includes('kecamatan') || lowerName.includes('unit')) {
            unit.push({ id: item.id, name: item.name });
        } else if (lowerName.includes('pusat')) {
            pusat.push({ id: item.id, name: item.name });
        } else {
            cabang.push({ id: item.id, name: item.name });
        }
    }

    const groups: any[] = [];
    if (pusat.length > 0) {
        groups.push({
            label: 'Kantor Pusat',
            items: pusat
        });
    }
    if (cabang.length > 0) {
        groups.push({
            label: 'Kantor Cabang',
            items: cabang
        });
    }
    if (unit.length > 0) {
        groups.push({
            label: 'Unit / Kecamatan',
            items: unit
        });
    }

    return groups;
};

const CheckoutPage = () => {
    const toast = useRef<Toast>(null);
    const [state, setState] = useState<State>({
        load: false,
        data: [],
        searchVal: '',
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        statusFilter: '',
        showCheckoutDialog: false,
        checkoutToken: '',
        checkoutNotes: '',
        detailRecord: null
    });
    const [selectedId, setSelectedId] = useState<string | number>('');
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | string>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('globalFilter');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return parsed.id_cabang || '';
                }
            } catch (e) {}
        }
        return '';
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p: State) => ({ ...p, load: true }));
        try {
            const response = await postData(apiEndpoint, payload);
            const result = response.data;
            if (result) {
                let finalArrayData = [];
                if (Array.isArray(result.data)) finalArrayData = result.data;
                else if (result.data && Array.isArray(result.data.rows)) finalArrayData = result.data.rows;
                else if (result.data && Array.isArray(result.data.data)) finalArrayData = result.data.data;
                else if (Array.isArray(result)) finalArrayData = result;
                setState((p: State) => ({ ...p, data: finalArrayData }));
            }
        } catch (error: any) {
            showError(toast, 'Gagal memuat data');
            setState((p: State) => ({ ...p, data: [] }));
        } finally {
            setState((p: State) => ({ ...p, load: false }));
        }
    };

    const fetchAll = async () => {
        const payload: Record<string, any> = {};
        if (state.statusFilter) payload.Status = state.statusFilter;
        if (selectedBranch) payload.id_cabang = selectedBranch;
        await getData(apiEndpointGet, payload);
    };

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_data/branches", {});
                if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                    const formatted = groupBranches(response.data.data);
                    setBranches([
                        {
                            label: 'Semua',
                            items: [{ id: '', name: 'Semua Kantor' }]
                        },
                        ...formatted
                    ]);
                }
            } catch (err) {
                console.error("Gagal memuat daftar cabang:", err);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchAll();
    }, [state.statusFilter, selectedBranch]);

    const onCheckout = (row: any) => {
        setSelectedId(row.id_kunjungan || '');
        setState((p: State) => ({
            ...p,
            showCheckoutDialog: true,
            checkoutToken: row.token_qr || row.kode_kunjungan || '',
            checkoutNotes: ''
        }));
    };

    const onDetail = (row: any) => {
        setState((p: State) => ({ ...p, detailRecord: row }));
    };

    const onFilterStatus = (value: string) => {
        setState((p: State) => ({ ...p, statusFilter: value }));
    };

    const handleCheckout = async () => {
        if (!selectedId) {
            showError(toast, 'ID Kunjungan tidak ditemukan');
            return;
        }

        try {
            setState((p: State) => ({ ...p, load: true }));

            const tokenSIAB = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token') || '') : '';

            let userIdAdmin = "";
            if (typeof window !== 'undefined') {
                const userSessionString = sessionStorage.getItem('user') || localStorage.getItem('user');
                if (userSessionString) {
                    try {
                        const parsedUser = JSON.parse(userSessionString);
                        userIdAdmin = parsedUser.user_id || parsedUser.id || parsedUser.UniqueId || "";
                    } catch (e) {
                        userIdAdmin = "";
                    }
                }
            }

            if (!userIdAdmin) {
                userIdAdmin = "1";
            }

            const timestamp = new Date().toISOString();

            const response = await axios.put(
                `http://localhost:8000/api/v1/buku_tamu/visit_checkout/${selectedId}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': tokenSIAB ? `Bearer ${tokenSIAB}` : '',
                        'x-access-token': tokenSIAB,
                        'x-timestamp': timestamp,
                        'x-uniqueid': userIdAdmin
                    }
                }
            );

            if (response.data?.status === '00') {
                showSuccess(toast, 'Check-out berhasil');
                setState((p: State) => ({ ...p, showCheckoutDialog: false, checkoutNotes: '' }));
                fetchAll();
            } else {
                throw new Error(response.data?.message || 'Gagal check-out');
            }
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || error?.message || 'Gagal check-out');
        } finally {
            setState((p: State) => ({ ...p, load: false }));
        }
    };

    const handleApproval = async (idKunjungan: string | number, action: 'approved' | 'rejected') => {
        try {
            setState((p: State) => ({ ...p, load: true }));

            const tokenSIAB = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token') || '') : '';

            let userIdAdmin = "";
            if (typeof window !== 'undefined') {
                const userSessionString = sessionStorage.getItem('user') || localStorage.getItem('user');
                if (userSessionString) {
                    try {
                        const parsedUser = JSON.parse(userSessionString);
                        userIdAdmin = parsedUser.user_id || parsedUser.id || parsedUser.UniqueId || "";
                    } catch (e) {
                        userIdAdmin = "";
                    }
                }
            }

            if (!userIdAdmin) {
                userIdAdmin = "1";
            }

            const timestamp = new Date().toISOString();

            const response = await axios.post(
                `http://localhost:8000/api/v1${apiEndpointApproval}`,
                {
                    idKunjungan,
                    action,
                    catatanPersetujuan: ""
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': tokenSIAB ? `Bearer ${tokenSIAB}` : '',
                        'x-access-token': tokenSIAB,
                        'x-timestamp': timestamp,
                        'x-uniqueid': userIdAdmin
                    }
                }
            );

            if (response.data?.status === '00') {
                showSuccess(toast, action === 'approved' ? 'Permohonan kunjungan disetujui!' : 'Permohonan kunjungan ditolak!');
                fetchAll();
            } else {
                throw new Error(response.data?.message || 'Gagal memproses persetujuan');
            }
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || error?.message || 'Gagal memproses persetujuan');
        } finally {
            setState((p: State) => ({ ...p, load: false }));
        }
    };

    const handleCheckin = async (idKunjungan: string | number) => {
        try {
            setState((p: State) => ({ ...p, load: true }));

            const tokenSIAB = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token') || '') : '';

            let userIdAdmin = "";
            if (typeof window !== 'undefined') {
                const userSessionString = sessionStorage.getItem('user') || localStorage.getItem('user');
                if (userSessionString) {
                    try {
                        const parsedUser = JSON.parse(userSessionString);
                        userIdAdmin = parsedUser.user_id || parsedUser.id || parsedUser.UniqueId || "";
                    } catch (e) {
                        userIdAdmin = "";
                    }
                }
            }

            if (!userIdAdmin) {
                userIdAdmin = "1";
            }

            const timestamp = new Date().toISOString();

            const response = await axios.put(
                `http://localhost:8000/api/v1/buku_tamu/visit_checkin/${idKunjungan}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': tokenSIAB ? `Bearer ${tokenSIAB}` : '',
                        'x-access-token': tokenSIAB,
                        'x-timestamp': timestamp,
                        'x-uniqueid': userIdAdmin
                    }
                }
            );

            if (response.data?.status === '00') {
                showSuccess(toast, response.data?.message || 'Check-in berhasil!');
                fetchAll();
            } else {
                throw new Error(response.data?.message || 'Gagal check-in');
            }
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || error?.message || 'Gagal check-in');
        } finally {
            setState((p: State) => ({ ...p, load: false }));
        }
    };

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />

            <GuestDataTable
                state={state}
                setState={setState}
                onCheckout={onCheckout}
                onDetail={onDetail}
                onFilterStatus={onFilterStatus}
                onRefresh={fetchAll}
                onApprove={(row) => handleApproval(row.id_kunjungan, 'approved')}
                onReject={(row) => handleApproval(row.id_kunjungan, 'rejected')}
                onCheckin={(row) => handleCheckin(row.id_kunjungan)}
                branches={branches}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
            />

            <CheckoutDialog
                visible={state.showCheckoutDialog}
                checkoutToken={state.checkoutToken}
                checkoutNotes={state.checkoutNotes}
                loading={state.load}
                onHide={() => setState((p: State) => ({ ...p, showCheckoutDialog: false }))}
                onTokenChange={(val) => setState((p: State) => ({ ...p, checkoutToken: val }))}
                onNotesChange={(val) => setState((p: State) => ({ ...p, checkoutNotes: val }))}
                onConfirm={handleCheckout}
            />

            <DetailVisitorDialog
                visible={!!state.detailRecord}
                record={state.detailRecord}
                onHide={() => setState((p: State) => ({ ...p, detailRecord: null }))}
            />
        </div>
    );
};

export default CheckoutPage;
