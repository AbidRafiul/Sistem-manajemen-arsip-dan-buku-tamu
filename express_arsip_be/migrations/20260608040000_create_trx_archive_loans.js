/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("trx_archive_loans", (table) => {
    table.increments("LoanId").primary();
    table.integer("DocumentId").unsigned().notNullable();
    table.string("BorrowerName").notNullable();
    table.date("LoanDate").notNullable();
    table.date("ReturnDate").nullable();
    table.text("Purpose").nullable();
    table
      .enu("Status", [
        "pending",
        "approved",
        "borrowed",
        "returned",
        "rejected",
      ])
      .notNullable()
      .defaultTo("pending");
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
  await knex.schema.dropTableIfExists("trx_archive_loans");
}
