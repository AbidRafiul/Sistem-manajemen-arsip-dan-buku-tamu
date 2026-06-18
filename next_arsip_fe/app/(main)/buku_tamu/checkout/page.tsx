'use client'

import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { formatDateCalendar } from "@/lib/tools/dateTools";
import { State } from "./components/interfaces";
import { apiEndpointGet, apiEndpointCheckout } from "./components/endpoints";
import GuestDataTable from "./components/display/table";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";

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
        detailRecord: null,
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
        await getData(apiEndpointGet, state.statusFilter ? { Status: state.statusFilter } : {});
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const onCheckout = (row: any) => {
        setState((p: State) => ({ ...p, showCheckoutDialog: true, checkoutToken: row.qr_token || row.visit_code || '', checkoutNotes: '' }));
    };

    const onDetail = (row: any) => {
        setState((p: State) => ({ ...p, detailRecord: row }));
    };

    const onFilterStatus = (value: string) => {
        setState((p: State) => ({ ...p, statusFilter: value }));
        getData(apiEndpointGet, value ? { Status: value } : {});
    };

    const handleCheckout = async () => {
        try {
            setState((p: State) => ({ ...p, load: true }));
            const payload: any = {};
            if (state.checkoutToken) payload.QRToken = state.checkoutToken;
            if (state.checkoutNotes) payload.VisitNotes = state.checkoutNotes;
            const response = await postData(apiEndpointCheckout, payload);
            if (response.data?.status === '00') {
                showSuccess(toast, 'Check-out berhasil');
                setState((p: State) => ({ ...p, showCheckoutDialog: false, checkoutNotes: '' }));
                fetchAll();
            } else {
                throw new Error();
            }
        } catch (error: any) {
            showError(toast, 'Gagal check-out');
        } finally {
            setState((p: State) => ({ ...p, load: false }));
        }
    };

    return (
        <div className="p-4 bg-slate-50 min-h-screen">
            <Toast ref={toast} position="top-right" />

            <GuestDataTable 
                state={state} 
                setState={setState} 
                onCheckout={onCheckout} 
                onDetail={onDetail} 
                onFilterStatus={onFilterStatus} 
                onRefresh={fetchAll} 
            />

            <Dialog header="Check-Out Tamu" visible={state.showCheckoutDialog} modal style={{ width: '480px' }} onHide={() => setState((p: State) => ({ ...p, showCheckoutDialog: false }))}>
                <div className="grid grid-nogutter gap-3">
                    <div className="col-12">
                        <label htmlFor="checkoutToken">QR Token / Visit Code</label>
                        <InputText id="checkoutToken" value={state.checkoutToken} className="w-full mt-1" onChange={(e) => setState((p: State) => ({ ...p, checkoutToken: e.target.value }))} />
                    </div>
                    <div className="col-12">
                        <label htmlFor="checkoutNotes">Catatan Keperluan Keluar</label>
                        <InputTextarea id="checkoutNotes" value={state.checkoutNotes} className="w-full mt-1" onChange={(e) => setState((p: State) => ({ ...p, checkoutNotes: e.target.value }))} rows={4} />
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Batal" severity="secondary" outlined onClick={() => setState((p: State) => ({ ...p, showCheckoutDialog: false }))} />
                    <Button label="Konfirmasi Selesai" severity="success" onClick={handleCheckout} loading={state.load} />
                </div>
            </Dialog>

            <Dialog header="Detail Riwayat Kunjungan" visible={!!state.detailRecord} modal style={{ width: '600px' }} onHide={() => setState((p: State) => ({ ...p, detailRecord: null }))}>
                {state.detailRecord && (
                    <div className="grid grid-nogutter gap-3">
                        <div className="col-12 md:col-6"><strong>Nama Tamu</strong><div>{state.detailRecord.guest_name}</div></div>
                        <div className="col-12 md:col-6"><strong>No. Telepon</strong><div>{state.detailRecord.phone_number}</div></div>
                        <div className="col-12 md:col-6"><strong>Instansi/Perusahaan</strong><div>{state.detailRecord.guest_company}</div></div>
                        <div className="col-12 md:col-6"><strong>Tujuan Alasan</strong><div>{state.detailRecord.VisitPurposeName}</div></div>
                        <div className="col-12 md:col-6"><strong>Pegawai yang Ditemui</strong><div>{state.detailRecord.HostFullname || state.detailRecord.host_name || '-'}</div></div>
                        <div className="col-12 md:col-6"><strong>Status Saat Ini</strong><div>{state.detailRecord.status}</div></div>
                        <div className="col-12"><strong>Waktu Check-In</strong><div>{formatDateCalendar(state.detailRecord.check_in_time, 'HH:mm dd/MM/yyyy')}</div></div>
                        <div className="col-12"><strong>Waktu Check-Out</strong><div>{state.detailRecord.check_out_time ? formatDateCalendar(state.detailRecord.check_out_time, 'HH:mm dd/MM/yyyy') : '-'}</div></div>
                        <div className="col-12"><strong>Catatan Tambahan</strong><div>{state.detailRecord.visit_notes}</div></div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default CheckoutPage;