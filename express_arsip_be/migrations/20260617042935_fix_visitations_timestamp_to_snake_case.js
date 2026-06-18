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

const renameDateTimeIfExists = async (knex, tableName, oldName, newName, extraSQL = "") => {
  if ((await hasColumn(knex, tableName, oldName)) && !(await hasColumn(knex, tableName, newName))) {
    await knex.raw(`ALTER TABLE ?? CHANGE ?? ?? DATETIME NOT NULL ${extraSQL}`, [
      tableName,
      oldName,
      newName,
    ]);
  }
};

// Fungsi bantuan baru untuk memaksa ubah tipe data string/enum (Mencegah bug case-sensitive)
const renameColumnRaw = async (knex, tableName, oldName, newName, typeSQL) => {
  if ((await hasColumn(knex, tableName, oldName)) && !(await hasColumn(knex, tableName, newName))) {
    await knex.raw(`ALTER TABLE ?? CHANGE ?? ?? ${typeSQL}`, [tableName, oldName, newName]);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (await hasTable(knex, 'tr_visitations')) {
    await renameDateTimeIfExists(knex, 'tr_visitations', 'CreatedAt', 'created_at', 'DEFAULT CURRENT_TIMESTAMP');
    await renameDateTimeIfExists(knex, 'tr_visitations', 'UpdatedAt', 'updated_at', 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  }

  if (await hasTable(knex, 'mst_visit_purpose')) {
    await renameIfExists(knex, 'mst_visit_purpose', 'VisitPurposeId', 'visit_purpose_id');
    await renameIfExists(knex, 'mst_visit_purpose', 'VisitPurposeCode', 'visit_purpose_code');
    await renameIfExists(knex, 'mst_visit_purpose', 'VisitPurposeName', 'visit_purpose_name');
    
    await renameColumnRaw(knex, 'mst_visit_purpose', 'Description', 'description', 'VARCHAR(255) NULL');
    await renameColumnRaw(knex, 'mst_visit_purpose', 'Status', 'status', "ENUM('active', 'nonactive') NOT NULL DEFAULT 'active'");
    
    await renameDateTimeIfExists(knex, 'mst_visit_purpose', 'CreatedAt', 'created_at', 'DEFAULT CURRENT_TIMESTAMP');
    await renameDateTimeIfExists(knex, 'mst_visit_purpose', 'UpdatedAt', 'updated_at', 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  if (await hasTable(knex, 'tr_visitations')) {
    await renameDateTimeIfExists(knex, 'tr_visitations', 'created_at', 'CreatedAt', 'DEFAULT CURRENT_TIMESTAMP');
    await renameDateTimeIfExists(knex, 'tr_visitations', 'updated_at', 'UpdatedAt', 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  }

  if (await hasTable(knex, 'mst_visit_purpose')) {
    await renameIfExists(knex, 'mst_visit_purpose', 'visit_purpose_id', 'VisitPurposeId');
    await renameIfExists(knex, 'mst_visit_purpose', 'visit_purpose_code', 'VisitPurposeCode');
    await renameIfExists(knex, 'mst_visit_purpose', 'visit_purpose_name', 'VisitPurposeName');

    await renameColumnRaw(knex, 'mst_visit_purpose', 'description', 'Description', 'VARCHAR(255) NULL');
    await renameColumnRaw(knex, 'mst_visit_purpose', 'status', 'Status', "ENUM('active', 'nonactive') NOT NULL DEFAULT 'active'");
    
    await renameDateTimeIfExists(knex, 'mst_visit_purpose', 'created_at', 'CreatedAt', 'DEFAULT CURRENT_TIMESTAMP');
    await renameDateTimeIfExists(knex, 'mst_visit_purpose', 'updated_at', 'UpdatedAt', 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  }
}