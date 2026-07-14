import { FormikProps } from 'formik';

export interface initValue {
    id_jadwal_retensi?: string | number;
    kode_kategori_dokumen: string;
    kode_retensi: string;
    nama_retensi: string;
    tahun_retensi: number | '';
    tindakan_retensi: string;
    deskripsi: string;
    status: 'active' | 'nonactive';
}

export interface State {
    load: boolean;
    data: any[];
    categories: any[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    selectedData: any[];
    searchVal: string;
    filters: any;
    session: any;
}

export interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
    handleDelete: () => Promise<void>;
    getData: (endpoint: string) => Promise<void>;
    toast: React.RefObject<any>;
}

export interface FormProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
}
