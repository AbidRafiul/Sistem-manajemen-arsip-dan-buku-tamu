/**
 * Create trs_konten_dokumen table for OCR & PDF text extraction
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("trs_konten_dokumen");
  if (!hasTable) {
    await knex.schema.createTable("trs_konten_dokumen", (table) => {
      table.charset("utf8mb4");
      table.collate("utf8mb4_unicode_ci");

      table.increments("id_konten").primary();
      table.string("kode_dokumen", 255).notNullable();
      table.integer("id_versi").unsigned().notNullable();
      table.text("konten_teks", "longtext").nullable();
      table
        .enu("sumber_konten", ["pdf_parse", "ocr_pdf", "ocr_gambar"])
        .defaultTo("pdf_parse");
      table
        .enu("status_ocr", ["pending", "processing", "completed", "failed"])
        .defaultTo("pending");
      table.text("pesan_error").nullable();
      table.integer("jumlah_halaman").defaultTo(0);
      table.string("bahasa_ocr", 10).defaultTo("eng");
      table.datetime("created_at").notNullable();
      table.datetime("updated_at").notNullable();

      table.index("kode_dokumen", "idx_konten_kode_dokumen");
      table.index("id_versi", "idx_konten_id_versi");
      table.index("status_ocr", "idx_konten_status_ocr");
    });

    // Add FULLTEXT index on konten_teks for MySQL
    await knex.raw(
      "ALTER TABLE trs_konten_dokumen ADD FULLTEXT INDEX ft_konten_teks (konten_teks)"
    );
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_konten_dokumen");
}
