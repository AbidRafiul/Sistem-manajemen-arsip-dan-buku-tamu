/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // =========================================================================
  // HACK BYPASS PANEL ADMIN V2: Sapu bersih dua-duanya sebelum mulai
  // =========================================================================
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;'); 
  
  // HAPUS TABEL YANG NYANGKUT:
  await knex.schema.dropTableIfExists("trx_incoming_letters"); 
  await knex.schema.dropTableIfExists("mst_letter_types"); 

  // Bikin ulang tabel mst_letter_types dengan tipe BIGINT UNSIGNED yang BENAR
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
  
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;'); 
  // =========================================================================


  // Bikin ulang trx_incoming_letters dengan bersih
  await knex.schema.createTable("trx_incoming_letters", (table) => {
    table.bigIncrements("incoming_letter_id").primary();

    table.string("agenda_number", 100).notNullable().unique();
    table.string("letter_number", 100).notNullable();
    table.date("letter_date").notNullable();
    table.date("received_date").notNullable();

    table.string("sender_name", 150).notNullable();
    table.string("sender_institution", 150).nullable();
    table.string("subject", 255).notNullable();
    table.text("attachment_description").nullable();

    table.bigInteger("letter_type_id").unsigned().nullable();
    table.integer("document_type_id").unsigned().nullable();
    table.integer("archive_classification_id").unsigned().nullable();
    table.integer("confidentiality_level_id").unsigned().nullable();

    table.enu("status", ["baru", "diproses", "didisposisi", "selesai"]).notNullable().defaultTo("baru");

    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();

    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.foreign("letter_type_id").references("letter_type_id").inTable("mst_letter_types");
    table.foreign("document_type_id").references("DocumentTypeId").inTable("mst_document_type");
    table
      .foreign("archive_classification_id")
      .references("ArchiveClassificationId")
      .inTable("mst_archive_classifications");
    table
      .foreign("confidentiality_level_id")
      .references("ConfidentialityLevelId")
      .inTable("mst_confidentiality_levels");

    table.foreign("created_by").references("UserId").inTable("mst_users");
    table.foreign("updated_by").references("UserId").inTable("mst_users");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("trx_incoming_letters");
}