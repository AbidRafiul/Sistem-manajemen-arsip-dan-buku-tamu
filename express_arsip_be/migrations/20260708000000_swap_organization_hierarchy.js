/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Disable foreign key checks so we don't have to worry about dropping them by exact name
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Ubah mst_departemen (id_divisi -> id_cabang)
  // We use raw query to ensure we can rename even if we don't drop the FK perfectly in Knex
  await knex.raw("ALTER TABLE `mst_departemen` CHANGE `id_divisi` `id_cabang` INT(10) UNSIGNED NOT NULL;");

  // 2. Ubah mst_divisi (id_cabang -> id_departemen)
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `id_cabang` `id_departemen` INT(10) UNSIGNED NOT NULL;");

  // 3. Ubah mst_unit_kerja (id_departemen -> id_divisi)
  await knex.raw("ALTER TABLE `mst_unit_kerja` CHANGE `id_departemen` `id_divisi` INT(10) UNSIGNED NOT NULL;");

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // Revert mst_unit_kerja
  await knex.raw("ALTER TABLE `mst_unit_kerja` CHANGE `id_divisi` `id_departemen` INT(10) UNSIGNED NOT NULL;");

  // Revert mst_divisi
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `id_departemen` `id_cabang` INT(10) UNSIGNED NOT NULL;");

  // Revert mst_departemen
  await knex.raw("ALTER TABLE `mst_departemen` CHANGE `id_cabang` `id_divisi` INT(10) UNSIGNED NOT NULL;");

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
