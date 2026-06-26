'use client';

import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import { FilterMatchMode } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { apiEndpointCheckout, apiEndpointGet } from './components/endpoints';
import GuestDataTable from './components/display/table';
import { CheckoutDialog, DetailVisitorDialog } from './components/display/dialogs';
import { State } from './components/interfaces';

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
        <div className="p-4 surface-ground min-h-screen">
            <Toast ref={toast} position="top-right" />

            <GuestDataTable state={state} setState={setState} onCheckout={onCheckout} onDetail={onDetail} onFilterStatus={onFilterStatus} onRefresh={fetchAll} />

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
