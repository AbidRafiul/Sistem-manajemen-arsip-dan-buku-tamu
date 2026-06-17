import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface initValue {
    DocumentId: number | null
    DocumentName: string
    DocumentNumber: string
    DocumentDate: string
    ExpiredDate: string
    PicName: string
}

export interface DocumentData {
    DocumentId: number
    ArchiveClassificationId?: number | null
    DocumentName: string
    DocumentNumber: string
    DocumentDate: string
    ExpiredDate: string
    PicName: string
    Status: string
    CreatedAt: string
    UpdatedAt: string
}

export interface VersionData {
    VersionId: number
    DocumentId: number
    VersionNumber: number
    ChangeNotes: string
    FilePath: string
    UploadedBy?: string | null
    ApprovalStatus?: string
    ApprovedBy?: string | null
    ApprovedAt?: string | null
    ApprovalNotes?: string | null
    CreatedAt: string
    UpdatedAt: string
}

export interface LoanData {
    LoanId: number
    DocumentId: number
    BorrowerName: string
    LoanDate: string
    ReturnDate: string
    Purpose: string
    Status: string
    CreatedAt: string
    UpdatedAt: string
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
    getDocumentDetail: (DocumentId: number) => Promise<void>;
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
