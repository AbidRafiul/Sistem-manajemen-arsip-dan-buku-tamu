import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export type IncomingLetterStatus = "baru" | "diproses" | "didisposisi" | "selesai";

export interface initValue {
    IncomingLetterId: number | null;
    AgendaNumber: string;
    LetterNumber: string;
    LetterDate: string;
    ReceivedDate: string;
    SenderName: string;
    SenderInstitution: string;
    Subject: string;
    AttachmentDescription: string;
    LetterFile: File | null;
    LetterTypeId: number | null;
    DocumentTypeId: number | null;
    ArchiveClassificationId: number | null;
    ConfidentialityLevelId: number | null;
    Status: IncomingLetterStatus | string;
    CreatedBy: number | null;
    UpdatedBy: number | null;
}

export interface TableData {
    IncomingLetterId: number;
    AgendaNumber: string;
    LetterNumber: string;
    LetterDate: string;
    ReceivedDate: string;
    SenderName: string;
    SenderInstitution: string | null;
    Subject: string;
    AttachmentDescription: string | null;
    LetterTypeId: number | null;
    LetterTypeName: string | null;
    DocumentTypeId: number | null;
    ArchiveClassificationId: number | null;
    ConfidentialityLevelId: number | null;
    Status: IncomingLetterStatus | string;
    CreatedBy: number | null;
    UpdatedBy: number | null;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface IncomingLetterFile {
    incoming_letter_file_id: number;
    incoming_letter_id: number;
    file_path: string;
    file_name: string | null;
    file_mime_type: string | null;
    file_size: number | null;
    uploaded_by: number | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface IncomingLetterDisposition {
    disposition_id: number;
    incoming_letter_id: number;
    parent_disposition_id: number | null;
    from_user_id: number | null;
    to_user_id: number | null;
    instruction_name: string | null;
    instruction: string | null;
    disposition_note: string | null;
    due_date: string | null;
    status: string;
    created_at: string;
}

export interface IncomingLetterTracking {
    incoming_letter_tracking_id: number;
    incoming_letter_id: number;
    disposition_id: number | null;
    action_name: string;
    previous_status: string | null;
    current_status: string | null;
    notes: string | null;
    processed_at: string;
}

export interface IncomingLetterDetailData {
    letter: Record<string, any> | null;
    files: IncomingLetterFile[];
    dispositions: IncomingLetterDisposition[];
    trackings: IncomingLetterTracking[];
}

export interface State {
    load: boolean;
    detail: boolean;
    detailLoad: boolean;
    detailData: IncomingLetterDetailData | null;
    data: TableData[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    selectedLetters: TableData[];
    searchVal: string;
    statusFilter: string;
    filters: {
        global: {
            value: string | null;
            matchMode: FilterMatchMode;
        };
    };
    session: Session | null;
    submittedData: initValue | null;
}

export interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
    toast: RefObject<Toast>;
}

export interface FormProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
    toast: RefObject<Toast>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
}
