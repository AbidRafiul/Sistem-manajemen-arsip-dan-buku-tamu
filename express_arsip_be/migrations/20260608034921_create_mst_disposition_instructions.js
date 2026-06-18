/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("mst_disposition_instructions", (table) => {
    table.bigIncrements("disposition_instruction_id").primary();
    table.string("instruction_code", 50).notNullable().unique();
    table.string("instruction_name", 100).notNullable();
    table.text("description").nullable();

    table.enu("status", ["active", "nonactive"]).notNullable().defaultTo("active");
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("mst_disposition_instructions");
}
