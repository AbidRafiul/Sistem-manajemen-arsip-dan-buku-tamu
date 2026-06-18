/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("mst_letter_types", (table) => {
    table.bigIncrements("letter_type_id").primary();

    table.string("letter_type_code", 50).notNullable().unique();
    table.string("letter_type_name", 150).notNullable();
    table.enu("direction", ["incoming", "outgoing", "both"]).notNullable().defaultTo("both");
    table.text("description").nullable();

    table.enu("status", ["active", "nonactive"]).notNullable().defaultTo("active");
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("mst_letter_types");
}
