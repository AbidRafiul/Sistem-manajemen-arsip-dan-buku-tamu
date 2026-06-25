import { FilterMatchMode } from 'primereact/api';
import { FormikProps } from 'formik';
import { Session } from 'next-auth';
import { Toast } from 'primereact/toast';
import { RefObject } from 'react';

export type IncomingLetterStatus = 'baru' | 'diproses' | 'didisposisi' | 'selesai';

export interface initValue {
    incoming_letter_id: number | null;
    agenda_number: string;
    letter_number: string;
    letter_date: string;
    received_date: string;
    sender_name: string;
    sender_institution: string;
    subject: string;
    attachment_description: string;
    letter_file: File | null;
    letter_type_id: number | null;
    document_type_id: number | null;
    archive_classification_id: number | null;
    confidentiality_level_id: number | null;
    status: IncomingLetterStatus | string;
    created_by: number | null;
    updated_by: number | null;
}

export interface TableData {
    incoming_letter_id: number;
    agenda_number: string;
    letter_number: string;
    letter_date: string;
    received_date: string;
    sender_name: string;
    sender_institution: string | null;
    subject: string;
    attachment_description: string | null;
    letter_type_id: number | null;
    letter_type_name: string | null;
    document_type_id: number | null;
    archive_classification_id: number | null;
    confidentiality_level_id: number | null;
    status: IncomingLetterStatus | string;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
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
    disid_jabatan: number;
    incoming_letter_id: number;
    parent_disid_jabatan: number | null;
    from_id_pengguna: number | null;
    to_id_pengguna: number | null;
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
    disid_jabatan: number | null;
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
