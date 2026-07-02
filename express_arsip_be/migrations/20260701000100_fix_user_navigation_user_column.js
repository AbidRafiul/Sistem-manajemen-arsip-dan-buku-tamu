const getExistingNavigationTables = async (knex) => {
  const tables = [];

  for (const tableName of ["user_navigation", "navigasi_pengguna"]) {
    if (await knex.schema.hasTable(tableName)) tables.push(tableName);
  }

  return tables;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const tableNames = await getExistingNavigationTables(knex);

  for (const tableName of tableNames) {
    if (await knex.schema.hasColumn(tableName, "id_pengguna")) continue;

    let legacyColumn = null;
    for (const columnName of [
      "user_id",
      "UserId",
      "nama_pengguna",
      "UniqueId",
      "unique_id",
    ]) {
      if (await knex.schema.hasColumn(tableName, columnName)) {
        legacyColumn = columnName;
        break;
      }
    }

    await knex.schema.alterTable(tableName, (table) => {
      if (legacyColumn) {
        table.renameColumn(legacyColumn, "id_pengguna");
      } else {
        table.integer("id_pengguna").nullable().unique();
      }
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const tableNames = await getExistingNavigationTables(knex);

  for (const tableName of tableNames) {
    if (!(await knex.schema.hasColumn(tableName, "id_pengguna"))) continue;

    const legacyColumn =
      tableName === "navigasi_pengguna" ? "nama_pengguna" : "user_id";
    if (await knex.schema.hasColumn(tableName, legacyColumn)) continue;

    await knex.schema.alterTable(tableName, (table) => {
      table.renameColumn("id_pengguna", legacyColumn);
    });
  }
}
