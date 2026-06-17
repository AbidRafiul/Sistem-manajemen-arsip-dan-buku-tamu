'use client'

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import getData from "@/lib/axios/getData";
import postData from "@/lib/axios/postData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import Table from "./components/display/table";
import {
    apiLoanGet,
    apiLoanCreate,
    apiLoanApprove,
    apiLoanReturn,
    apiDocumentGet
} from "./components/endpoints";
import { initValue, State } from "./components/interfaces";

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<State>({
        load: false,
        data: [],
        documents: [],
        add: false,
        approveDialog: false,
        returnDialog: false,
        selectedLoan: null,
        approvalStatus: '',
        approvalNotes: '',
        session: null,
        submittedData: null,
        searchVal: '',
        activeTab: 'all'
    });

    const formik = useFormik<initValue>({
        initialValues: {
            document_id: null,
            borrower_name: '',
            expected_return_date: '',
            purpose: ''
        },
        validate: (data: initValue) => {
            const errors = {} as any;

            if (!data.document_id) {
                errors.document_id = 'Document wajib dipilih';
            }

            if (!data.borrower_name.trim()) {
                errors.borrower_name = 'Nama peminjam wajib diisi';
            }

            if (!data.expected_return_date) {
                errors.expected_return_date = 'Rencana tanggal pengembalian wajib diisi';
            }

            if (!data.purpose.trim()) {
                errors.purpose = 'Keperluan peminjaman wajib diisi';
            }

            return errors;
        },
        onSubmit: (data) => {
            setState(p => ({ ...p, submittedData: data }));
        },
    });

    const getLoans = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getData(apiLoanGet);
            setState((p) => ({
                ...p,
                data: res.data.data || []
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengambil data peminjaman');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const getDocuments = async () => {
        try {
            const res = await getData(apiDocumentGet);
            setState((p) => ({
                ...p,
                documents: res.data.data || []
            }));
        } catch (error: any) {
            console.error("Gagal mengambil daftar dokumen:", error);
        }
    };

    const createLoan = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiLoanCreate, {
                document_id: input.document_id,
                borrower_name: input.borrower_name,
                expected_return_date: input.expected_return_date,
                purpose: input.purpose,
            });

            showSuccess(toast, res.data?.message || 'Pengajuan peminjaman berhasil diajukan');
            formik.resetForm();
            setState((p) => ({ ...p, add: false, submittedData: null }));
            await getLoans();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal mengajukan peminjaman');
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    const handleApproveReject = async (loanId: number, status: 'approved' | 'rejected', notes: string) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiLoanApprove, {
                loan_id: loanId,
                status: status,
                approval_notes: notes
            });

            showSuccess(toast, res.data?.message || `Peminjaman berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
            await getLoans();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal memproses persetujuan');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    const handleReturn = async (loanId: number) => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await postData(apiLoanReturn, {
                loan_id: loanId
            });

            showSuccess(toast, res.data?.message || 'Dokumen berhasil dikembalikan');
            await getLoans();
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal memproses pengembalian');
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
            getLoans();
            getDocuments();
        }
    }, [session]);

    useEffect(() => {
        if (state.submittedData) {
            createLoan(state.submittedData);
        }
    }, [state.submittedData]);

    return <>
        <div className="p-4">
            <Toast ref={toast} position="top-right" />
            <Table
                getLoans={getLoans}
                handleApproveReject={handleApproveReject}
                handleReturn={handleReturn}
                state={state}
                setState={setState}
                formik={formik}
                toast={toast}
            />
        </div>
    </>
}

export default Page
