import { FilterMatchMode } from "primereact/api";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface TteDocumentRow {
    id_surat_keluar: number;
    nomor_surat: string;
    nomor_agenda: string;
    tanggal_surat: string;
    tanggal_kirim: string | null;
    id_jenis_surat: number | null;
    nama_jenis_surat: string | null;
    perihal: string;
    tujuan: string;
    instansi_tujuan: string | null;
    media_pengiriman: string | null;
    id_template: number | null;
    nama_template: string | null;
    id_cabang: number | null;
    nama_file: string | null;
    mime_type: string | null;
    ukuran_file: number | null;
    tanggal_upload: string | null;
    path_file: string | null;
    file_url: string | null;
    dokumen_tte_url: string | null;
    isi_surat_final: string | null;
    status: string;
    jumlah_tanda_tangan: number | string;
    id_tanda_tangan_terakhir: number | null;
    waktu_tanda_tangan_terakhir: string | null;
    token_verifikasi_terakhir: string | null;
    hash_dokumen_terakhir: string | null;
    id_verifikasi_terakhir: number | null;
    valid_kriptografis_terakhir: boolean | null;
    valid_integritas_terakhir: boolean | null;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface TteSignatureRow {
    id_tanda_tangan_dokumen: number;
    id_surat_keluar: number;
    id_pengguna: number | null;
    id_sertifikat_elektronik: number | null;
    id_versi_dokumen: number | null;
    urutan_tanda_tangan: number;
    nomor_seri_sertifikat: string | null;
    subjek_sertifikat: string | null;
    penerbit_sertifikat: string | null;
    algoritma_tanda_tangan: string | null;
    algoritma_hash: string | null;
    lokasi_dokumen: string;
    hash_dokumen: string;
    token_verifikasi: string | null;
    waktu_tanda_tangan: string;
    status_tanda_tangan: string;
    nama_penanda_tangan?: string | null;
    username_penanda_tangan?: string | null;
    nama_sertifikat?: string | null;
    alias_sertifikat?: string | null;
}

export interface TteVerificationRow {
    id_verifikasi_dokumen: number;
    id_surat_keluar: number;
    id_tanda_tangan_dokumen: number | null;
    token_verifikasi: string | null;
    valid_kriptografis: boolean;
    valid_integritas: boolean;
    valid_sertifikat: boolean;
    sertifikat_dipercaya: boolean;
    sertifikat_dicabut: boolean;
    dokumen_diubah: boolean;
    pesan_verifikasi: string | null;
    diverifikasi_pada: string;
    diverifikasi_oleh: number | null;
    nama_verifikator?: string | null;
    username_verifikator?: string | null;
}

export interface TteCertificateRow {
    id_sertifikat_elektronik: number;
    id_pengguna: number | null;
    nama_pengguna?: string | null;
    username_pengguna?: string | null;
    nama_sertifikat: string;
    alias_sertifikat: string | null;
    nomor_seri: string;
    subjek_sertifikat: string | null;
    penerbit_sertifikat: string | null;
    algoritma_tanda_tangan: string;
    algoritma_hash: string;
    lokasi_keystore: string;
    berlaku_mulai: string | null;
    berlaku_sampai: string | null;
    status_sertifikat: string;
    created_at: string;
    updated_at: string;
}

export interface TtePosition {
    halaman: number;
    posisi_x: number;
    posisi_y: number;
    lebar: number;
    tinggi: number;
}

export interface TteState {
    load: boolean;
    detail: boolean;
    detailLoad: boolean;
    data: TteDocumentRow[];
    detailData: Record<string, any> | null;
    selectedRows: TteDocumentRow[];
    searchVal: string;
    filters: {
        global: {
            value: string | null;
            matchMode: FilterMatchMode;
        };
    };
    session: Session | null;
}

export interface TtePageProps {
    state: TteState;
    setState: React.Dispatch<React.SetStateAction<TteState>>;
    toast: RefObject<Toast>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
}

export interface TteCertificateForm {
    id_sertifikat_elektronik: number | null;
    id_pengguna: number | null;
    nama_sertifikat: string;
    alias_sertifikat: string;
    nomor_seri: string;
    subjek_sertifikat: string;
    penerbit_sertifikat: string;
    algoritma_tanda_tangan: string;
    algoritma_hash: string;
    lokasi_keystore: string;
    berlaku_mulai: string;
    berlaku_sampai: string;
    status_sertifikat: string;
}

export interface TteCertificatePageState {
    load: boolean;
    data: TteCertificateRow[];
    filters: {
        global: {
            value: string | null;
            matchMode: FilterMatchMode;
        };
    };
    searchVal: string;
    dialog: boolean;
    editMode: boolean;
    formData: TteCertificateForm;
    session: Session | null;
}

export interface TteCertificatePageProps {
    state: TteCertificatePageState;
    setState: React.Dispatch<React.SetStateAction<TteCertificatePageState>>;
    toast: RefObject<Toast>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
}
