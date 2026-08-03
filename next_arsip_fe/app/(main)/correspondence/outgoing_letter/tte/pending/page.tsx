'use client';

import getDataRequest from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import DocumentTable from "../components/display/document-table";
import { 
    apiEndpointPending, 
    apiEndpointDetail,
    apiEndpointFinalize,
    apiEndpointSign
} from "../components/endpoints";
import { TteState, TteDocumentRow } from "../components/interfaces";

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
            showError(toast, e?.message || "Dokumen menunggu tanda tangan gagal diambil");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const openDetail = async (rowData: TteDocumentRow) => {
        setState((p) => ({ ...p, detail: true, detailLoad: true, detailData: null }));
        try {
            const res = await getDataRequest(`${apiEndpointDetail}/${rowData.id_surat_keluar}/tanda-tangan`);
            const detail = res.data?.data || null;
            setState((p) => ({ ...p, detailData: detail }));
            const firstCert = detail?.certificates?.[0]?.id_sertifikat_elektronik || null;
            return firstCert;
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Detail dokumen gagal diambil");
            setState((p) => ({ ...p, detail: false, detailData: null }));
            return null;
        } finally {
            setState((p) => ({ ...p, detailLoad: false }));
        }
    };

    const finalizeDocument = async (detailLetter: any) => {
        try {
            const res = await postData(`${apiEndpointFinalize}/${detailLetter.id_surat_keluar}/finalisasi`, {
                catatan: "Finalisasi dokumen untuk tanda tangan elektronik",
            });
            showSuccess(toast, res.data?.message || "Dokumen berhasil difinalisasi");
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Dokumen gagal difinalisasi");
            throw error;
        }
    };

    const signDocument = async (detailLetter: any, selectedCertificate: number | null) => {
        try {
            const res = await postData(`${apiEndpointSign}/${detailLetter.id_surat_keluar}/tanda-tangan`, {
                id_sertifikat_elektronik: selectedCertificate,
            });
            showSuccess(toast, res.data?.message || "Dokumen berhasil ditandatangani");
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Dokumen gagal ditandatangani");
            throw error;
        }
    };

    useEffect(() => {
        if (session) setState((p) => ({ ...p, session }));
    }, [session]);

    useEffect(() => {
        getData(apiEndpointPending, { sort_by: "created_at", sort_order: "desc" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <DocumentTable
                mode="pending"
                title="Dokumen Menunggu Tanda Tangan"
                subtitle="Finalisasi PDF dan lakukan tanda tangan elektronik internal untuk surat keluar yang sudah disetujui."
                state={state}
                setState={setState}
                toast={toast}
                openDetail={openDetail}
                finalizeDocument={finalizeDocument}
                signDocument={signDocument}
                getData={getData}
            />
        </div>
    );
};

export default Page;
