import { FilterMatchMode } from 'primereact/api';
export interface initValue {
    id_peran: string | number;
    kode_peran: string | number;
    nama_peran: string | number;
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
    permissionsVisible?: boolean;
    activeRoleForPermissions?: any;
    permissionsNodes?: any[];
    permissionsLoading?: boolean;
    permissionsSaving?: boolean;
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
