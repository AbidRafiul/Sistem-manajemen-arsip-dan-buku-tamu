/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trs_tracking_surat_keluar", (table) => {
    table.bigIncrements("id_tracking").primary();
    table.bigInteger("id_surat_keluar").unsigned().notNullable();
    table.string("status", 50).notNullable();
    table.string("aktivitas", 100).notNullable();
    table.text("catatan").nullable();
    table.dateTime("tanggal").notNullable();
    table.integer("dibuat_oleh").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("id_surat_keluar")
      .references("id_surat_keluar")
      .inTable("trs_surat_keluar");
    table
      .foreign("dibuat_oleh")
      .references("id_pengguna")
      .inTable("mst_pengguna");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_tracking_surat_keluar");
}
