'use client'

import getDataRequest from "@/lib/axios/getData";
import formUpload from "@/lib/axios/formData";
import postData from "@/lib/axios/postData";
import putData from "@/lib/axios/putData";
import axios from "axios";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Table from "./components/display/table";
import { initValue, State, TableData } from "./components/interfaces";
import { mapOutgoingLetterRow } from "./components/mappers";
import {
    apiEndpointCreate,
    apiEndpointDocumentDownload,
    apiEndpointExtractOcr,
    apiEndpointLetterTypeManagement,
    apiEndpointNumberingPreview,
    apiEndpointTemplateSurat,
    apiEndpointUpdate,
    apiEndpointUpload,
    apiEndpointDetail,
    apiEndpointDelete,
    apiEndpointArchive,
    apiEndpointGet
} from "./components/endpoints";

const initialValues: initValue = {
    id_surat_keluar: null,
    nomor_surat: "",
    nomor_agenda: "",
    tanggal_surat: "",
    tanggal_kirim: "",
    id_jenis_surat: null,
    perihal: "",
    tujuan: "",
    instansi_tujuan: "",
    media_pengiriman: "",
    id_template: null,
    isi_surat: "",
    isi_surat_final: "",
    nama_pengirim: "",
    jabatan: "",
    status: "menunggu_approval",
    file_surat: null,
    created_by: null,
    updated_by: null,
};

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<State>({
        load: false,
        detail: false,
        detailLoad: false,
        detailData: null,
        data: [],
        add: false,
        edit: false,
        delete: false,
        selectedLetters: [],
        searchVal: "",
        statusFilter: "",
        jenisSuratFilter: null,
        tanggalMulai: "",
        tanggalAkhir: "",
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
        submittedData: null,
    });

    const formik = useFormik({
        initialValues,
        validate: (data: initValue) => {
            const errors = {} as Partial<Record<keyof initValue, string>>;

            if (!data.nomor_surat) errors.nomor_surat = "Nomor surat wajib diisi";
            if (!data.tanggal_surat) errors.tanggal_surat = "Tanggal surat wajib diisi";
            if (!data.perihal) errors.perihal = "Perihal wajib diisi";
            if (!data.tujuan) errors.tujuan = "Tujuan wajib diisi";
            if (!data.id_jenis_surat) errors.id_jenis_surat = "Jenis surat wajib dipilih";
            if (state.edit && !data.id_surat_keluar) errors.id_surat_keluar = "ID surat keluar wajib diisi";

            return errors;
        },
        onSubmit: (data) => {
            setState((p) => ({ ...p, submittedData: data }));
        },
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const res = await getDataRequest(apiEndpoint, payload);
            setState((p) => ({
                ...p,
                data: (res.data?.data || []).map(mapOutgoingLetterRow),
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data surat keluar gagal diambil");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({
                ...prev,
                session,
            }));
        }
    }, [session]);

    const reloadDetail = async (idSuratKeluar: number) => {
        try {
            const res = await getDataRequest(`${apiEndpointDetail}/${idSuratKeluar}`);
            setState((p) => ({ ...p, detailData: res.data?.data || null }));
        } catch (error: any) {
            console.error("Gagal reload detail:", error);
            showError(toast, error?.response?.data?.message || "Detail surat gagal diambil");
            setState((p) => ({ ...p, detail: false, detailData: null }));
        }
    };

    const handleDeleteLetter = async (letters: TableData[]) => {
        setState((p) => ({ ...p, load: true }));
        try {
            for (const letter of letters) {
                await postData(`${apiEndpointDelete}/${letter.id_surat_keluar}`, {});
            }
            showSuccess(toast, "Surat berhasil dihapus");
            getData(apiEndpointGet, { sort_by: "created_at", sort_order: "desc", limit: 100 });
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || "Surat gagal dihapus");
        } finally {
            setState((p) => ({ ...p, load: false, selectedLetters: [], delete: false }));
        }
    };

    const handleFileUpload = async (file: File, idSuratKeluar: number, uploadedBy: number | null) => {
        const formData = new FormData();
        formData.append("file_surat", file);
        formData.append("uploaded_by", String(uploadedBy || ""));
        formData.append("id_surat_keluar", String(idSuratKeluar));
        
        await apiUploadPdf(idSuratKeluar, formData);
    };

    const executeArchiveLetter = async (idSuratKeluar: number, pic: string, createdBy: number | null) => {
        await postData(apiEndpointArchive, {
            id_surat_keluar: idSuratKeluar,
            nama_pic: pic,
            created_by: createdBy
        });
    };

    const apiSaveLetter = async (payload: any, isEdit: boolean, idSuratKeluar: number | null) => {
        if (isEdit) {
            return await putData(`${apiEndpointUpdate}/${idSuratKeluar}`, payload);
        }
        return await postData(apiEndpointCreate, payload);
    };

    const apiUploadPdf = async (idSuratKeluar: number, formData: FormData) => {
        return await formUpload(apiEndpointUpload, formData, {});
    };

    const apiDownloadDocx = async (idSuratKeluar: number, headers: any) => {
        const endpoint = `${apiEndpointDocumentDownload}/${idSuratKeluar}`;
        const INTERCEPTOR_BASE_URL = process.env.NEXT_PUBLIC_API_DIR_PATH || "/api/interceptor";
        
        return await axios.get(INTERCEPTOR_BASE_URL, {
            responseType: "blob",
            headers: {
                "X-ENDPOINT": endpoint,
                "x-response-type": "blob",
                "x-custom-header": JSON.stringify(headers),
            },
        });
    };

    const apiExtractOcr = async (formData: FormData) => {
        return await formUpload(apiEndpointExtractOcr, formData, {});
    };

    const apiGetLetterTypes = async () => {
        const res = await getDataRequest(apiEndpointLetterTypeManagement);
        return res.data?.data || [];
    };

    const apiGetTemplates = async () => {
        const res = await getDataRequest(apiEndpointTemplateSurat);
        return res.data?.data || [];
    };

    const apiGetNomorPreview = async (payload: any) => {
        const res = await postData(apiEndpointNumberingPreview, payload);
        return res.data?.data?.nomor_surat || "";
    };

    const apiGetConfig = async (payload: any) => {
        try {
            const extendedPayload = {
                kode: [...(payload.kode || []), "msEmailPerusahaan", "msWebsitePerusahaan"]
            };
            const res = await postData("/setup/config-data", extendedPayload);
            return res.data?.data || {};
        } catch (error) {
            console.error("Gagal mengambil konfigurasi:", error);
            return {};
        }
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <Table 
                getData={getData} 
                state={state} 
                setState={setState} 
                formik={formik} 
                toast={toast} 
                apiSaveLetter={apiSaveLetter}
                apiUploadPdf={apiUploadPdf}
                apiDownloadDocx={apiDownloadDocx}
                apiExtractOcr={apiExtractOcr}
                apiGetLetterTypes={apiGetLetterTypes}
                apiGetTemplates={apiGetTemplates}
                apiGetNomorPreview={apiGetNomorPreview}
                apiGetConfig={apiGetConfig}
                reloadDetail={reloadDetail}
                handleDeleteLetter={handleDeleteLetter}
                handleFileUpload={handleFileUpload}
                executeArchiveLetter={executeArchiveLetter} />
        </>
    );
};

export default Page;
