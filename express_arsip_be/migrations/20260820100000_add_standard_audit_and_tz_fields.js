/**
 * Migration to add standard audit fields (created_by, updated_by, tz, created_at, updated_at)
 * across operational and master data tables.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const targetTables = [
    "mst_cabang", "mst_departemen", "mst_divisi", "mst_instruksi_disposisi",
    "mst_jabatan", "mst_jadwal_retensi", "mst_jenis_dokumen", "mst_jenis_surat",
    "mst_kategori_dokumen", "mst_klasifikasi_arsip", "mst_menu", "mst_navigasi",
    "mst_pengguna", "mst_pengguna_peran", "mst_penomoran_surat", "mst_peran",
    "mst_peran_menu", "mst_posisi_tanda_tangan", "mst_riwayat_audit",
    "mst_sertifikat_elektronik", "mst_template_surat", "mst_tingkat_kerahasiaan",
    "mst_tujuan_kunjungan", "mst_unit_kerja", "navigasi_pengguna", "config", "log",
    "trx_disposisi_surat", "trx_dokumen", "trx_file_surat_keluar", "trx_file_surat_masuk",
    "trx_konten_dokumen", "trx_kunjungan", "trx_kunjungan_anggota", "trx_log_tanda_tangan",
    "trx_notifikasi", "trx_peminjaman_arsip", "trx_riwayat_dokumen",
    "trx_sequence_penomoran_surat", "trx_surat_keluar", "trx_surat_masuk",
    "trx_tanda_tangan_dokumen", "trx_tracking_surat_keluar", "trx_tracking_surat_masuk",
    "trx_usulan_pemusnahan", "trx_verifikasi_dokumen", "trx_versi_dokumen"
  ];

  for (const tableName of targetTables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) continue;

    const hasCreatedBy = await knex.schema.hasColumn(tableName, "created_by");
    const hasUpdatedBy = await knex.schema.hasColumn(tableName, "updated_by");
    const hasOldTz = await knex.schema.hasColumn(tableName, "tz");
    const hasZonaWaktu = await knex.schema.hasColumn(tableName, "zona_waktu");
    const hasCreatedAt = await knex.schema.hasColumn(tableName, "created_at");
    const hasUpdatedAt = await knex.schema.hasColumn(tableName, "updated_at");

    if (hasOldTz && !hasZonaWaktu) {
      await knex.schema.alterTable(tableName, (table) => {
        table.renameColumn("tz", "zona_waktu");
      });
    }

    if (!hasCreatedBy || !hasUpdatedBy || (!hasZonaWaktu && !hasOldTz) || !hasCreatedAt || !hasUpdatedAt) {
      await knex.schema.alterTable(tableName, (table) => {
        if (!hasCreatedBy) {
          table.integer("created_by").unsigned().nullable();
        }
        if (!hasUpdatedBy) {
          table.integer("updated_by").unsigned().nullable();
        }
        if (!hasZonaWaktu && !hasOldTz) {
          table.string("zona_waktu", 50).defaultTo("Asia/Jakarta").nullable();
        }
        if (!hasCreatedAt) {
          table.timestamp("created_at").defaultTo(knex.fn.now()).nullable();
        }
        if (!hasUpdatedAt) {
          table.timestamp("updated_at").defaultTo(knex.fn.now()).nullable();
        }
      });
    }
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const targetTables = [
    "mst_cabang", "mst_departemen", "mst_divisi", "mst_instruksi_disposisi",
    "mst_jabatan", "mst_jadwal_retensi", "mst_jenis_dokumen", "mst_jenis_surat",
    "mst_kategori_dokumen", "mst_klasifikasi_arsip", "mst_menu", "mst_navigasi",
    "mst_pengguna", "mst_pengguna_peran", "mst_penomoran_surat", "mst_peran",
    "mst_peran_menu", "mst_posisi_tanda_tangan", "mst_riwayat_audit",
    "mst_sertifikat_elektronik", "mst_template_surat", "mst_tingkat_kerahasiaan",
    "mst_tujuan_kunjungan", "mst_unit_kerja", "navigasi_pengguna", "config", "log",
    "trx_disposisi_surat", "trx_dokumen", "trx_file_surat_keluar", "trx_file_surat_masuk",
    "trx_konten_dokumen", "trx_kunjungan", "trx_kunjungan_anggota", "trx_log_tanda_tangan",
    "trx_notifikasi", "trx_peminjaman_arsip", "trx_riwayat_dokumen",
    "trx_sequence_penomoran_surat", "trx_surat_keluar", "trx_surat_masuk",
    "trx_tanda_tangan_dokumen", "trx_tracking_surat_keluar", "trx_tracking_surat_masuk",
    "trx_usulan_pemusnahan", "trx_verifikasi_dokumen", "trx_versi_dokumen"
  ];

  for (const tableName of targetTables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) continue;

    const hasZonaWaktu = await knex.schema.hasColumn(tableName, "zona_waktu");

    if (hasZonaWaktu) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn("zona_waktu");
      });
    }
  }
}
