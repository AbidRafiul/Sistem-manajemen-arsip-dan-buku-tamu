/**
 * Create trs_notifikasi table for centralized notifications
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("trs_notifikasi");
  if (!hasTable) {
    await knex.schema.createTable("trs_notifikasi", (table) => {
      table.charset("utf8mb4");
      table.collate("utf8mb4_unicode_ci");

      table.increments("id_notifikasi").primary();
      table.integer("id_pengguna").unsigned().nullable().references("id_pengguna").inTable("mst_pengguna").onDelete("CASCADE");
      table.string("judul", 150).notNullable();
      table.text("pesan").notNullable();
      table.string("tipe", 50).notNullable(); // 'surat_masuk', 'kunjungan', 'disposisi', 'sistem'
      table.string("tautan", 255).nullable();
      table.tinyint("status_baca").defaultTo(0).notNullable(); // 0 = unread, 1 = read
      table.datetime("created_at").notNullable();
      table.datetime("updated_at").notNullable();

      table.index("id_pengguna", "idx_notifikasi_id_pengguna");
      table.index("status_baca", "idx_notifikasi_status_baca");
      table.index("created_at", "idx_notifikasi_created_at");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_notifikasi");
}
