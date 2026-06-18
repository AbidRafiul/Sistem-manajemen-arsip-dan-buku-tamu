// ==========================================
// 🛠️ HELPER FUNCTIONS (MENIRU POLA TIM)
// ==========================================
const hasTable = (knex, tableName) => knex.schema.hasTable(tableName);

const hasColumn = async (knex, tableName, columnName) => {
  if (!(await hasTable(knex, tableName))) {
    return false;
  }
  return knex.schema.hasColumn(tableName, columnName);
};

const renameIfExists = async (knex, tableName, oldName, newName) => {
  if ((await hasColumn(knex, tableName, oldName)) && !(await hasColumn(knex, tableName, newName))) {
    await knex.schema.table(tableName, (table) => {
      table.renameColumn(oldName, newName);
    });
  }
};

// Khusus Datetime/Timestamp agar default value CURRENT_TIMESTAMP tidak hilang di MySQL
const renameDateTimeIfExists = async (knex, tableName, oldName, newName, extraSQL = "") => {
  if ((await hasColumn(knex, tableName, oldName)) && !(await hasColumn(knex, tableName, newName))) {
    await knex.raw(`ALTER TABLE ?? CHANGE ?? ?? DATETIME NOT NULL ${extraSQL}`, [
      tableName,
      oldName,
      newName,
    ]);
  }
};

// ==========================================
// 🚀 MAIN MIGRATION
// ==========================================
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Rename nama tabel jika masih menggunakan nama lama 'trx_visitations'
  const hasOldTable = await knex.schema.hasTable('trx_visitations');
  if (hasOldTable) {
    await knex.schema.renameTable('trx_visitations', 'tr_visitations');
  }

  // 2. Rename kolom-kolom utama ke snake_case (Aman dari bypass conditional)
  await renameIfExists(knex, 'tr_visitations', 'VisitationId', 'visitation_id');
  await renameIfExists(knex, 'tr_visitations', 'GuestName', 'guest_name');
  await renameIfExists(knex, 'tr_visitations', 'PhoneNumber', 'phone_number');
  await renameIfExists(knex, 'tr_visitations', 'GuestEmail', 'guest_email');
  await renameIfExists(knex, 'tr_visitations', 'GuestCompany', 'guest_company');
  await renameIfExists(knex, 'tr_visitations', 'GuestPosition', 'guest_position');
  await renameIfExists(knex, 'tr_visitations', 'IdentityType', 'identity_type');
  await renameIfExists(knex, 'tr_visitations', 'IdentityNumber', 'identity_number');
  await renameIfExists(knex, 'tr_visitations', 'CheckInTime', 'check_in_time');
  await renameIfExists(knex, 'tr_visitations', 'CheckOutTime', 'check_out_time');
  await renameIfExists(knex, 'tr_visitations', 'PhotoFace', 'photo_face');
  await renameIfExists(knex, 'tr_visitations', 'PhotoIdentity', 'photo_identity');
  await renameIfExists(knex, 'tr_visitations', 'Status', 'status');
  await renameIfExists(knex, 'tr_visitations', 'HostUserId', 'host_user_id');
  await renameIfExists(knex, 'tr_visitations', 'HostName', 'host_name');
  await renameIfExists(knex, 'tr_visitations', 'VisitNotes', 'visit_notes');
  await renameIfExists(knex, 'tr_visitations', 'VisitCode', 'visit_code');
  await renameIfExists(knex, 'tr_visitations', 'QRToken', 'qr_token');
  await renameIfExists(knex, 'tr_visitations', 'ApprovalStatus', 'approval_status');
  await renameIfExists(knex, 'tr_visitations', 'ApprovalNotes', 'approval_notes');
  await renameIfExists(knex, 'tr_visitations', 'UserId', 'user_id');
  await renameIfExists(knex, 'tr_visitations', 'VisitPurposeId', 'visit_purpose_id');

  // 3. Rename Khusus Timestamp (Mengatasi bug PascalCase yang tertinggal di laptopmu)
  await renameDateTimeIfExists(knex, 'tr_visitations', 'CreatedAt', 'created_at', 'DEFAULT CURRENT_TIMESTAMP');
  await renameDateTimeIfExists(knex, 'tr_visitations', 'UpdatedAt', 'updated_at', 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasNewTable = await knex.schema.hasTable('tr_visitations');
  if (hasNewTable) {
    await renameIfExists(knex, 'tr_visitations', 'visitation_id', 'VisitationId');
    await renameIfExists(knex, 'tr_visitations', 'guest_name', 'GuestName');
    await renameIfExists(knex, 'tr_visitations', 'phone_number', 'PhoneNumber');
    await renameIfExists(knex, 'tr_visitations', 'guest_email', 'GuestEmail');
    await renameIfExists(knex, 'tr_visitations', 'guest_company', 'GuestCompany');
    await renameIfExists(knex, 'tr_visitations', 'guest_position', 'GuestPosition');
    await renameIfExists(knex, 'tr_visitations', 'identity_type', 'IdentityType');
    await renameIfExists(knex, 'tr_visitations', 'identity_number', 'IdentityNumber');
    await renameIfExists(knex, 'tr_visitations', 'check_in_time', 'CheckInTime');
    await renameIfExists(knex, 'tr_visitations', 'check_out_time', 'CheckOutTime');
    await renameIfExists(knex, 'tr_visitations', 'photo_face', 'PhotoFace');
    await renameIfExists(knex, 'tr_visitations', 'photo_identity', 'PhotoIdentity');
    await renameIfExists(knex, 'tr_visitations', 'status', 'Status');
    await renameIfExists(knex, 'tr_visitations', 'host_user_id', 'HostUserId');
    await renameIfExists(knex, 'tr_visitations', 'host_name', 'HostName');
    await renameIfExists(knex, 'tr_visitations', 'visit_notes', 'VisitNotes');
    await renameIfExists(knex, 'tr_visitations', 'visit_code', 'VisitCode');
    await renameIfExists(knex, 'tr_visitations', 'qr_token', 'QRToken');
    await renameIfExists(knex, 'tr_visitations', 'approval_status', 'ApprovalStatus');
    await renameIfExists(knex, 'tr_visitations', 'approval_notes', 'ApprovalNotes');
    await renameIfExists(knex, 'tr_visitations', 'user_id', 'UserId');
    await renameIfExists(knex, 'tr_visitations', 'visit_purpose_id', 'VisitPurposeId');

    await renameDateTimeIfExists(knex, 'tr_visitations', 'created_at', 'CreatedAt', 'DEFAULT CURRENT_TIMESTAMP');
    await renameDateTimeIfExists(knex, 'tr_visitations', 'updated_at', 'UpdatedAt', 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    await knex.schema.renameTable('tr_visitations', 'trx_visitations');
  }
}