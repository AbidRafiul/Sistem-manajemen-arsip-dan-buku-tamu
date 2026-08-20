/**
 * Migration to add standard audit fields (created_by, updated_by, tz, created_at, updated_at)
 * across operational and master data tables.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const targetTables = [
    "trx_dokumen",
    "trx_versi_dokumen",
    "trx_peminjaman_arsip",
    "trx_usulan_pemusnahan",
    "trx_kunjungan",
    "trx_kunjungan_anggota",
    "trx_konten_dokumen",
    "trx_riwayat_dokumen",
    "trx_notifikasi",
    "trx_surat_masuk",
    "trx_surat_keluar",
    "trx_disposisi_surat",
    "trx_file_surat_keluar",
    "trx_file_surat_masuk",
    "mst_jenis_dokumen",
    "mst_kategori_dokumen",
    "mst_klasifikasi_arsip",
    "mst_jadwal_retensi",
    "mst_tingkat_kerahasiaan",
    "mst_jenis_surat",
    "mst_template_surat",
    "mst_penomoran_surat",
    "mst_cabang",
    "mst_departemen",
    "mst_divisi",
    "mst_unit_kerja",
    "mst_jabatan"
  ];

  for (const tableName of targetTables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) continue;

    const hasCreatedBy = await knex.schema.hasColumn(tableName, "created_by");
    const hasUpdatedBy = await knex.schema.hasColumn(tableName, "updated_by");
    const hasTz = await knex.schema.hasColumn(tableName, "tz");
    const hasCreatedAt = await knex.schema.hasColumn(tableName, "created_at");
    const hasUpdatedAt = await knex.schema.hasColumn(tableName, "updated_at");

    if (!hasCreatedBy || !hasUpdatedBy || !hasTz || !hasCreatedAt || !hasUpdatedAt) {
      await knex.schema.alterTable(tableName, (table) => {
        if (!hasCreatedBy) {
          table.integer("created_by").unsigned().nullable();
        }
        if (!hasUpdatedBy) {
          table.integer("updated_by").unsigned().nullable();
        }
        if (!hasTz) {
          table.string("tz", 50).defaultTo("Asia/Jakarta").nullable();
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
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const targetTables = [
    "trx_dokumen",
    "trx_versi_dokumen",
    "trx_peminjaman_arsip",
    "trx_usulan_pemusnahan",
    "trx_kunjungan",
    "trx_kunjungan_anggota",
    "trx_konten_dokumen",
    "trx_riwayat_dokumen",
    "trx_notifikasi",
    "trx_surat_masuk",
    "trx_surat_keluar",
    "trx_disposisi_surat",
    "trx_file_surat_keluar",
    "trx_file_surat_masuk",
    "mst_jenis_dokumen",
    "mst_kategori_dokumen",
    "mst_klasifikasi_arsip",
    "mst_jadwal_retensi",
    "mst_tingkat_kerahasiaan",
    "mst_jenis_surat",
    "mst_template_surat",
    "mst_penomoran_surat",
    "mst_cabang",
    "mst_departemen",
    "mst_divisi",
    "mst_unit_kerja",
    "mst_jabatan"
  ];

  for (const tableName of targetTables) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) continue;

    const hasTz = await knex.schema.hasColumn(tableName, "tz");

    if (hasTz) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn("tz");
      });
    }
  }
}
