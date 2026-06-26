import { initValue, TableData } from "./interfaces";

export const mapIncomingLetterRow = (row: Record<string, any>): TableData => ({
    surat_masuk_id: row.surat_masuk_id || 0,
    nomor_agenda: row.nomor_agenda || "",
    nomor_surat: row.nomor_surat || "",
    tanggal_surat: row.tanggal_surat || "",
    tanggal_diterima: row.tanggal_diterima || "",
    nama_pengirim: row.nama_pengirim || "",
    instansi_pengirim: row.instansi_pengirim || null,
    perihal: row.perihal || "",
    keterangan_lampiran: row.keterangan_lampiran || null,
    jenis_surat_id: row.jenis_surat_id || null,
    nama_jenis_surat: row.nama_jenis_surat || null,
    jenis_dokumen_id: row.jenis_dokumen_id || null,
    archive_classification_id: row.archive_classification_id || row.klasifikasi_arsip_id || null,
    confidentiality_level_id: row.confidentiality_level_id || row.tingkat_kerahasiaan_id || null,
    status: row.status || "baru",
    created_by: row.created_by || null,
    updated_by: row.updated_by || null,
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
});

export const mapIncomingLetterPayload = (input: initValue, isEdit: boolean) => {
    const nullableNumber = (value: number | null) => value || null;

    const payload: Record<string, any> = {
        nomor_agenda: input.nomor_agenda,
        nomor_surat: input.nomor_surat,
        tanggal_surat: input.tanggal_surat,
        tanggal_diterima: input.tanggal_diterima,
        nama_pengirim: input.nama_pengirim,
        instansi_pengirim: input.instansi_pengirim || null,
        perihal: input.perihal,
        keterangan_lampiran: input.keterangan_lampiran || null,
        jenis_surat_id: nullableNumber(input.jenis_surat_id),
        jenis_dokumen_id: nullableNumber(input.jenis_dokumen_id),
        archive_classification_id: nullableNumber(input.archive_classification_id),
        confidentiality_level_id: nullableNumber(input.confidentiality_level_id),
        updated_by: nullableNumber(input.updated_by),
    };

    if (isEdit) {
        payload.surat_masuk_id = input.surat_masuk_id;
        payload.status = input.status;
    } else {
        payload.created_by = nullableNumber(input.created_by);
    }

    return payload;
};
