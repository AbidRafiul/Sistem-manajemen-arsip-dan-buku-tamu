import { v4 as uuidv4 } from "uuid";

/**
 * Seeder untuk menyuplai dummy data metadata dokumen (trx_documents)
 * Murni mematuhi format snake_case pasca migrasi pembersihan database terbaru.
 * * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
    // 1. Matikan proteksi foreign key checks untuk pembersihan data aman
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. Truncate / Bersihkan data trx_documents lama agar tidak duplikat nomor berkas
    await knex('trx_documents').del();

    // 3. Nyalakan kembali foreign key checks
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');

    // 4. Lakukan pemetaan data contoh metadata dokumen
    await knex('trx_documents').insert([
        {
            id: 1,
            uuid: uuidv4(),
            document_name: "Standar Operasional Prosedur Rekrutmen Pegawai Baru",
            document_number: "SOP/HRD/2026/001",
            pic: "System Generated (User Master Pending)",
            branch_id: 1,              // Menunjuk ke Kantor Pusat/Cabang Utama
            division_id: 1,            // Menunjuk ke Divisi HRD / Organisasi Terkait
            document_type_id: 1,        // ID Tipe Referensi: SOP
            document_category_id: 1,    // ID Kategori Referensi: HRD
            confidentiality_level_id: 1, // ID Tingkat Referensi: Biasa / Umum
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            id: 2,
            uuid: uuidv4(),
            document_name: "Surat Keputusan Direksi Tentang Kebijakan Keuangan Triwulan I",
            document_number: "SK/DIR/FIN/2026/014",
            pic: "System Generated (User Master Pending)",
            branch_id: 1,
            division_id: 2,            // Menunjuk ke Divisi Keuangan / Finance
            document_type_id: 2,        // ID Tipe Referensi: Surat Keputusan
            document_category_id: 2,    // ID Kategori Referensi: Finance / Keuangan
            confidentiality_level_id: 3, // ID Tingkat Referensi: Rahasia (Confidential)
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        },
        {
            id: 3,
            uuid: uuidv4(),
            document_name: "Perjanjian Kerjasama Kerahasiaan Data Vendor Cloud (NDA)",
            document_number: "AGR/LEGAL/2026/089",
            pic: "System Generated (User Master Pending)",
            branch_id: 2,              // Menunjuk ke Cabang Regional / Cabang Madiun
            division_id: 3,            // Menunjuk ke Divisi Legal / Hukum
            document_type_id: 3,        // ID Tipe Referensi: Kontrak / Perjanjian
            document_category_id: 3,    // ID Kategori Referensi: Legal
            confidentiality_level_id: 4, // ID Tingkat Referensi: Sangat Rahasia
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }
    ]);
}