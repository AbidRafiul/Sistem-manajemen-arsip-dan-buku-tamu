/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Menambahkan kolom tanda_tangan, tipe_kunjungan, dan jumlah_tamu ke trs_kunjungan
  await knex.schema.alterTable("trs_kunjungan", (table) => {
    table.string("tanda_tangan", 255).nullable();
    table.enum("tipe_kunjungan", ["personal", "group"]).notNullable().defaultTo("personal");
    table.integer("jumlah_tamu").notNullable().defaultTo(1);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trs_kunjungan", (table) => {
    table.dropColumn("tanda_tangan");
    table.dropColumn("tipe_kunjungan");
    table.dropColumn("jumlah_tamu");
  });
}
