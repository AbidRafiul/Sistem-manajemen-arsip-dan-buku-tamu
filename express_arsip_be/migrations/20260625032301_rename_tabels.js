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
    mst_users: "mst_pengguna",
    mst_role_menus: "mst_peran_menu",
    mst_roles: "mst_peran",
    mst_jabatan: "mst_jabatan",
    mst_navigation: "mst_navigasi",
    mst_menus: "mst_menu",
    mst_divisions: "mst_divisi",
    mst_departments: "mst_departemen",
    mst_branches: "mst_cabang",
    mst_audit_trails: "mst_riwayat_audit",
    mst_work_units: "mst_unit_kerja",
  };

  for (const [oldName, newName] of Object.entries(tableMap)) {
    const exists = await knex.schema.hasTable(oldName);
    if (exists) {
      await knex.raw(`RENAME TABLE \`${oldName}\` TO \`${newName}\``);
      console.log(`Tabel ${oldName} berhasil diubah ke ${newName}`);
    }
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Rollback Rename Tabel
  await knex.raw("RENAME TABLE `mst_pengguna_peran` TO `mst_user_roles`");
  await knex.raw("RENAME TABLE `mst_pengguna` TO `mst_users`");
  await knex.raw("RENAME TABLE `mst_peran_menu` TO `mst_role_menus`");
  await knex.raw("RENAME TABLE `mst_peran` TO `mst_roles`");
  await knex.raw("RENAME TABLE `mst_jabatan` TO `mst_jabatan`");
  await knex.raw("RENAME TABLE `mst_navigasi` TO `mst_navigation`");
  await knex.raw("RENAME TABLE `mst_menu` TO `mst_menus`");
  await knex.raw("RENAME TABLE `mst_divisi` TO `mst_divisions`");
  await knex.raw("RENAME TABLE `mst_departemen` TO `mst_departments`");
  await knex.raw("RENAME TABLE `mst_cabang` TO `mst_branches`");
  await knex.raw("RENAME TABLE `mst_riwayat_audit` TO `mst_audit_trails`");
  await knex.raw("RENAME TABLE `mst_unit_kerja` TO `mst_work_units`");

  // 2. Rollback Field mst_work_units
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

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
