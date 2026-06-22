import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface initValue {
    document_id: number | null
    document_name: string
    document_number: string
    document_date: string
    expired_date: string
    pic_name: string
}

export interface DocumentData {
    document_id: number
    archive_classification_id?: number | null
    document_name: string
    document_number: string
    document_date: string
    expired_date: string
    pic_name: string
    status: string
    created_at: string
    updated_at: string
    document_type_id?: number | null
    document_type_name?: string | null
    document_category_id?: number | null
    document_category_name?: string | null
    classification_name?: string | null
    confidentiality_level_id?: number | null
    confidentiality_level_name?: string | null
    confidentiality_level?: number | null
    retention_schedule_id?: number | null
    retention_name?: string | null
    retention_years?: number | null
}

export interface VersionData {
    version_id: number
    document_id: number
    version_number: number
    change_notes: string
    file_path: string
    uploaded_by?: string | null
    approval_status?: string
    approved_by?: string | null
    approved_at?: string | null
    approval_notes?: string | null
    created_at: string
    updated_at: string
}

export interface LoanData {
    loan_id: number
    document_id: number
    borrower_name: string
    loan_date: string
    return_date: string
    purpose: string
    status: string
    created_at: string
    updated_at: string
}

export interface DetailData {
    document: DocumentData | null
    versions: VersionData[]
    loans: LoanData[]
}

export interface State {
    load: boolean;
    detailLoad: boolean;
    data: DocumentData[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    detail: boolean;
    detailData: DetailData | null;
    selectedDocuments: DocumentData[];
    searchVal: string;
    filters: {
        global: {
            value: string | null;
            matchMode: FilterMatchMode;
        };
    };
    session: Session | null
    submittedData: initValue | null
}

export interface TableProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    getDocuments: () => Promise<void>;
    getDocumentDetail: (documentId: number) => Promise<void>;
    deleteDocuments: () => Promise<void>;
    uploadVersion: (documentId: number, changeNotes: string, file: File) => Promise<void>;
    downloadVersion: (versionId: number, fileName: string) => Promise<void>;
    rollbackVersion: (documentId: number, versionId: number) => Promise<void>;
    approveVersion: (versionId: number, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
    toast: RefObject<Toast>
}

export interface FormProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    toast: RefObject<Toast>
}
