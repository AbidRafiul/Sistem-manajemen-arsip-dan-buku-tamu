/**
 * Create trs_riwayat_dokumen table for detailed audit trail & changelog
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("trs_riwayat_dokumen");
  if (!hasTable) {
    await knex.schema.createTable("trs_riwayat_dokumen", (table) => {
      table.charset("utf8mb4");
      table.collate("utf8mb4_unicode_ci");

      table.increments("id_riwayat").primary();
      table.string("kode_dokumen", 255).notNullable();
      table
        .enu("aksi", [
          "create",
          "update",
          "delete",
          "version_upload",
          "version_approve",
          "version_reject",
          "version_rollback",
          "loan",
          "return",
        ])
        .notNullable();
      table.string("deskripsi", 500).notNullable();
      table.json("detail_json").nullable();
      table.string("dilakukan_oleh", 100).notNullable();
      table.string("ip_alamat", 50).nullable();
      table.datetime("created_at").notNullable();

      table.index("kode_dokumen", "idx_riwayat_kode_dokumen");
      table.index("aksi", "idx_riwayat_aksi");
      table.index("dilakukan_oleh", "idx_riwayat_dilakukan_oleh");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_riwayat_dokumen");
}
