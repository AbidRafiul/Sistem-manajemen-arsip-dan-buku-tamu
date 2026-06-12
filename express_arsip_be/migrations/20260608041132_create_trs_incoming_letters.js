/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.dropTableIfExists("trs_incoming_letters");
  await knex.schema.createTable("trs_incoming_letters", (table) => {
    // 1. Tambahkan standar charset dan collation
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.bigIncrements("IncomingLetterId").primary();

    table.string("AgendaNumber", 100).notNullable().unique();
    table.string("LetterNumber", 100).notNullable();
    table.date("LetterDate").notNullable();
    table.date("ReceivedDate").notNullable();

    table.string("SenderName", 150).notNullable();
    table.string("SenderInstitution", 150).nullable();
    table.string("Subject", 255).notNullable();
    table.text("AttachmentDescription").nullable();

    // 2. PERBAIKAN: bigInteger diubah menjadi integer
    table.integer("LetterTypeId").unsigned().nullable();
    table.integer("DocumentTypeId").unsigned().nullable();
    table.integer("ArchiveClassificationId").unsigned().nullable();
    table.integer("ConfidentialityLevelId").unsigned().nullable();

    table
      .enu("Status", ["baru", "diproses", "didisposisi", "selesai"])
      .notNullable()
      .defaultTo("baru");

    table.integer("CreatedBy").unsigned().nullable();
    table.integer("UpdatedBy").unsigned().nullable();

    // 3. PERBAIKAN: Hapus defaultTo(knex.fn.now())
    table.datetime("CreatedAt").notNullable();
    table.datetime("UpdatedAt").notNullable();

    // Foreign Keys Setup
    table
      .foreign("LetterTypeId")
      .references("LetterTypeId")
      .inTable("mst_letter_types");
    table
      .foreign("DocumentTypeId")
      .references("DocumentTypeId")
      .inTable("mst_document_type");
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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_incoming_letters");
}
