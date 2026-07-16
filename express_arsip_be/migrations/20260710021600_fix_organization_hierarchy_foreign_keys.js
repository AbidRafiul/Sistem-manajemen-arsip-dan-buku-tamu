/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const dropFkIfExists = async (tableName, fkName) => {
    try {
      await knex.raw(`ALTER TABLE ?? DROP FOREIGN KEY ??`, [tableName, fkName]);
    } catch (e) {
      console.log(`Foreign key ${fkName} on ${tableName} does not exist, skipping drop.`);
    }
  };

  // 1. Fix mst_departemen foreign key
  await dropFkIfExists("mst_departemen", "mst_departments_divisionid_foreign");
  await knex.schema.alterTable("mst_departemen", (table) => {
    table
      .foreign("id_cabang", "mst_departemen_id_cabang_foreign")
      .references("id_cabang")
      .inTable("mst_cabang")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");
  });

  // 2. Fix mst_divisi foreign key
  await dropFkIfExists("mst_divisi", "mst_divisions_branchid_foreign");
  await knex.schema.alterTable("mst_divisi", (table) => {
    table
      .foreign("id_departemen", "mst_divisi_id_departemen_foreign")
      .references("id_departemen")
      .inTable("mst_departemen")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");
  });

  // 3. Fix mst_unit_kerja foreign key
  await dropFkIfExists("mst_unit_kerja", "mst_work_units_departmentid_foreign");
  await knex.schema.alterTable("mst_unit_kerja", (table) => {
    table
      .foreign("id_divisi", "mst_unit_kerja_id_divisi_foreign")
      .references("id_divisi")
      .inTable("mst_divisi")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");
  });

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const dropFkIfExists = async (tableName, fkName) => {
    try {
      await knex.raw(`ALTER TABLE ?? DROP FOREIGN KEY ??`, [tableName, fkName]);
    } catch (e) {
      // ignore
    }
  };

  // Revert mst_unit_kerja foreign key
  await dropFkIfExists("mst_unit_kerja", "mst_unit_kerja_id_divisi_foreign");
  await knex.schema.alterTable("mst_unit_kerja", (table) => {
    table
      .foreign("id_divisi", "mst_work_units_departmentid_foreign")
      .references("id_departemen")
      .inTable("mst_departemen")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");
  });

  // Revert mst_divisi foreign key
  await dropFkIfExists("mst_divisi", "mst_divisi_id_departemen_foreign");
  await knex.schema.alterTable("mst_divisi", (table) => {
    table
      .foreign("id_departemen", "mst_divisions_branchid_foreign")
      .references("id_cabang")
      .inTable("mst_cabang")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");
  });

  // Revert mst_departemen foreign key
  await dropFkIfExists("mst_departemen", "mst_departemen_id_cabang_foreign");
  await knex.schema.alterTable("mst_departemen", (table) => {
    table
      .foreign("id_cabang", "mst_departments_divisionid_foreign")
      .references("id_divisi")
      .inTable("mst_divisi")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");
  });

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
