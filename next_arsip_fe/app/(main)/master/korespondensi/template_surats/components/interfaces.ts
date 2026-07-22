import { FilterMatchMode } from 'primereact/api';

export interface initValue {
  id?: string | number;
  kode_template: string;
  nama_template: string;
  jenis_surat_id: number | null;
  deskripsi: string;
  isi_template: string;
  status: string;
  created_by?: number | null;
  updated_by?: number | null;
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
  letterTypes: any[];
  previewVisible: boolean;
  previewContent: string;
}

export const initialFilters = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
