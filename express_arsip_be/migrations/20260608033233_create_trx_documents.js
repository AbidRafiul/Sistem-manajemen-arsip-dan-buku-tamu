/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("trx_documents", (table) => {
    table.charset("utf8mb4");
    table.collate("utf8mb4_unicode_ci");

    table.increments("DocumentId").primary();
    table.integer("ArchiveClassificationId").unsigned();
    table.string("DocumentName");
    table.string("DocumentNumber");
    table.date("DocumentDate");
    table.date("ExpiredDate");
    table.string("PicName");
    table
      .enu("Status", ["active", "nonactive"])
      .notNullable()
      .defaultTo("active");
    table.datetime("CreatedAt").notNullable();
    table.datetime("UpdatedAt").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("trx_documents");
};
