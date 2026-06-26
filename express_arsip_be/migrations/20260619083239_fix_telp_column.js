/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("mst_pengguna");
  if (!hasTable) return;

  const [columns] = await knex.raw("SHOW FULL COLUMNS FROM ??", [
    "mst_pengguna",
  ]);
  const columnNames = columns.map((column) => column.Field);

  if (columnNames.includes("telepon")) return;

  const brokenColumn = columnNames.find(
    (columnName) =>
      columnName.toLowerCase().startsWith("telepon") &&
      columnName !== "telepon",
  );

  if (!brokenColumn) return;

  await knex.raw(
    "ALTER TABLE ?? CHANGE ?? `telepon` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
    ["mst_pengguna", brokenColumn],
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await Promise.resolve();
}
