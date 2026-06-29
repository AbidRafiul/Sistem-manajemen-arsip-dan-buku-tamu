'use client'

import getData from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import formUpload from "@/lib/axios/formData";
import fileDownload from "@/lib/axios/fileDownload";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Table from "./components/display/table";
import {
    apiEndpointDocumentCreate,
    apiEndpointDocumentDelete,
    apiEndpointDocumentDetail,
    apiEndpointDocumentGet,
    apiEndpointDocumentUpdate,
    apiEndpointVersionUpload,
    apiEndpointVersionDownload,
    apiEndpointVersionRollback,
    apiEndpointVersionApprove
} from "./components/endpoints";
import { initValue, State } from "./components/interfaces";

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<State>({
        load: false,
        detailLoad: false,
        data: [],
        add: false,
        edit: false,
        delete: false,
        detail: false,
        detailData: null,
        selectedDocuments: [],
        searchVal: '',
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
        submittedData: null,
    });

    const formik = useFormik<initValue>({
        initialValues: {
            id_dokumen: null,
            nama_dokumen: '',
            nomor_dokumen: '',
            tanggal: '',
            tanggal_kedaluwarsa: '',
            nama_pic: '',
        },
        validate: (data: initValue) => {
            const errors = {} as any;

            if (!data.nama_dokumen) {
                errors.nama_dokumen = 'Nama dokumen wajib diisi';
            }

            if (!data.nomor_dokumen) {
                errors.nomor_dokumen = 'Nomor dokumen wajib diisi';
            }

            if (!data.tanggal) {
                errors.tanggal = 'Tanggal dokumen wajib diisi';
            }

            if (!data.nama_pic) {
                errors.nama_pic = 'PIC wajib diisi';
            }

            return errors;
        },
        onSubmit: (data) => {
            setState(p => ({ ...p, submittedData: data }));
        },
    });

    const getDocuments = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getData(apiEndpointDocumentGet);
            setState((p) => ({
                ...p,
                data: res.data.data || []
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const getDocumentDetail = async (idDokumen: number) => {
        setState((p) => ({ ...p, detailLoad: true }));
        try {
            const res = await getData(apiEndpointDocumentDetail, { id_dokumen: idDokumen });
            setState((p) => ({
                ...p,
                detail: true,
                detailData: res.data.data || null
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, detailLoad: false }));
        }
    };

    const saveDocument = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const isEdit = Boolean(state.edit);
            const cEndpoint = isEdit ? apiEndpointDocumentUpdate : apiEndpointDocumentCreate;

            const res = await postData(cEndpoint, {
                id_dokumen: input.id_dokumen,
                nama_dokumen: input.nama_dokumen,
                nomor_dokumen: input.nomor_dokumen,
                tanggal: input.tanggal,
                tanggal_kedaluwarsa: input.tanggal_kedaluwarsa,
                nama_pic: input.nama_pic,
            });

            showSuccess(toast, res.data?.message || 'Document berhasil disimpan');
            formik.resetForm();
            setState((p) => ({ ...p, add: false, edit: false, submittedData: null }));
            await getDocuments();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    const deleteDocuments = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            if (state.selectedDocuments.length < 1) {
                showError(toast, 'Tidak ada dokumen yang dipilih');
                return;
            }

            const vaDocumentId = state.selectedDocuments.map((oDocument) => oDocument.id_dokumen);
            const res = await postData(apiEndpointDocumentDelete, {
                id_dokumen: vaDocumentId,
            });

            showSuccess(toast, res.data?.message || 'Document berhasil dihapus');
            setState((p) => ({ ...p, delete: false, selectedDocuments: [] }));
            await getDocuments();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Terjadi Kesalahan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const uploadVersion = async (idDokumen: number, changeNotes: string, file: File) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const formData = new FormData();
            formData.append("id_dokumen", String(idDokumen));
            formData.append("catatan_perubahan", changeNotes);
            formData.append("file", file);

            const res = await formUpload(apiEndpointVersionUpload, formData, {});
            showSuccess(toast, res.data?.message || 'Versi dokumen berhasil diupload');
            await getDocumentDetail(idDokumen);
            await getDocuments();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengupload versi dokumen');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const downloadVersion = async (idVersi: number, fileName: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await fileDownload(apiEndpointVersionDownload, { id_versi: idVersi });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showSuccess(toast, 'File berhasil diunduh');
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengunduh file');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const rollbackVersion = async (idDokumen: number, idVersi: number) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpointVersionRollback, { id_dokumen: idDokumen, id_versi: idVersi });
            showSuccess(toast, res.data?.message || 'Rollback versi berhasil');
            await getDocuments();
            await getDocumentDetail(idDokumen);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal melakukan rollback');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const approveVersion = async (idVersi: number, status: 'approved' | 'rejected', notes?: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpointVersionApprove, {
                id_versi: idVersi,
                status: status,
                catatan_persetujuan: notes || ''
            });
            showSuccess(toast, res.data?.message || `Berhasil mengubah status versi menjadi ${status}`);
            if (state.detailData?.document?.id_dokumen) {
                await getDocumentDetail(state.detailData.document.id_dokumen);
            }
            await getDocuments();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengubah status approval');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({
                ...prev,
                session: session
            }));
        }
    }, [session]);

    useEffect(() => {
        if (state.submittedData) {
            saveDocument(state.submittedData);
        }
    }, [state.submittedData]);

    return <>
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Table
                getDocuments={getDocuments}
                getDocumentDetail={getDocumentDetail}
                deleteDocuments={deleteDocuments}
                uploadVersion={uploadVersion}
                downloadVersion={downloadVersion}
                rollbackVersion={rollbackVersion}
                approveVersion={approveVersion}
                state={state}
                setState={setState}
                formik={formik}
                toast={toast}
            />
        </div>
    </>
}

export default Page
