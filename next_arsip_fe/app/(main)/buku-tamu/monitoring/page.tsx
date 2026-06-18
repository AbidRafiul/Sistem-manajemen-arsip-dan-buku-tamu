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
            console.log('[Silent Filter] Statistik monitoring belum siap di backend Express.');
        }
    };

    const loadVisitPurpose = async () => {
        try {
            const response = await postData(apiEndpointGetPurpose);
            const resContent = response?.data;
            // 🎯 KEMBALI KE ASAL: Membaca properti database asli kelompokmu
            setState((p) => ({ ...p, visitPurposeData: resContent?.data || resContent || [] }));
        } catch (error: any) {
            console.log('[Silent Filter] Dropdown Visit Purpose belum siap di backend Express.');
        }
    };

    const loadHostUsers = async () => {
        try {
            const response = await postData(apiEndpointGetUser);
            const resContent = response?.data;
            // 🎯 KEMBALI KE ASAL: Membaca properti database asli kelompokmu
            setState((p) => ({ ...p, hostUserData: resContent?.data || resContent || [] }));
        } catch (error: any) {
            console.log('[Silent Filter] Dropdown Host Users belum siap di backend Express.');
        }
    };

    const fetchAll = async () => {
        await fetchMonitoring();
        // Mengosongkan parameter filter status di awal load agar menarik semua data dari db_magang
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

    const onApprove = async (row: any) => {
        try {
            setState((p) => ({ ...p, load: true }));
            await postData(apiEndpointApproval, { VisitationId: row.VisitationId, action: 'approved', ApprovalNotes: '' });
            showSuccess(toast, 'Kunjungan disetujui');
            fetchAll();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal approve');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const onReject = async (row: any) => {
        try {
            setState((p) => ({ ...p, load: true }));
            await postData(apiEndpointApproval, { VisitationId: row.VisitationId, action: 'rejected', ApprovalNotes: '' });
            showSuccess(toast, 'Kunjungan ditolak');
            fetchAll();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal reject');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
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
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Table
                state={state}
                setState={setState}
                getData={getData}
                toast={toast}
                onOpenCheckin={onOpenCheckin}
                onCheckout={onCheckout}
                onApprove={onApprove}
                onReject={onReject}
                onDetail={onDetail}
                onFilterStatus={onFilterStatus}
                onRefresh={onRefresh}
            />
            <Form state={state} setState={setState} formik={formik} toast={toast} getData={getData} />

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