import { FilterMatchMode } from "primereact/api";
import { AppMenuItem, MenuModel, UserRole } from "@/types/layout"
import { FormikProps } from "formik"
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";
import { DataRekap } from "@/types/print-tools";


export interface initValue {
    UniqueId: string
    Fullname: string
    Username: string
    Password: string
    Telp: string
    Status: '0' | '1',
    Role: UserRole,
}

export interface NavState {

}

export interface TableData {
    UniqueId: string
    Fullname: string
    Username: string
    Password: string
    Telp: string
    Status: '0' | '1',
    Role: UserRole,
    CreatedAt: Date
}

export interface NavState {
    uniqueId: string
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
    getNav?: (uniqueId: string) => Promise<void>;
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