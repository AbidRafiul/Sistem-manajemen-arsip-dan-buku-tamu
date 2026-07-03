import { FilterMatchMode } from 'primereact/api';

export interface initValue {
    id_kategori_dokumen: string | number;
    kode_klasifikasi: string;
    kode_kategori_dokumen: string;
    nama_kategori_dokumen: string;
    deskripsi: string;
    status: string;
}

export interface State {
    load: boolean;
    data: any[];
    classifications: any[];
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
