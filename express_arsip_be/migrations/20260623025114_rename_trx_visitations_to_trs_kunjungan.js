/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable("trx_visitations");
  if (hasTable) {
    await knex.schema.renameTable("trx_visitations", "trs_kunjungan");
  }

  // 2. Rename Semua Struktur Kolom di Dalamnya ke Bahasa Indonesia
  await knex.schema.alterTable("trs_kunjungan", (table) => {
    table.renameColumn("visitation_id", "id_kunjungan");
    table.renameColumn("guest_name", "nama_tamu");
    table.renameColumn("phone_number", "nomor_telepon");
    table.renameColumn("guest_email", "email_tamu");
    table.renameColumn("guest_company", "instansi_tamu");
    table.renameColumn("guest_position", "jabatan_tamu");
    table.renameColumn("identity_type", "jenis_identitas");
    table.renameColumn("identity_number", "nomor_identitas");
    table.renameColumn("check_in_time", "waktu_masuk");
    table.renameColumn("check_out_time", "waktu_keluar");
    table.renameColumn("photo_face", "foto_wajah");
    table.renameColumn("photo_identity", "foto_identitas");
    table.renameColumn("host_id_pengguna", "id_user_host");
    table.renameColumn("host_name", "nama_host");
    table.renameColumn("visit_notes", "catatan_kunjungan");
    table.renameColumn("visit_code", "kode_kunjungan");
    table.renameColumn("qr_token", "token_qr");
    table.renameColumn("approval_status", "status_persetujuan");
    table.renameColumn("approval_notes", "catatan_persetujuan");
    table.renameColumn("id_pengguna", "id_user");
    table.renameColumn("visit_purpose_id", "id_tujuan_kunjungan");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable("trs_kunjungan");
  if (hasTable) {
    await knex.schema.alterTable("trs_kunjungan", (table) => {
      table.renameColumn("id_kunjungan", "visitation_id");
      table.renameColumn("nama_tamu", "guest_name");
      table.renameColumn("nomor_telepon", "phone_number");
      table.renameColumn("email_tamu", "guest_email");
      table.renameColumn("instansi_tamu", "guest_company");
      table.renameColumn("jabatan_tamu", "guest_position");
      table.renameColumn("jenis_identitas", "identity_type");
      table.renameColumn("nomor_identitas", "identity_number");
      table.renameColumn("waktu_masuk", "check_in_time");
      table.renameColumn("waktu_keluar", "check_out_time");
      table.renameColumn("foto_wajah", "photo_face");
      table.renameColumn("foto_identitas", "photo_identity");
      table.renameColumn("id_user_host", "host_id_pengguna");
      table.renameColumn("nama_host", "host_name");
      table.renameColumn("catatan_kunjungan", "visit_notes");
      table.renameColumn("kode_kunjungan", "visit_code");
      table.renameColumn("token_qr", "qr_token");
      table.renameColumn("status_persetujuan", "approval_status");
      table.renameColumn("catatan_persetujuan", "approval_notes");
      table.renameColumn("id_user", "id_pengguna");
      table.renameColumn("id_tujuan_kunjungan", "visit_purpose_id");
    });

    await knex.schema.renameTable("trs_kunjungan", "trx_visitations");
  }
}
