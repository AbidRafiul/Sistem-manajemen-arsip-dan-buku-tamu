/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Membasmi emoji dan mengubah nama kolom menjadi 'telepon' normal
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `telepon覆` `telepon` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Kembalikan emoji jika di-rollback (walaupun nggak disarankan)
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `telepon` `telepon覆` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
}
