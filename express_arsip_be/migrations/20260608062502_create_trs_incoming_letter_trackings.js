/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up(knex) {
  await knex.schema.createTable("trs_incoming_letter_trackings", (table) => {
    table.bigIncrements("IncomingLetterTrackingId").primary();

    table.bigInteger("IncomingLetterId").unsigned().notNullable();
    table.bigInteger("DispositionId").unsigned().nullable();

    table.string("ActionName", 100).notNullable();

    table.integer("FromUserId").unsigned().nullable();
    table.integer("ToUserId").unsigned().nullable();

    table.string("PreviousStatus", 50).nullable();
    table.string("CurrentStatus", 50).notNullable();

    table.text("Notes").nullable();
    table.dateTime("ProcessedAt").notNullable();

    table.integer("CreatedBy").unsigned().nullable();

    table.dateTime("CreatedAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("UpdatedAt").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("IncomingLetterId")
      .references("IncomingLetterId")
      .inTable("trs_incoming_letters")
      .onDelete("CASCADE");

    table
      .foreign("DispositionId")
      .references("DispositionId")
      .inTable("trs_letter_dispositions");

    table.foreign("FromUserId").references("UserId").inTable("mst_users");
    table.foreign("ToUserId").references("UserId").inTable("mst_users");
    table.foreign("CreatedBy").references("UserId").inTable("mst_users");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_incoming_letter_trackings");
}
