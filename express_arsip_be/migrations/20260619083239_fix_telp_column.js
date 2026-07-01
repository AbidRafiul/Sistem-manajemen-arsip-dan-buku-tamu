/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasPengguna = await knex.schema.hasTable("mst_pengguna");
  const tableName = hasPengguna ? "mst_pengguna" : "mst_users";

  const hasTable = await knex.schema.hasTable(tableName);
  if (!hasTable) return;

  const [columns] = await knex.raw("SHOW FULL COLUMNS FROM ??", [tableName]);
  const columnNames = columns.map((column) => column.Field);

  if (columnNames.includes("telepon")) return;

  const brokenColumn = columnNames.find(
    (columnName) =>
      (columnName.toLowerCase().startsWith("telepon") || columnName.toLowerCase() === "telp") &&
      columnName !== "telepon",
  );

  if (!brokenColumn) return;

  await knex.raw(
    `ALTER TABLE \`${tableName}\` CHANGE \`${brokenColumn}\` \`telepon\` VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL`
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await Promise.resolve();
}
