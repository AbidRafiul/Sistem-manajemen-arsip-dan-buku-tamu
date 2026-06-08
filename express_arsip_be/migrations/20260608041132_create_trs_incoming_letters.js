/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trs_incoming_letters", (table) => {
    table.bigIncrements("IncomingLetterId").primary();

    table.string("AgendaNumber", 100).notNullable().unique();
    table.string("LetterNumber", 100).notNullable();
    table.date("LetterDate").notNullable();
    table.date("ReceivedDate").notNullable();

    table.string("SenderName", 150).notNullable();
    table.string("SenderInstitution", 150).nullable();
    table.string("Subject", 255).notNullable();
    table.text("AttachmentDescription").nullable();

    table.bigInteger("LetterTypeId").unsigned().nullable();
    table.integer("DocumentTypeId").unsigned().nullable();
    table.integer("ArchiveClassificationId").unsigned().nullable();
    table.integer("ConfidentialityLevelId").unsigned().nullable();

    table
      .enu("Status", ["baru", "diproses", "didisposisi", "selesai"])
      .notNullable()
      .defaultTo("baru");

    table.integer("CreatedBy").unsigned().nullable();
    table.integer("UpdatedBy").unsigned().nullable();

    table.dateTime("CreatedAt").notNullable().defaultTo(knex.fn.now());
    table.dateTime("UpdatedAt").notNullable().defaultTo(knex.fn.now());

    table.foreign("LetterTypeId").references("LetterTypeId").inTable("mst_letter_types");
    table.foreign("DocumentTypeId").references("DocumentTypeId").inTable("mst_document_type");
    table
      .foreign("ArchiveClassificationId")
      .references("ArchiveClassificationId")
      .inTable("mst_archive_classifications");
    table
      .foreign("ConfidentialityLevelId")
      .references("ConfidentialityLevelId")
      .inTable("mst_confidentiality_levels");

    table.foreign("CreatedBy").references("UserId").inTable("mst_users");
    table.foreign("UpdatedBy").references("UserId").inTable("mst_users");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_incoming_letters");
}
