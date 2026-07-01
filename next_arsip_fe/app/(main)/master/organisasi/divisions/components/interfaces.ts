import { FilterMatchMode } from 'primereact/api';
export interface initValue {
    id_divisi: string | number;
    id_cabang: string | number;
    kode_divisi: string | number;
    nama_divisi: string | number;
    deskripsi: string | number;
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
    masterData: any[];
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
