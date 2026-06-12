'use client'

import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useFormik } from "formik";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { initValue, State } from "./interfaces";
import Table from "./table";
import Form from "./form";
import { apiEndpointGet, apiEndpointMonitoring, apiEndpointApproval, apiEndpointGetPurpose, apiEndpointGetUser, apiEndpointCheckout } from "./endpoints";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api"; 

// 🎯 FIX VIEWPORT EXPORT
export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

const initialValues: initValue = {
    VisitationId: null,
    GuestName: "",
    PhoneNumber: "",
    GuestEmail: "",
    GuestCompany: "",
    GuestPosition: "",
    VisitPurposeId: null, 
    HostUserId: "",
    HostName: "",
    IdentityType: "",
    IdentityNumber: "",
    VisitNotes: "",
    CheckInTime: "",
    Status: "in",
    ApprovalStatus: "approved",
};

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();
    const [state, setState] = useState<State>({
        load: false,
        data: [],
        add: false,
        edit: false,
        delete: false,
        selectedUsers: [],
        searchVal: '',
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } }, 
        session: null,
        submittedData: null,
        visitPurposeData: [],
        hostUserData: [],
        statData: null,
        autoRefresh: false,
        statusFilter: '', 
        showCheckoutDialog: false,
        checkoutToken: '',
        checkoutNotes: '',
        detailRecord: null,
    });

    const formik = useFormik({
        initialValues,
        validate: (data) => {
            const errors: Record<string, string> = {};
            if (!data.GuestName) errors.GuestName = 'GuestName wajib diisi';
            if (!data.PhoneNumber) errors.PhoneNumber = 'PhoneNumber wajib diisi';
            if (!data.VisitPurposeId) errors.VisitPurposeId = 'VisitPurposeId wajib diisi';
            return errors;
        },
        onSubmit: () => {
            setState((p) => ({ ...p, submittedData: formik.values }));
        },
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const response = await postData(apiEndpoint, payload);
            const result = response.data;
            
            if (result) {
                let finalArrayData = [];

                if (Array.isArray(result.data)) {
                    finalArrayData = result.data;
                } 
                else if (result.data && Array.isArray(result.data.data)) {
                    finalArrayData = result.data.data;
                } 
                else if (Array.isArray(result)) {
                    finalArrayData = result;
                }

                setState((p) => ({ ...p, data: finalArrayData }));
            }
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal memuat data');
            setState((p) => ({ ...p, data: [] })); 
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const fetchMonitoring = async () => {
        try {
            const response = await postData(apiEndpointMonitoring);
            setState((p) => ({ ...p, statData: response.data.data || null }));
        } catch (error: any) {
            console.log('⚠️ [Silent Filter] Statistik monitoring belum siap di backend Express.');
        }
    };

    const loadVisitPurpose = async () => {
        try {
            const response = await postData(apiEndpointGetPurpose);
            const resContent = response?.data;
            setState((p) => ({ ...p, visitPurposeData: resContent?.data || resContent || [] }));
        } catch (error: any) {
            console.log('⚠️ [Silent Filter] Dropdown Visit Purpose belum siap di backend Express.');
        }
    };

    const loadHostUsers = async () => {
        try {
            const response = await postData(apiEndpointGetUser);
            const resContent = response?.data;
            setState((p) => ({ ...p, hostUserData: resContent?.data || resContent || [] }));
        } catch (error: any) {
            console.log('⚠️ [Silent Filter] Dropdown Host Users belum siap di backend Express.');
        }
    };

    const fetchAll = async () => {
        await fetchMonitoring();
        await getData(apiEndpointGet, state.statusFilter ? { Status: state.statusFilter } : {});
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({ ...prev, session }));
        }
    }, [session]);

    useEffect(() => {
        fetchAll();
        loadVisitPurpose();
        loadHostUsers();
    }, []);

    useEffect(() => {
        let interval: number | undefined;
        if (state.autoRefresh) {
            interval = window.setInterval(() => {
                fetchAll();
            }, 30000);
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [state.autoRefresh, state.statusFilter]);

    const onOpenCheckin = () => {
        setState((p) => ({ ...p, add: true }));
    };

    const onCheckout = (row: any) => {
        setState((p) => ({ ...p, showCheckoutDialog: true, checkoutToken: row.QRToken || row.VisitCode || '', checkoutNotes: '' }));
    };

    const onDetail = (row: any) => {
        setState((p) => ({ ...p, detailRecord: row }));
    };

    const onFilterStatus = async (value: string) => {
        setState((p) => ({ ...p, statusFilter: value }));
        await getData(apiEndpointGet, value ? { Status: value } : {});
    };

    const onRefresh = () => {
        fetchAll();
    };

    const handleCheckout = async () => {
        try {
            setState((p) => ({ ...p, load: true }));
            const payload: any = {};
            if (state.checkoutToken) payload.QRToken = state.checkoutToken;
            if (state.checkoutNotes) payload.VisitNotes = state.checkoutNotes;
            const response = await postData(apiEndpointCheckout, payload);
            const result = response.data;
            if (result?.status !== '00') {
                throw new Error(result?.message || 'Gagal check-out');
            }
            showSuccess(toast, 'Check-out berhasil');
            setState((p) => ({ ...p, showCheckoutDialog: false, checkoutNotes: '' }));
            fetchAll();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || error?.message || 'Gagal check-out');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    return (
        <div className="p-4 bg-slate-50 min-h-screen">
            <Toast ref={toast} position="top-right" />

            {/* 🎯 KARTU STATISTIK PREMIUM: Menggunakan Flexbox Vertikal Anti-Tabrakan & Box Ikon Pojok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                
                {/* 🔹 Card 1: Tamu Hari Ini (#4F46E5) */}
                <div style={{ backgroundColor: '#4F46E5' }} className="text-white p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[110px] transition-transform hover:scale-102">
                    <span className="text-xs font-bold tracking-wider opacity-80 uppercase">Tamu Hari Ini</span>
                    <div className="flex justify-between items-end mt-4">
                        <span className="text-4xl font-extrabold leading-none">{state.data ? state.data.length : 0}</span>
                        <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                            <i className="pi pi-users text-xl opacity-90"></i>
                        </div>
                    </div>
                </div>

                {/* 🟢 Card 2: Sedang Berkunjung (#0EA5E9) */}
                <div style={{ backgroundColor: '#0EA5E9' }} className="text-white p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[110px] transition-transform hover:scale-102">
                    <span className="text-xs font-bold tracking-wider opacity-80 uppercase">Sedang Berkunjung</span>
                    <div className="flex justify-between items-end mt-4">
                        <span className="text-4xl font-extrabold leading-none">
                            {state.data ? state.data.filter((t: any) => t.Status === 'in').length : 0}
                        </span>
                        <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                            <i className="pi pi-sign-in text-xl opacity-90"></i>
                        </div>
                    </div>
                </div>

                {/* 🔘 Card 3: Sudah Keluar (#64748B) */}
                <div style={{ backgroundColor: '#64748B' }} className="text-white p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[110px] transition-transform hover:scale-102">
                    <span className="text-xs font-bold tracking-wider opacity-80 uppercase">Sudah Keluar</span>
                    <div className="flex justify-between items-end mt-4">
                        <span className="text-4xl font-extrabold leading-none">
                            {state.data ? state.data.filter((t: any) => t.Status === 'out').length : 0}
                        </span>
                        <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                            <i className="pi pi-sign-out text-xl opacity-90"></i>
                        </div>
                    </div>
                </div>

                {/* 🟠 Card 4: Menunggu Approval (#F43F5E) */}
                <div style={{ backgroundColor: '#F43F5E' }} className="text-white p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[110px] transition-transform hover:scale-102">
                    <span className="text-xs font-bold tracking-wider opacity-80 uppercase">Menunggu Approval</span>
                    <div className="flex justify-between items-end mt-4">
                        <span className="text-4xl font-extrabold leading-none">
                            {state.data ? state.data.filter((t: any) => t.ApprovalStatus === 'pending').length : 0}
                        </span>
                        <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                            <i className="pi pi-clock text-xl opacity-90"></i>
                        </div>
                    </div>
                </div>

            </div>

            {/* 🔹 AREA UTAMA TABEL MONITORING DATA */}
            <Table
                state={state}
                setState={setState}
                getData={getData}
                toast={toast}
                onOpenCheckin={onOpenCheckin}
                onCheckout={onCheckout}
                onApprove={async () => {}}
                onReject={async () => {}}
                onDetail={onDetail}
                onFilterStatus={onFilterStatus}
                onRefresh={onRefresh}
            />
            
            <Form state={state} setState={setState} formik={formik} toast={toast} getData={getData} />

            {/* POP-UP DIALOG MODAL AREA */}
            <Dialog header="Check-Out Tamu" visible={state.showCheckoutDialog} modal style={{ width: '480px' }} onHide={() => setState((p) => ({ ...p, showCheckoutDialog: false }))}>
                <div className="grid grid-nogutter gap-3">
                    <div className="col-12">
                        <label htmlFor="checkoutToken">QR Token / Visit Code</label>
                        <InputText id="checkoutToken" value={state.checkoutToken} className="w-full mt-1" onChange={(e) => setState((p) => ({ ...p, checkoutToken: e.target.value }))} />
                    </div>
                    <div className="col-12">
                        <label htmlFor="checkoutNotes">Catatan</label>
                        <InputTextarea id="checkoutNotes" value={state.checkoutNotes} className="w-full mt-1" onChange={(e) => setState((p) => ({ ...p, checkoutNotes: e.target.value }))} rows={4} />
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Batal" severity="secondary" outlined onClick={() => setState((p) => ({ ...p, showCheckoutDialog: false }))} />
                    <Button label="Konfirmasi" severity="success" onClick={handleCheckout} loading={state.load} />
                </div>
            </Dialog>

            <Dialog header="Detail Kunjungan" visible={!!state.detailRecord} modal style={{ width: '600px' }} onHide={() => setState((p) => ({ ...p, detailRecord: null }))}>
                {state.detailRecord && (
                    <div className="grid grid-nogutter gap-3">
                        <div className="col-12 md:col-6"><strong>Guest Name</strong><div>{state.detailRecord.GuestName}</div></div>
                        <div className="col-12 md:col-6"><strong>Phone Number</strong><div>{state.detailRecord.PhoneNumber}</div></div>
                        <div className="col-12 md:col-6"><strong>Company</strong><div>{state.detailRecord.GuestCompany}</div></div>
                        <div className="col-12 md:col-6"><strong>Purpose</strong><div>{state.detailRecord.VisitPurposeName}</div></div>
                        <div className="col-12 md:col-6"><strong>Host</strong><div>{state.detailRecord.HostName}</div></div>
                        <div className="col-12 md:col-6"><strong>Status</strong><div>{state.detailRecord.Status}</div></div>
                        <div className="col-12"><strong>Check In</strong><div>{formatDateCalendar(state.detailRecord.CheckInTime, 'HH:mm dd/MM/yyyy')}</div></div>
                        <div className="col-12"><strong>Check Out</strong><div>{state.detailRecord.CheckOutTime ? formatDateCalendar(state.detailRecord.CheckOutTime, 'HH:mm dd/MM/yyyy') : '-'}</div></div>
                        <div className="col-12"><strong>Notes</strong><div>{state.detailRecord.VisitNotes}</div></div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Page;