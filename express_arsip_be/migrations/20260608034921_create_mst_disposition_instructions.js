/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up (knex){
await knex.schema.createTable("mst_disposition_instructions", (table) => {
        table.bigIncrements("DispositionInstructionId").primary();
        table.string("InstructionCode", 50 ).notNullable().unique();
        table.string("InstructionName", 100).notNullable();
        table.text("Description").nullable();

        table.enu("Status",["active","nonactive"]).notNullable().defaultTo("active");
        table.dateTime("CreatedAt").notNullable().defaultTo(knex.fn.now());
        table.dateTime("UpdatedAt").notNullable().defaultTo(knex.fn.now());
    })
    
}

export async function down(knex){
    await knex.schema.dropTableIfExists("mst_disposition_instructions")
}