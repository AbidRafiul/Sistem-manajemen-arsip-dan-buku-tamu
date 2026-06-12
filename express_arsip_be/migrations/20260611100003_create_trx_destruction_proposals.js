/**
 * Buat tabel baru trx_destruction_proposals untuk workflow pemusnahan arsip
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trx_destruction_proposals", (table) => {
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("ProposalId").primary();

    // FK ke dokumen yang diusulkan musnah
    table
      .integer("DocumentId")
      .unsigned()
      .notNullable()
      .references("DocumentId")
      .inTable("trx_documents")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");

    // FK ke jadwal retensi yang menjadi dasar pemusnahan
    table
      .integer("RetentionScheduleId")
      .unsigned()
      .nullable()
      .references("RetentionScheduleId")
      .inTable("mst_retention_schedule")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");

    // Alasan pemusnahan
    table.text("ProposalReason").notNullable();

    // Yang mengusulkan (username)
    table.string("ProposedBy", 50).notNullable();

    // Waktu pengajuan
    table.datetime("ProposedAt").notNullable();

    // Status workflow: draft → submitted → approved/rejected → executed
    table
      .enu("Status", ["draft", "submitted", "approved", "rejected", "executed"])
      .notNullable()
      .defaultTo("submitted");

    // Reviewer (yang approve/reject)
    table.string("ReviewedBy", 50).nullable();
    table.datetime("ReviewedAt").nullable();
    table.text("ReviewNotes").nullable();

    // Pelaksana pemusnahan
    table.string("ExecutedBy", 50).nullable();
    table.datetime("ExecutedAt").nullable();

    // Path file berita acara pemusnahan
    table.text("BeritaAcaraPath").nullable();

    table.datetime("CreatedAt").notNullable();
    table.datetime("UpdatedAt").notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trx_destruction_proposals");
}
