/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up(knex) {
  await knex.schema.createTable("mst_letter_types", (table) => {
    table.bigIncrements("LetterTypeId").primary();

    table.string("LetterTypeCode", 50).notNullable().unique();
    table.string("LetterTypeName", 150).notNullable();
    table.enu("Direction", ["incoming", "outgoing", "both"]).notNullable().defaultTo("both");
    table.text("Description").nullable();

    table.enu("Status", ["active", "nonactive"]).notNullable().defaultTo("active");
    table.dateTime("CreatedAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("UpdatedAt").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("mst_letter_types");
}
