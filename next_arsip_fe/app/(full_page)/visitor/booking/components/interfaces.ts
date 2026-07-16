export interface GroupMember {
    name: string;
    phone: string;
    idNumber: string;
    identityFile?: File | null;
}

export interface VisitorBookingFormData {
    nama_tamu: string;
    nomor_telepon: string;
    email_tamu: string;
    instansi_tamu: string;
    jenis_identitas: string | null;
    nomor_identitas: string;
    id_tujuan_kunjungan: string | number | null;
    id_cabang: number | null;
    id_user_host?: number | null;
    nama_host: string;
    catatan_kunjungan: string;
    waktu_masuk: Date | null | undefined;
    visit_type?: 'personal' | 'group';
    guest_count?: number;
    signature_data?: string | null;
    group_members?: GroupMember[];
}
