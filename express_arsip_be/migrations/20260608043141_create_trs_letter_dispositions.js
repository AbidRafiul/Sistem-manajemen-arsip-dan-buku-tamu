/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up(knex) {
  await knex.schema.createTable("trs_letter_dispositions", (table) => {
    table.bigIncrements("DispositionId").primary();

    table.bigInteger("IncomingLetterId").unsigned().notNullable();
    table.bigInteger("ParentDispositionId").unsigned().nullable();

    table.integer("FromUserId").unsigned().nullable();
    table.integer("ToUserId").unsigned().notNullable();

    table.bigInteger("DispositionInstructionId").unsigned().nullable();

    table.text("Instruction").nullable();
    table.text("DispositionNote").nullable();
    table.date("DueDate").nullable();

    table
      .enu("Status", ["baru", "dibaca", "diproses", "selesai"])
      .notNullable()
      .defaultTo("baru");

    table.dateTime("ReceivedAt").nullable();
    table.dateTime("ProcessedAt").nullable();
    table.dateTime("CompletedAt").nullable();

    table.integer("CreatedBy").unsigned().nullable();
    table.integer("UpdatedBy").unsigned().nullable();

    table.dateTime("CreatedAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("UpdatedAt").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("IncomingLetterId")
      .references("IncomingLetterId")
      .inTable("trs_incoming_letters")
      .onDelete("CASCADE");

    table
      .foreign("ParentDispositionId")
      .references("DispositionId")
      .inTable("trs_letter_dispositions");

    table.foreign("FromUserId").references("UserId").inTable("mst_users");
    table.foreign("ToUserId").references("UserId").inTable("mst_users");

    table
      .foreign("DispositionInstructionId")
      .references("DispositionInstructionId")
      .inTable("mst_disposition_instructions");

    table.foreign("CreatedBy").references("UserId").inTable("mst_users");
    table.foreign("UpdatedBy").references("UserId").inTable("mst_users");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_letter_dispositions");
}
