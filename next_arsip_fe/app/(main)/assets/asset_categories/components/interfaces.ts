import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik"
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface initValue {
    Code: string
    Name: string
    Description: string
}

export interface TableData {
    Code: string
    Name: string
    Description: string
    CreatedAt: Date
}


export interface State {
    load: boolean;
    data: TableData[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    selectedUsers: TableData[];
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
    toast: RefObject<Toast>
    getData: (apiEndpoint: string) => Promise<void>;
}

export interface FormProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    toast: RefObject<Toast>
    getData: (apiEndpoint: string) => Promise<void>;
}

export interface RoleColors {
    admin: 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    manager: 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    technician: 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    logistics: 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    employee: 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    superadmin: 'success' | 'info' | 'warning' | 'danger' | null | undefined;
}