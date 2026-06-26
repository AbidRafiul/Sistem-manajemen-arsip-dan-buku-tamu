/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // ==================================================
  // BAGIAN 1: PERBAIKAN FIELD KHUSUS UNIT KERJA
  // ==================================================
  const unitWorkExists = await knex.schema.hasTable("mst_work_units");
  if (unitWorkExists) {
    // Kita cek apakah field lama masih ada sebelum diubah
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `work_unit_id` `id_unit_kerja` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `department_id` `id_departemen` INT(10) UNSIGNED NOT NULL",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `work_unit_code` `kode_unit_kerja` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `work_unit_name` `nama_unit_kerja` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `description` `deskripsi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
    );
    console.log("Field mst_work_units berhasil diubah ke Bahasa Indonesia");
  }

  // ==================================================
  // BAGIAN 2: RENAME SEMUA TABEL
  // ==================================================
  const tableMap = {
    mst_user_roles: "mst_pengguna_peran",
    mst_pengguna_perans: "mst_pengguna_peran",
    mst_users: "mst_pengguna",
    mst_role_menus: "mst_peran_menu",
    mst_peran_menus: "mst_peran_menu",
    mst_roles: "mst_peran",
    mst_perans: "mst_peran",
    mst_jabatan: "mst_jabatan",
    mst_navigation: "mst_navigasi",
    mst_menus: "mst_menu",
    mst_divisions: "mst_divisi",
    mst_departments: "mst_departemen",
    mst_departemens: "mst_departemen",
    mst_branches: "mst_cabang",
    mst_cabanges: "mst_cabang",
    mst_audit_trails: "mst_riwayat_audit",
    mst_work_units: "mst_unit_kerja",
  };

  for (const [oldName, newName] of Object.entries(tableMap)) {
    if (oldName === newName) continue;
    const exists = await knex.schema.hasTable(oldName);
    const destExists = await knex.schema.hasTable(newName);
    if (exists && !destExists) {
      await knex.raw(`RENAME TABLE \`${oldName}\` TO \`${newName}\``);
      console.log(`Tabel ${oldName} berhasil diubah ke ${newName}`);
    }
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Rollback Rename Tabel
  const rollbackMap = {
    mst_pengguna_peran: "mst_user_roles",
    mst_pengguna: "mst_users",
    mst_peran_menu: "mst_role_menus",
    mst_peran: "mst_roles",
    mst_jabatan: "mst_jabatan",
    mst_navigasi: "mst_navigation",
    mst_menu: "mst_menus",
    mst_divisi: "mst_divisions",
    mst_departemen: "mst_departments",
    mst_cabang: "mst_branches",
    mst_riwayat_audit: "mst_audit_trails",
    mst_unit_kerja: "mst_work_units",
  };

  for (const [oldName, newName] of Object.entries(rollbackMap)) {
    if (oldName === newName) continue;
    const exists = await knex.schema.hasTable(oldName);
    const destExists = await knex.schema.hasTable(newName);
    if (exists && !destExists) {
      await knex.raw(`RENAME TABLE \`${oldName}\` TO \`${newName}\``);
      console.log(`Rollback Tabel ${oldName} ke ${newName}`);
    }
  }

  // 2. Rollback Field mst_work_units
  const hasWorkUnits = await knex.schema.hasTable("mst_work_units");
  if (hasWorkUnits) {
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `id_unit_kerja` `work_unit_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `id_departemen` `department_id` INT(10) UNSIGNED NOT NULL",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `kode_unit_kerja` `work_unit_code` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `nama_unit_kerja` `work_unit_name` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
    );
    await knex.raw(
      "ALTER TABLE `mst_work_units` CHANGE `deskripsi` `description` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
    );
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

