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
            document_id: null,
            document_name: '',
            document_number: '',
            document_date: '',
            expired_date: '',
            pic_name: '',
        },
        validate: (data: initValue) => {
            const errors = {} as initValue;

            if (!data.document_name) {
                errors.document_name = 'Document name wajib diisi';
            }

            if (!data.document_number) {
                errors.document_number = 'Document number wajib diisi';
            }

            if (!data.document_date) {
                errors.document_date = 'Document date wajib diisi';
            }

            if (!data.pic_name) {
                errors.pic_name = 'PIC wajib diisi';
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

    const getDocumentDetail = async (documentId: number) => {
        setState((p) => ({ ...p, detailLoad: true }));
        try {
            const res = await getData(apiEndpointDocumentDetail, { document_id: documentId });
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
                document_id: input.document_id,
                document_name: input.document_name,
                document_number: input.document_number,
                document_date: input.document_date,
                expired_date: input.expired_date,
                pic_name: input.pic_name,
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

            const vaDocumentId = state.selectedDocuments.map((oDocument) => oDocument.document_id);
            const res = await postData(apiEndpointDocumentDelete, {
                document_id: vaDocumentId,
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

    const uploadVersion = async (documentId: number, changeNotes: string, file: File) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const formData = new FormData();
            formData.append("document_id", String(documentId));
            formData.append("change_notes", changeNotes);
            formData.append("file", file);

            const res = await formUpload(apiEndpointVersionUpload, formData, {});
            showSuccess(toast, res.data?.message || 'Versi dokumen berhasil diupload');
            await getDocumentDetail(documentId);
            await getDocuments();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengupload versi dokumen');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const downloadVersion = async (versionId: number, fileName: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await fileDownload(apiEndpointVersionDownload, { version_id: versionId });
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

    const rollbackVersion = async (documentId: number, versionId: number) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpointVersionRollback, { document_id: documentId, version_id: versionId });
            showSuccess(toast, res.data?.message || 'Rollback versi berhasil');
            await getDocuments();
            await getDocumentDetail(documentId);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal melakukan rollback');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const approveVersion = async (versionId: number, status: 'approved' | 'rejected', notes?: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiEndpointVersionApprove, {
                version_id: versionId,
                status: status,
                approval_notes: notes || ''
            });
            showSuccess(toast, res.data?.message || `Berhasil mengubah status versi menjadi ${status}`);
            if (state.detailData?.document?.document_id) {
                await getDocumentDetail(state.detailData.document.document_id);
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
