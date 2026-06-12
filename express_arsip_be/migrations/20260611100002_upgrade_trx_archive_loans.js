/**
 * Upgrade trx_archive_loans:
 * - Tambah ExpectedReturnDate, ApprovedBy, ApprovedAt, ApprovalNotes, IsOverdue
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("trx_archive_loans", (table) => {
    // Tanggal wajib kembali (diisi saat pengajuan)
    table.date("ExpectedReturnDate").nullable().after("LoanDate");

    // Siapa yang approve peminjaman
    table.string("ApprovedBy", 50).nullable().after("Purpose");

    // Kapan diapprove
    table.datetime("ApprovedAt").nullable().after("ApprovedBy");

    // Catatan approval / penolakan
    table.text("ApprovalNotes").nullable().after("ApprovedAt");

    // Flag terlambat dikembalikan (1 = overdue)
    table.tinyint("IsOverdue").notNullable().defaultTo(0).after("ApprovalNotes");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("trx_archive_loans", (table) => {
    table.dropColumn("ExpectedReturnDate");
    table.dropColumn("ApprovedBy");
    table.dropColumn("ApprovedAt");
    table.dropColumn("ApprovalNotes");
    table.dropColumn("IsOverdue");
  });
}
