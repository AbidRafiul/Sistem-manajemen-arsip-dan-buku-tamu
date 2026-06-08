/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trx_document_versions", (table) => {
    table.increments("VersionId").primary();
    table
      .integer("DocumentId")
      .unsigned()
      .notNullable()
      .references("DocumentId")
      .inTable("trx_documents")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.integer("VersionNumber").notNullable();
    table.text("ChangeNotes").nullable();
    table.string("FilePath").notNullable();
    table.datetime("CreatedAt").notNullable();
    table.datetime("UpdatedAt").notNullable();
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trx_document_versions");
}
