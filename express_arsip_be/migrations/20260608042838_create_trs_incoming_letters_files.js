/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
**/

export async function up(knex) {
  await knex.schema.createTable("trs_incoming_letter_files", (table) => {
    table.bigIncrements("IncomingLetterFileId").primary();

    table.bigInteger("IncomingLetterId").unsigned().notNullable();

    table.string("FilePath", 255).notNullable();
    table.string("FileName", 255).nullable();
    table.string("FileMimeType", 100).nullable();
    table.bigInteger("FileSize").nullable();

    table.integer("UploadedBy").unsigned().nullable();

    table.enu("Status", ["active", "nonactive"]).notNullable().defaultTo("active");
    table.dateTime("CreatedAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("UpdatedAt").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("IncomingLetterId")
      .references("IncomingLetterId")
      .inTable("trs_incoming_letters")
      .onDelete("CASCADE");

    table.foreign("UploadedBy").references("UserId").inTable("mst_users");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_incoming_letter_files");
}
