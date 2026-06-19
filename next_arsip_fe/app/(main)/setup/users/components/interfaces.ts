import { FilterMatchMode } from "primereact/api";
import { AppMenuItem, MenuModel, UserRole } from "@/types/layout"
import { FormikProps } from "formik"
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";
import { DataRekap } from "@/types/print-tools";

export interface initValue {
    user_id?: string | number;
    fullname: string
    username: string
    password?: string
    telp: string
    status: '0' | '1' | 'active' | 'nonactive',
    role: UserRole | number | string,
    branch_id?: string | number;
    position_id?: string | number;
    division_id?: string | number;
    department_id?: string | number;
    work_unit_id?: string | number;
}

export interface TableData {
    user_id?: string | number;
    fullname: string
    username: string
    password?: string
    telp: string
    status: '0' | '1' | 'active' | 'nonactive',
    role: UserRole | number | string,
    created_at: Date
}

export interface NavState {
    userId: string | number
    load: boolean
    show: boolean
    data: MenuModel[]
    menu: MenuModel[]
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
    state: State
    dataRekap: DataRekap
    setDataRekap: React.Dispatch<React.SetStateAction<DataRekap>>
    formik: FormikProps<initValue>
    setState: React.Dispatch<React.SetStateAction<State>>;
    getData: (apiEndpoint: string) => Promise<void>;
    getNav?: (userId: string | number) => Promise<void>;
    toast: RefObject<Toast>
    navBar?: NavState;
    setNavBar?: React.Dispatch<React.SetStateAction<NavState>>;
}

export interface FormProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    toast: RefObject<Toast>
    getData: (apiEndpoint: string) => Promise<void>;
}

export interface NavbarProps {
    navBar: NavState,
    setNavBar: React.Dispatch<React.SetStateAction<NavState>>;
    handleSaveNavbar: () => Promise<void>;
}

export interface MenuDisplayProps {
    data: AppMenuItem[],
    onEdit: (item: number[]) => void;
}

export interface ListMenuDisplayProps {
    data: AppMenuItem,
    indexPath?: number[];
    onEdit: (item: number[]) => void;
}

export interface RoleColors {
    'superadmin': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    'Pimpinan': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    'Sekretaris': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    'Staff Arsip': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    'Staff Umum': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    'Resepsionis': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
    'Auditor': 'success' | 'info' | 'warning' | 'danger' | null | undefined;
}