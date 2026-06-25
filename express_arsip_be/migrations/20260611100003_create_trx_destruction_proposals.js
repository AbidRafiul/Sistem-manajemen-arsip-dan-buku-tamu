/**
 * Buat tabel baru trx_destruction_proposals untuk workflow pemusnahan arsip
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trx_destruction_proposals", (table) => {
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("proposal_id").primary();

    // FK ke dokumen yang diusulkan musnah
    table
      .integer("document_id")
      .unsigned()
      .notNullable()
      .references("document_id")
      .inTable("trx_documents")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");

    // FK ke jadwal retensi yang menjadi dasar pemusnahan
    table
      .integer("retention_schedule_id")
      .unsigned()
      .nullable()
      .references("retention_schedule_id")
      .inTable("mst_retention_schedule")
      .onDelete("NO ACTION")
      .onUpdate("NO ACTION");

    // Alasan pemusnahan
    table.text("proposal_reason").notNullable();

    // Yang mengusulkan (nama_pengguna)
    table.string("proposed_by", 50).notNullable();

    // Waktu pengajuan
    table.datetime("proposed_at").notNullable();

    // Status workflow: draft → submitted → approved/rejected → executed
    table
      .enu("status", ["draft", "submitted", "approved", "rejected", "executed"])
      .notNullable()
      .defaultTo("submitted");

    // Reviewer (yang approve/reject)
    table.string("reviewed_by", 50).nullable();
    table.datetime("reviewed_at").nullable();
    table.text("review_notes").nullable();

    // Pelaksana pemusnahan
    table.string("executed_by", 50).nullable();
    table.datetime("executed_at").nullable();

    // Path file berita acara pemusnahan
    table.text("berita_acara_path").nullable();

    table.datetime("created_at").notNullable();
    table.datetime("updated_at").notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trx_destruction_proposals");
}
