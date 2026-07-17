/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn("trs_kunjungan", "id_cabang");
  if (!hasColumn) {
    await knex.schema.alterTable("trs_kunjungan", (table) => {
      table.integer("id_cabang").unsigned().nullable();
      table.foreign("id_cabang")
        .references("id_cabang")
        .inTable("mst_cabang")
        .onDelete("SET NULL");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trs_kunjungan", (table) => {
    table.dropForeign(["id_cabang"]);
    table.dropColumn("id_cabang");
  });
}
