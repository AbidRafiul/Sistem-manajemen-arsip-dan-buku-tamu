import { FilterMatchMode } from 'primereact/api';
export interface initValue {
    id_cabang: string | number;
    kode_cabang: string | number;
    nama_cabang: string | number;
    id_induk?: number | null;
    nama_induk?: string | null;
    alamat: string | number;
    telepon: string | number;
    surel: string | number;
    status: string | number;
}
export interface State {
    load: boolean;
    data: any[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    selectedData: any[];
    searchVal: string;
    filters: { global: { value: string | null; matchMode: FilterMatchMode } };
    session: any;
}
export interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: any;
    getData: (endpoint: string) => void;
    handleDelete: () => void;
    handleSave: (data: initValue) => void;
    toast: any;
}
