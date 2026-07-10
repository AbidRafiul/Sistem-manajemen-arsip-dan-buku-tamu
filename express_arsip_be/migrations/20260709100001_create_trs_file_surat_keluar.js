/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trs_file_surat_keluar", (table) => {
    table.bigIncrements("id_file_surat_keluar").primary();
    table.bigInteger("id_surat_keluar").unsigned().notNullable();
    table.string("nama_file", 255).notNullable();
    table.string("path_file", 255).notNullable();
    table.string("mime_type", 100).nullable();
    table.bigInteger("ukuran_file").nullable();
    table.dateTime("tanggal_upload").notNullable().defaultTo(knex.fn.now());
    table
      .enu("status", ["active", "nonactive"])
      .notNullable()
      .defaultTo("active");
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("id_surat_keluar")
      .references("id_surat_keluar")
      .inTable("trs_surat_keluar");
    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna");
    table
      .foreign("updated_by")
      .references("id_pengguna")
      .inTable("mst_pengguna");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_file_surat_keluar");
}
