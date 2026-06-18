import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik"
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";
export interface TableDataDivision {
    Code: string;
    Name: string;
}
import { TableData as TableDataCategory } from '../../../assets/asset_categories/components/interfaces'
export interface initValue {
    Code: string
    Name: string
    Type: string
    Status: StatusType | string
    Location: string
    CategoryCode: string
    DivisionCode: string
}

export interface TableData {
    Code: string
    Name: string
    Status: StatusType | string
    Type: string
    Location: string
    DivisionName: string
    CategoryName: string
    CategoryCode: string
    DivisionCode: string
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
    divisionData: TableDataDivision[]
    categoryData: TableDataCategory[]
}


export interface TableProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    getData: (apiEndpoint: string) => Promise<void>;
    toast: RefObject<Toast>
}

export interface FormProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    toast: RefObject<Toast>
    getData: (apiEndpoint: string) => Promise<void>;
}

export type StatusType = 'operational' | 'maintenance' | 'down';
