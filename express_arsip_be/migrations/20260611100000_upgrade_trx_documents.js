/**
 * Upgrade trx_documents:
 * - Tambah FK ke master: document_type_id, document_category_id, confidentiality_level_id, retention_schedule_id
 * - Tambah physical_location, qr_code, tags
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("trx_documents", (table) => {
    // FK ke mst_document_type
    table
      .integer("document_type_id")
      .unsigned()
      .nullable()
      .references("document_type_id")
      .inTable("mst_document_type")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("archive_classification_id");

    // FK ke mst_document_categories
    table
      .integer("document_category_id")
      .unsigned()
      .nullable()
      .references("document_category_id")
      .inTable("mst_document_categories")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("document_type_id");

    // FK ke mst_confidentiality_levels
    table
      .integer("confidentiality_level_id")
      .unsigned()
      .nullable()
      .references("confidentiality_level_id")
      .inTable("mst_confidentiality_levels")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("document_category_id");

    // FK ke mst_retention_schedule
    table
      .integer("retention_schedule_id")
      .unsigned()
      .nullable()
      .references("retention_schedule_id")
      .inTable("mst_retention_schedule")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("confidentiality_level_id");

    // Lokasi fisik dokumen/arsip
    table
      .string("physical_location", 200)
      .nullable()
      .after("retention_schedule_id");

    // QR Code string unik per dokumen
    table.text("qr_code").nullable().after("physical_location");

    // Tag/keyword pencarian tambahan
    table.text("tags").nullable().after("qr_code");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trx_documents", (table) => {
    // Drop Foreign Keys
    table.dropForeign(["document_type_id"]);
    table.dropForeign(["document_category_id"]);
    table.dropForeign(["confidentiality_level_id"]);
    table.dropForeign(["retention_schedule_id"]);

    // Drop Columns
    table.dropColumn("document_type_id");
    table.dropColumn("document_category_id");
    table.dropColumn("confidentiality_level_id");
    table.dropColumn("retention_schedule_id");
    table.dropColumn("physical_location");
    table.dropColumn("qr_code");
    table.dropColumn("tags");
  });
}