import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface initValue {
    id_dokumen: number | null
    nama_dokumen: string
    nomor_dokumen: string
    tanggal: string
    tanggal_kedaluwarsa: string
    nama_pic: string
    kode_jenis_dokumen: string
    kode_klasifikasi: string
    kode_kategori_dokumen: string
    kode_tingkat_kerahasiaan: string
    tanggal_transaksi: string
    lokasi_fisik: string
    kode_retensi: string
    file?: File | null
}

export interface DocumentData {
    id_dokumen: number
    kode_dokumen: string
    nama_dokumen: string
    nomor_dokumen: string
    tanggal: string
    tanggal_transaksi?: string | null
    tanggal_kedaluwarsa: string
    nama_pic: string
    lokasi_fisik?: string | null
    status: string
    created_at: string
    updated_at: string
    kode_klasifikasi?: string | null
    nama_klasifikasi?: string | null
    kode_jenis_dokumen?: string | null
    nama_jenis_dokumen?: string | null
    kode_kategori_dokumen?: string | null
    nama_kategori_dokumen?: string | null
    kode_tingkat_kerahasiaan?: string | null
    nama_tingkat_kerahasiaan?: string | null
    tingkat_kerahasiaan?: number | null
    kode_retensi?: string | null
    nama_retensi?: string | null
    tahun_retensi?: number | null
    file_path?: string | null
}

export interface VersionData {
    id_versi: number
    kode_dokumen: string
    nomor_versi: number
    catatan_perubahan: string
    file_path: string
    diunggah_oleh?: string | null
    status_persetujuan?: string
    disetujui_oleh?: string | null
    disetujui_pada?: string | null
    catatan_persetujuan?: string | null
    created_at: string
    updated_at: string
}

export interface LoanData {
    id_peminjaman: number
    kode_dokumen: string
    nama_peminjam: string
    tanggal_pinjam: string
    tanggal_pengembalian: string
    tanggal_kembali: string
    keperluan: string
    status: string
    terlambat: number
    disetujui_oleh?: string | null
    disetujui_pada?: string | null
    catatan_persetujuan?: string | null
    created_at: string
    updated_at: string
}

export interface DetailData {
    document: DocumentData | null
    versions: VersionData[]
    loans: LoanData[]
}

export interface State {
    load: boolean;
    detailLoad: boolean;
    data: DocumentData[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    detail: boolean;
    detailData: DetailData | null;
    selectedDocuments: DocumentData[];
    searchVal: string;
    filters: {
        global: {
            value: string | null;
            matchMode: FilterMatchMode;
        };
    };
    session: Session | null
    submittedData: initValue | null
    previewUrl: string
    isPreviewVisible: boolean
    documentTypes: any[]
    classifications: any[]
    categories: any[]
    confidentialities: any[]
    retentions: any[]
    
    // Filters
    filterClassification?: string
    filterType?: string
    filterCategory?: string
    filterConfidentiality?: string

    // QR & Tracking States
    qrDialog: boolean
    qrData: {
        id_dokumen: number
        nomor_dokumen: string
        nama_dokumen: string
        qr_code: string
        qr_base64: string
    } | null
    qrLoad: boolean

    trackingDialog: boolean
    trackingCode: string
    trackingResult: any | null
    trackingLoad: boolean
    updatingLocation: boolean
}

export interface TableProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    getDocuments: () => Promise<void>;
    getDocumentDetail: (idDokumen: number) => Promise<void>;
    deleteDocuments: () => void;
    uploadVersion: (idDokumen: number, changeNotes: string, file: File) => Promise<void>;
    downloadVersion: (idVersi: number, fileName: string) => Promise<void>;
    rollbackVersion: (idDokumen: number, idVersi: number) => Promise<void>;
    approveVersion: (idVersi: number, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
    handleFetchPreviewUrl: (filePath: string) => void;
    handleGenerateQR: (id: number) => void;
    handleScanQR: (qrCode: string) => void;
    handleUpdateLocation: (id: number, location: string) => void;
    toast: React.RefObject<Toast>;
}

export interface FormProps {
    state: State,
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>
    toast: RefObject<Toast>
}
