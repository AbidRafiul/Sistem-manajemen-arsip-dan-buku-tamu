/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('trx_visitations', (table) => {
    // 1. Kolom Identitas Tamu Dasar
    table.increments('VisitationId').primary();
    table.string('GuestName', 100).notNullable();
    table.string('PhoneNumber', 45).notNullable(); 
    table.string('GuestEmail', 150).nullable(); 
    table.string('GuestCompany', 100).notNullable();
    table.string('GuestPosition', 20).nullable(); 
    table.enum('IdentityType', ['ktp', 'sim', 'paspor']).nullable(); 
    table.string('IdentityNumber', 50).nullable(); 
    
    // 2. Waktu Kunjungan & Berkas Dokumentasi MinIO
    table.datetime('CheckInTime').nullable(); 
    table.datetime('CheckOutTime').nullable();
    table.string('PhotoFace', 255).nullable(); 
    table.string('PhotoIdentity', 255).nullable(); 
    table.enum('Status', ['in', 'out']).notNullable().defaultTo('in');
    
    // 3. Kolom Tambahan Fitur QR Token, Kode Kunjungan & Approval Internal
    table.string('HostUserId', 36).nullable(); 
    table.string('HostName', 100).nullable(); 
    table.text('VisitNotes').nullable(); 
    table.string('VisitCode', 30).nullable(); 
    table.string('QRToken', 100).nullable(); 
    table.enum('ApprovalStatus', ['pending', 'approved', 'rejected']).notNullable().defaultTo('approved');
    table.text('ApprovalNotes').nullable(); 

    // 4. Kolom Relasi (UBAH JADI SEPERTI INI: Kolom biasa agar tidak eror di DB kosong)
    table.integer('UserId').unsigned().nullable();
    table.integer('VisitPurposeId').nullable(); 

    // 5. Timestamps Data
    table.datetime('CreatedAt').notNullable().defaultTo(knex.fn.now());
    table.datetime('UpdatedAt').notNullable().defaultTo(knex.fn.now());

    // 6. Unique Constraints & Indexing Optimasi Kecepatan Query
    table.unique('QRToken', 'uq_visitation_qr');
    table.unique('VisitCode', 'uq_visitation_code');
    table.index('Status', 'idx_visit_status');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Menghapus tabel trx_visitations saat rollback dijalankan
  await knex.schema.dropTableIfExists('trx_visitations');
}