'use client'

import getDataRequest from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import putData from "@/lib/axios/putData";
import deleteData from "@/lib/axios/deleteData";
import formUpload from "@/lib/axios/formData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import axios from "axios";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Table from "./components/display/table";
import {
    apiEndpointCreate,
    apiEndpointDocumentDownload,
    apiEndpointGet,
    apiEndpointLetterTypeManagement,
    apiEndpointNumberingPreview,
    apiEndpointTemplateSurat,
    apiEndpointUpdate,
    apiEndpointUpload,
    apiEndpointArchive,
    apiEndpointDelete,
    apiEndpointDetail
} from "./components/endpoints";
import { initValue, State } from "./components/interfaces";
import { mapOutgoingLetterRow, mapOutgoingLetterPayload } from "./components/mappers";
import { buildFinalLetterText } from "./components/display/form";

const INTERCEPTOR_BASE_URL = process.env.NEXT_PUBLIC_API_DIR_PATH || "/api/interceptor";

const getFilenameFromDisposition = (disposition?: string) => {
    if (!disposition) return "";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match && utf8Match[1]) return decodeURIComponent(utf8Match[1]);
    const regularMatch = disposition.match(/filename="?([^"]+)"?/i);
    return regularMatch?.[1] || "";
};

const getFilterHeaders = () => {
    try {
        const idOrganisasi = localStorage.getItem("id_organisasi");
        const idUnitKerja = localStorage.getItem("id_unit_kerja");
        return {
            "x-id-organisasi": idOrganisasi || "",
            "x-id-unit-kerja": idUnitKerja || "",
        };
    } catch {
        return { "x-id-organisasi": "", "x-id-unit-kerja": "" };
    }
};

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
    status: "draft",
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
        config: {
            COMPANY_NAME: "",
            COMPANY_ADDRESS: "",
            COMPANY_CONTACT: "",
            COMPANY_LICENSE: "",
            COMPANY_LOGO: ""
        }
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
            const [res, logo, nama, alamat, telepon, izin] = await Promise.all([
                getDataRequest(apiEndpoint, payload),
                postData("/function/db-config", { Key: "msLogoPerusahaan" }),
                postData("/function/db-config", { Key: "msNamaPerusahaan" }),
                postData("/function/db-config", { Key: "msAlamatPerusahaan" }),
                postData("/function/db-config", { Key: "msTeleponPerusahaan" }),
                postData("/function/db-config", { Key: "msIzinPerusahaan" }),
            ]);
            setState((p) => ({
                ...p,
                data: (res.data?.data || []).map(mapOutgoingLetterRow),
                config: {
                    COMPANY_LOGO: logo.data?.data || "",
                    COMPANY_NAME: nama.data?.data || "PT. MARSTECH GLOBAL",
                    COMPANY_ADDRESS: alamat.data?.data || "JL. MARGATAMA ASRI IV NO. 3 KANIGORO, KARTOHARJO, MADIUN, JAWA TIMUR",
                    COMPANY_CONTACT: telepon.data?.data || "Telp. 0351-2812555 E-mail. info@marstech.co.id web. www.marstech.co.id",
                    COMPANY_LICENSE: izin.data?.data || "SIUP : 503.4/ 29 - MIKRO/ 401.106/ 2018 TDP : 13.13.1.47.00655"
                }
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data surat keluar gagal diambil");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const handleSave = async (input: initValue) => {
        try {
            const isEdit = Boolean(state.edit);
            const isiSuratFinal = buildFinalLetterText(input);
            const userId = (state.session?.user as any)?.IdPengguna || (state.session?.user as any)?.id || null;
            const payload = mapOutgoingLetterPayload(
                {
                    ...input,
                    isi_surat_final: isiSuratFinal,
                    created_by: input.created_by || userId,
                    updated_by: userId,
                },
                isEdit
            );

            const response = isEdit
                ? await putData(`${apiEndpointUpdate}/${input.id_surat_keluar}`, payload)
                : await postData(apiEndpointCreate, payload);

            showSuccess(toast, response.data?.message || "Surat keluar berhasil disimpan");
            formik.resetForm();
            setState((p) => ({
                ...p,
                add: false,
                edit: false,
                detail: false,
                detailData: null,
                selectedLetters: [],
            }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Surat keluar gagal disimpan");
            throw error;
        }
    };

    const downloadDocx = async (idSuratKeluar: number, nomorSurat: string) => {
        try {
            const endpoint = `${apiEndpointDocumentDownload}/${idSuratKeluar}`;
            const response = await axios.get(INTERCEPTOR_BASE_URL, {
                responseType: "blob",
                headers: {
                    "X-ENDPOINT": endpoint,
                    "x-response-type": "blob",
                    "x-custom-header": JSON.stringify({
                        "X-Level": "1",
                        ...getFilterHeaders(),
                    }),
                },
            });

            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            const url = URL.createObjectURL(blob);
            const filename =
                getFilenameFromDisposition(response.headers["content-disposition"]) ||
                `${String(nomorSurat || "surat-keluar").replace(/[^\w.-]+/g, "_")}.docx`;
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error: any) {
            let message = error?.response?.data?.message || error?.message || "Dokumen gagal diunduh";

            if (error?.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const parsed = JSON.parse(text);
                    message = parsed?.message || message;
                } catch {
                    message = "Dokumen gagal diunduh";
                }
            }

            showError(toast, message);
        }
    };

    const getLetterTypeOptions = async () => {
        try {
            const res = await getDataRequest(apiEndpointLetterTypeManagement);
            return res.data?.data || [];
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Jenis surat gagal diambil");
            return [];
        }
    };

    const getTemplateOptions = async () => {
        try {
            const res = await getDataRequest(apiEndpointTemplateSurat);
            return (res.data?.data || [])
                .map((item: any) => ({
                    ...item,
                    id_template: item.id_template || item.id,
                }))
                .filter((item: any) => item.status === "active");
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Template surat gagal diambil");
            return [];
        }
    };

    const loadNomorPreview = async (idJenisSurat: number, tanggalSurat: string, currentUnitKerjaId: number | null) => {
        try {
            const res = await postData(apiEndpointNumberingPreview, {
                jenis_surat_id: idJenisSurat,
                tanggal_surat: tanggalSurat,
                id_unit_kerja: currentUnitKerjaId,
            });
            return res.data?.data?.nomor_surat || null;
        } catch (error: any) {
            throw error;
        }
    };

    const getUploadErrorMessage = (error: any) => {
        const response = error?.response?.data || error;
        const detail = String(response?.error || response?.message || "");

        if (/ECONNREFUSED.*127\.0\.0\.1:9000/i.test(detail) || /ECONNREFUSED.*9000/i.test(detail)) {
            return "File gagal diunggah karena server penyimpanan lampiran (MinIO) belum aktif.";
        }
        return response?.message || "File gagal diunggah";
    };

    const handleFileUpload = async (file: File, idSuratKeluar: number, uploadedBy: number | null) => {
        const formData = new FormData();
        formData.append("id_surat_keluar", String(idSuratKeluar));
        formData.append("File", file);
        if (uploadedBy) formData.append("uploaded_by", String(uploadedBy));

        try {
            await formUpload(apiEndpointUpload, formData, {});
            showSuccess(toast, "File berhasil diunggah");
        } catch (error: any) {
            showError(toast, getUploadErrorMessage(error));
            throw error;
        }
    };

    const executeArchiveLetter = async (idSuratKeluar: number, pic: string, createdBy: number | null) => {
        try {
            const res = await postData(apiEndpointArchive, {
                id_surat_keluar: idSuratKeluar,
                nama_pic: pic,
                created_by: createdBy,
            });
            showSuccess(toast, res.data?.message || "Surat keluar berhasil diarsipkan");
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Surat keluar gagal diarsipkan");
            throw error;
        }
    };

    const reloadDetail = async (idSuratKeluar: number) => {
        try {
            const res = await getDataRequest(`${apiEndpointDetail}/${idSuratKeluar}`);
            setState((p) => ({ ...p, detailData: res.data?.data || null }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Gagal memuat ulang detail surat");
        }
    };

    const handleDeleteLetter = async (letters: any[]) => {
        try {
            for (const letter of letters) {
                const userId = (state.session?.user as any)?.IdPengguna || (state.session?.user as any)?.id || null;
                await deleteData(`${apiEndpointDelete}/${letter.id_surat_keluar}`, {
                    updated_by: userId,
                });
            }
            showSuccess(toast, "Surat keluar berhasil dihapus");
            setState((p) => ({ ...p, selectedLetters: [] }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Surat keluar gagal dihapus");
            throw error;
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

    return (
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Table 
                getData={getData} 
                state={state} 
                setState={setState} 
                formik={formik} 
                toast={toast} 
                handleSave={handleSave}
                downloadDocx={downloadDocx}
                getLetterTypeOptions={getLetterTypeOptions}
                getTemplateOptions={getTemplateOptions}
                loadNomorPreview={loadNomorPreview}
                handleFileUpload={handleFileUpload}
                executeArchiveLetter={executeArchiveLetter}
                reloadDetail={reloadDetail}
                handleDeleteLetter={handleDeleteLetter}
            />
        </div>
    );
};

export default Page;
