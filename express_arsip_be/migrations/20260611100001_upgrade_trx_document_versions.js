/**
 * Upgrade trx_document_versions:
 * - Tambah UploadedBy, ApprovalStatus, ApprovedBy, ApprovedAt, ApprovalNotes
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("trx_document_versions", (table) => {
    // Username yang mengupload versi
    table.string("UploadedBy", 50).nullable().after("FilePath");

    // Status approval versi (default pending)
    table
      .enu("ApprovalStatus", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("pending")
      .after("UploadedBy");

    // Siapa yang approve/reject
    table.string("ApprovedBy", 50).nullable().after("ApprovalStatus");

    // Kapan diapprove/reject
    table.datetime("ApprovedAt").nullable().after("ApprovedBy");

    // Catatan approval
    table.text("ApprovalNotes").nullable().after("ApprovedAt");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trx_document_versions", (table) => {
    table.dropColumn("UploadedBy");
    table.dropColumn("ApprovalStatus");
    table.dropColumn("ApprovedBy");
    table.dropColumn("ApprovedAt");
    table.dropColumn("ApprovalNotes");
  });
}
