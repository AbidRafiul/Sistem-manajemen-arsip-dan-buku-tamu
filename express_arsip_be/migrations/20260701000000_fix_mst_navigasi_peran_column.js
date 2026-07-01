const findNavigationTable = async (knex) => {
  if (await knex.schema.hasTable("mst_navigasi")) return "mst_navigasi";
  if (await knex.schema.hasTable("mst_navigation")) return "mst_navigation";
  return null;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const tableName = await findNavigationTable(knex);
  if (!tableName || (await knex.schema.hasColumn(tableName, "peran"))) return;

  const legacyColumn = (await knex.schema.hasColumn(tableName, "role"))
    ? "role"
    : (await knex.schema.hasColumn(tableName, "Role"))
      ? "Role"
      : null;

  await knex.schema.alterTable(tableName, (table) => {
    if (legacyColumn) {
      table.renameColumn(legacyColumn, "peran");
    } else {
      table.string("peran", 50).nullable();
    }
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const tableName = await findNavigationTable(knex);
  if (!tableName || !(await knex.schema.hasColumn(tableName, "peran"))) return;
  if (await knex.schema.hasColumn(tableName, "role")) return;

  await knex.schema.alterTable(tableName, (table) => {
    table.renameColumn("peran", "role");
  });
}
