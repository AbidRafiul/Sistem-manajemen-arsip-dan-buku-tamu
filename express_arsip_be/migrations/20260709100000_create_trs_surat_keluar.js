/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trs_surat_keluar", (table) => {
    table.bigIncrements("id_surat_keluar").primary();
    table.string("nomor_surat", 100).notNullable();
    table.string("nomor_agenda", 100).notNullable().unique();
    table.date("tanggal_surat").notNullable();
    table.date("tanggal_kirim").nullable();
    table.bigInteger("id_jenis_surat").unsigned().notNullable();
    table.string("perihal", 255).notNullable();
    table.string("tujuan", 150).notNullable();
    table.string("instansi_tujuan", 150).nullable();
    table.string("media_pengiriman", 100).nullable();
    table
      .enu("status", [
        "draft",
        "menunggu_approval",
        "disetujui",
        "ditolak",
        "terkirim",
        "selesai",
        "dihapus",
      ])
      .notNullable()
      .defaultTo("draft");
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("id_jenis_surat")
      .references("jenis_surat_id")
      .inTable("mst_jenis_surat");
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
  await knex.schema.dropTableIfExists("trs_surat_keluar");
}
