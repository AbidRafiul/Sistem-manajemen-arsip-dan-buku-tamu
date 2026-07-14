/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("mst_cabang", (table) => {
    table.integer("id_induk").unsigned().nullable().after("id_cabang");
    
    // We add a foreign key to ensure referential integrity
    table.foreign("id_induk").references("id_cabang").inTable("mst_cabang").onDelete("SET NULL").onUpdate("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("mst_cabang", (table) => {
    table.dropForeign("id_induk");
    table.dropColumn("id_induk");
  });
}
