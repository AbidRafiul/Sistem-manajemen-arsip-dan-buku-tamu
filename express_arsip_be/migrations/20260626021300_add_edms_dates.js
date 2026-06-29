/**
 * Migration 2: Tambah Kolom Tanggal pada Tabel Transaksi EDMS
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Tambah kolom tanggal_transaksi di trx_documents
  if (!(await knex.schema.hasColumn('trx_documents', 'tanggal_transaksi'))) {
    await knex.schema.alterTable('trx_documents', (table) => {
      table.date('tanggal_transaksi').nullable().after('document_id');
    });
  }

  // 2. Tambah kolom tanggal_transaksi di trx_archive_loans
  if (!(await knex.schema.hasColumn('trx_archive_loans', 'tanggal_transaksi'))) {
    await knex.schema.alterTable('trx_archive_loans', (table) => {
      table.date('tanggal_transaksi').nullable().after('loan_id');
    });
  }

  // 3. Tambah kolom tanggal_transaksi di trx_document_versions
  if (!(await knex.schema.hasColumn('trx_document_versions', 'tanggal_transaksi'))) {
    await knex.schema.alterTable('trx_document_versions', (table) => {
      table.date('tanggal_transaksi').nullable().after('version_id');
    });
  }

  // 4. Tambah kolom tanggal_transaksi di trx_destruction_proposals
  if (!(await knex.schema.hasColumn('trx_destruction_proposals', 'tanggal_transaksi'))) {
    await knex.schema.alterTable('trx_destruction_proposals', (table) => {
      table.date('tanggal_transaksi').nullable().after('proposal_id');
    });
  }

  // 5. Sinkronisasi data dari kolom tanggal asal ke tanggal_transaksi
  if (await knex.schema.hasColumn('trx_documents', 'document_date')) {
    await knex.raw(`
      UPDATE trx_documents 
      SET tanggal_transaksi = document_date 
      WHERE document_date IS NOT NULL AND tanggal_transaksi IS NULL
    `);
  }

  if (await knex.schema.hasColumn('trx_archive_loans', 'loan_date')) {
    await knex.raw(`
      UPDATE trx_archive_loans 
      SET tanggal_transaksi = loan_date 
      WHERE loan_date IS NOT NULL AND tanggal_transaksi IS NULL
    `);
  }

  if (await knex.schema.hasColumn('trx_document_versions', 'created_at')) {
    await knex.raw(`
      UPDATE trx_document_versions 
      SET tanggal_transaksi = DATE(created_at) 
      WHERE created_at IS NOT NULL AND tanggal_transaksi IS NULL
    `);
  }

  if (await knex.schema.hasColumn('trx_destruction_proposals', 'proposed_at')) {
    await knex.raw(`
      UPDATE trx_destruction_proposals 
      SET tanggal_transaksi = DATE(proposed_at) 
      WHERE proposed_at IS NOT NULL AND tanggal_transaksi IS NULL
    `);
  }
}

export async function down(knex) {
  // Hapus kolom tanggal_transaksi jika ada
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'tanggal_transaksi')) {
    await knex.schema.alterTable('trx_destruction_proposals', (table) => {
      table.dropColumn('tanggal_transaksi');
    });
  }

  if (await knex.schema.hasColumn('trx_document_versions', 'tanggal_transaksi')) {
    await knex.schema.alterTable('trx_document_versions', (table) => {
      table.dropColumn('tanggal_transaksi');
    });
  }

  if (await knex.schema.hasColumn('trx_archive_loans', 'tanggal_transaksi')) {
    await knex.schema.alterTable('trx_archive_loans', (table) => {
      table.dropColumn('tanggal_transaksi');
    });
  }

  if (await knex.schema.hasColumn('trx_documents', 'tanggal_transaksi')) {
    await knex.schema.alterTable('trx_documents', (table) => {
      table.dropColumn('tanggal_transaksi');
    });
  }
}
