'use client';

import getDataRequest from "@/lib/axios/getData";
import { showError } from "@/lib/tools/generalTools";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import DocumentTable from "../components/display/document-table";
import { apiEndpointSigned } from "../components/endpoints";
import { TteState } from "../components/interfaces";

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<TteState>({
        load: false,
        detail: false,
        detailLoad: false,
        data: [],
        detailData: null,
        selectedRows: [],
        searchVal: "",
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getDataRequest(apiEndpoint, payload);
            setState((p) => ({ ...p, data: res.data?.data || [] }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Dokumen tertandatangani gagal diambil");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) setState((p) => ({ ...p, session }));
    }, [session]);

    useEffect(() => {
        getData(apiEndpointSigned, { sort_by: "waktu_tanda_tangan", sort_order: "desc" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <DocumentTable
                mode="signed"
                title="Dokumen Tertandatangani"
                subtitle="Pantau PDF surat keluar yang sudah memiliki signature kriptografis dan riwayat verifikasi."
                state={state}
                setState={setState}
                toast={toast}
                getData={getData}
            />
        </div>
    );
};

export default Page;
