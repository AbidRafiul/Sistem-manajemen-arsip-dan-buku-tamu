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

export interface State {
    load: boolean;
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
