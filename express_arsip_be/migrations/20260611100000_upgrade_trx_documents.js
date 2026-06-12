/**
 * Upgrade trx_documents:
 * - Tambah FK ke master: DocumentTypeId, DocumentCategoryId, ConfidentialityLevelId, RetentionScheduleId
 * - Tambah PhysicalLocation, QRCode, Tags
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("trx_documents", (table) => {
    // FK ke mst_document_type
    table
      .integer("DocumentTypeId")
      .unsigned()
      .nullable()
      .references("DocumentTypeId")
      .inTable("mst_document_type")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("ArchiveClassificationId");

    // FK ke mst_document_categories
    table
      .integer("DocumentCategoryId")
      .unsigned()
      .nullable()
      .references("DocumentCategoryId")
      .inTable("mst_document_categories")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("DocumentTypeId");

    // FK ke mst_confidentiality_levels
    table
      .integer("ConfidentialityLevelId")
      .unsigned()
      .nullable()
      .references("ConfidentialityLevelId")
      .inTable("mst_confidentiality_levels")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("DocumentCategoryId");

    // FK ke mst_retention_schedule
    table
      .integer("RetentionScheduleId")
      .unsigned()
      .nullable()
      .references("RetentionScheduleId")
      .inTable("mst_retention_schedule")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION")
      .after("ConfidentialityLevelId");

    // Lokasi fisik dokumen/arsip
    table
      .string("PhysicalLocation", 200)
      .nullable()
      .after("RetentionScheduleId");

    // QR Code string unik per dokumen
    table.text("QRCode").nullable().after("PhysicalLocation");

    // Tag/keyword pencarian tambahan
    table.text("Tags").nullable().after("QRCode");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trx_documents", (table) => {
    table.dropForeign(["DocumentTypeId"]);
    table.dropForeign(["DocumentCategoryId"]);
    table.dropForeign(["ConfidentialityLevelId"]);
    table.dropForeign(["RetentionScheduleId"]);
    table.dropColumn("DocumentTypeId");
    table.dropColumn("DocumentCategoryId");
    table.dropColumn("ConfidentialityLevelId");
    table.dropColumn("RetentionScheduleId");
    table.dropColumn("PhysicalLocation");
    table.dropColumn("QRCode");
    table.dropColumn("Tags");
  });
}
