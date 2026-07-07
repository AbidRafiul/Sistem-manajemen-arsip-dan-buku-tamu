/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");
  const hasTable = await knex.schema.hasTable("mst_pengguna");
  if (hasTable) {
    const hasColumn = await knex.schema.hasColumn("mst_pengguna", "mst_unit_kerja");
    const hasNewColumn = await knex.schema.hasColumn("mst_pengguna", "id_unit_kerja");
    if (hasColumn && !hasNewColumn) {
      await knex.raw(
        "ALTER TABLE `mst_pengguna` CHANGE `mst_unit_kerja` `id_unit_kerja` INT(10) UNSIGNED NOT NULL"
      );
      console.log("Kolom mst_unit_kerja pada mst_pengguna berhasil diubah ke id_unit_kerja");
    }
  }
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");
  const hasTable = await knex.schema.hasTable("mst_pengguna");
  if (hasTable) {
    const hasColumn = await knex.schema.hasColumn("mst_pengguna", "id_unit_kerja");
    const hasOldColumn = await knex.schema.hasColumn("mst_pengguna", "mst_unit_kerja");
    if (hasColumn && !hasOldColumn) {
      await knex.raw(
        "ALTER TABLE `mst_pengguna` CHANGE `id_unit_kerja` `mst_unit_kerja` INT(10) UNSIGNED NOT NULL"
      );
      console.log("Rollback kolom id_unit_kerja pada mst_pengguna ke mst_unit_kerja");
    }
  }
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
