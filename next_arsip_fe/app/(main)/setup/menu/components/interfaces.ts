export interface initValueMenu {
    id_menu?: string | number;
    kode_menu: string;
    nama_menu: string;
    jalur_menu: string;
    ikon_menu: string;
    urutan: number;
    status_aktif: number;
    id_menu_induk?: string | number | null;
    id_peran?: (string | number)[];
}

export interface State {
    load: boolean;
    data: any[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    selectedData: any[];
    searchVal: string;
    filters: any;
    session: any;
    submittedData: any;
    masterData?: any;
}