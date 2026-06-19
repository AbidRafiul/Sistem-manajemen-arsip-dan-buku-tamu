/**
 * Upgrade trx_document_versions:
 * - Tambah uploaded_by, approval_status, approved_by, approved_at, approval_notes
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("trx_document_versions", (table) => {
    // Username yang mengupload versi
    table.string("uploaded_by", 50).nullable().after("file_path");

    // Status approval versi (default pending)
    table
      .enu("approval_status", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("pending")
      .after("uploaded_by");

    // Siapa yang approve/reject
    table.string("approved_by", 50).nullable().after("approval_status");

    // Kapan diapprove/reject
    table.datetime("approved_at").nullable().after("approved_by");

    // Catatan approval
    table.text("approval_notes").nullable().after("approved_at");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trx_document_versions", (table) => {
    table.dropColumn("uploaded_by");
    table.dropColumn("approval_status");
    table.dropColumn("approved_by");
    table.dropColumn("approved_at");
    table.dropColumn("approval_notes");
  });
}