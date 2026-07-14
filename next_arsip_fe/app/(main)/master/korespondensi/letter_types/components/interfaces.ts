import { FilterMatchMode } from 'primereact/api';

export interface initValue {
    jenis_surat_id: string | number;
    kode_jenis_surat: string;
    nama_jenis_surat: string;
    arah_surat: string;
    deskripsi: string;
    status: string;
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
