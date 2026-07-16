/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("trs_kunjungan_anggota");
  if (!hasTable) {
    await knex.schema.createTable("trs_kunjungan_anggota", (table) => {
      table.increments("id_kunjungan_anggota").primary();
      table.integer("id_kunjungan").unsigned().notNullable();
      table.string("nama_anggota", 100).notNullable();
      table.string("nomor_telepon", 45).nullable();
      table.string("nomor_identitas", 50).nullable();
      table.string("foto_identitas", 255).nullable();
      table.timestamps(true, true);

      table.foreign("id_kunjungan")
        .references("id_kunjungan")
        .inTable("trs_kunjungan")
        .onDelete("CASCADE");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_kunjungan_anggota");
}
