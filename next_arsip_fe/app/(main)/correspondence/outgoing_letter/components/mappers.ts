import { initValue, TableData } from './interfaces';

export const mapOutgoingLetterRow = (row: Record<string, any>): TableData => ({
    id_surat_keluar: row.id_surat_keluar || 0,
    nomor_surat: row.nomor_surat || '',
    nomor_agenda: row.nomor_agenda || '',
    tanggal_surat: row.tanggal_surat || '',
    tanggal_kirim: row.tanggal_kirim || null,
    id_jenis_surat: row.id_jenis_surat || null,
    nama_jenis_surat: row.nama_jenis_surat || null,
    perihal: row.perihal || '',
    tujuan: row.tujuan || '',
    instansi_tujuan: row.instansi_tujuan || null,
    media_pengiriman: row.media_pengiriman || null,
    id_template: row.id_template || null,
    nama_template: row.nama_template || null,
    nama_file: row.nama_file || null,
    mime_type: row.mime_type || null,
    ukuran_file: row.ukuran_file || null,
    tanggal_upload: row.tanggal_upload || null,
    path_file: row.path_file || null,
    isi_surat: row.isi_surat || null,
    isi_surat_final: row.isi_surat_final || null,
    nama_pengirim: row.nama_pengirim || null,
    jabatan: row.jabatan || null,
    status: row.status || 'draft',
    created_by: row.created_by || null,
    updated_by: row.updated_by || null,
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
});

export const mapOutgoingLetterPayload = (input: initValue, isEdit: boolean) => {
    const nullableNumber = (value: number | null) => value || null;

    const payload: Record<string, any> = {
        nomor_surat: input.nomor_surat,
        tanggal_surat: input.tanggal_surat,
        tanggal_kirim: input.tanggal_kirim || null,
        id_jenis_surat: nullableNumber(input.id_jenis_surat),
        perihal: input.perihal,
        tujuan: input.tujuan,
        instansi_tujuan: input.instansi_tujuan || null,
        media_pengiriman: input.media_pengiriman || null,
        id_template: nullableNumber(input.id_template),
        isi_surat_final: input.isi_surat_final || null,
        nama_pengirim: input.nama_pengirim || null,
        jabatan: input.jabatan || null,
        status: input.status || 'draft',
    };

    if (isEdit) {
        payload.id_surat_keluar = input.id_surat_keluar;
        payload.nomor_agenda = input.nomor_agenda;
        payload.updated_by = nullableNumber(input.updated_by);
    } else {
        payload.created_by = nullableNumber(input.created_by);
    }

    return payload;
};
