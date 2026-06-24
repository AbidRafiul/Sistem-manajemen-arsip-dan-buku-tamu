/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Nonaktifkan foreign key checks sementara agar proses modifikasi lancar
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Table: user_navigation (Hanya ubah user_id. IdPengguna dilewati karena STORED GENERATED)
  await knex.raw(
    "ALTER TABLE `user_navigation` CHANGE `user_id` `id_pengguna` INT(11) NULL DEFAULT NULL",
  );

  // 2. Table: mst_user_roles
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `user_role_id` `id_peran_pengguna` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `user_id` `id_pengguna` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `role_id` `id_peran` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `is_primary` `peran_utama` TINYINT(4) NULL DEFAULT 0",
  );

  // 3. Table: mst_users
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `user_id` `id_pengguna` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `fullname` `nama_lengkap` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `username` `nama_pengguna` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `email` `surel` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `telp` `telepon` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `password` `kata_sandi` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `branch_id` `id_cabang` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `division_id` `id_divisi` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `department_id` `id_departemen` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `position_id` `id_jabatan` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `work_unit_id` `id_unit_kerja` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `failed_login_attempts` `gagal_masuk` INT(11) NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `last_login_at` `terakhir_login` DATETIME NULL DEFAULT NULL",
  );

  // 4. Table: mst_role_menus
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `role_menu_id` `id_peran_menu` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `role_id` `id_peran` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `menu_id` `id_menu` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `can_view` `hak_lihat` TINYINT(4) NOT NULL DEFAULT 1",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `can_create` `hak_buat` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `can_update` `hak_ubah` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `can_delete` `hak_hapus` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `can_approve` `hak_setuju` TINYINT(4) NOT NULL DEFAULT 0",
  );

  // 5. Table: mst_roles (Di gambar tipe datanya INT(11), bukan UNSIGNED)
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `role_id` `id_peran` INT(11) NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `role_code` `kode_peran` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `role_name` `nama_peran` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `description` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 6. Table: mst_positions
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `position_id` `id_jabatan` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `position_code` `kode_jabatan` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `position_name` `nama_jabatan` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `position_level` `tingkat_jabatan` INT(11) NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `description` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 7. Table: mst_navigation
  await knex.raw(
    "ALTER TABLE `mst_navigation` CHANGE `role` `peran` VARCHAR(50) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 8. Table: mst_menus
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `menu_id` `id_menu` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `parent_menu_id` `id_menu_induk` INT(10) UNSIGNED NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `menu_code` `kode_menu` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `menu_name` `nama_menu` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `menu_path` `jalur_menu` VARCHAR(255) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `menu_icon` `ikon_menu` VARCHAR(100) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `sort_order` `urutan` INT(11) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `is_active` `status_aktif` TINYINT(4) NOT NULL DEFAULT 1",
  );

  // 9. Table: mst_divisions (Di gambar description-nya VARCHAR(45), bukan TEXT)
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `division_id` `id_divisi` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `branch_id` `id_cabang` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `division_code` `kode_divisi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `division_name` `nama_divisi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `description` `deskripsi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 10. Table: mst_departments
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `department_id` `id_departemen` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `division_id` `id_divisi` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `department_code` `kode_departemen` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `department_name` `nama_departemen` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `description` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 11. Table: mst_branches
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `branch_id` `id_cabang` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `branch_code` `kode_cabang` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `branch_name` `nama_cabang` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `address` `alamat` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `telp` `telepon` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `email` `surel` VARCHAR(150) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 12. Table: mst_audit_trails
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `username` `nama_pengguna` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `role` `peran` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `action` `aksi` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `ip_address` `alamat_ip` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `user_agent` `agen_pengguna` TEXT COLLATE utf8mb4_unicode_ci NOT NULL",
  );

  // Aktifkan kembali foreign key checks
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // MENGEMBALIKAN KE NAMA INGGRIS (snake_case) DENGAN TIPE & COLLATION YANG SAMA PERSIS
  await knex.raw(
    "ALTER TABLE `user_navigation` CHANGE `id_pengguna` `user_id` INT(11) NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `id_peran_pengguna` `user_role_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `id_pengguna` `user_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `id_peran` `role_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_user_roles` CHANGE `peran_utama` `is_primary` TINYINT(4) NULL DEFAULT 0",
  );

  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `id_pengguna` `user_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `nama_lengkap` `fullname` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `nama_pengguna` `username` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `surel` `email` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `telepon` `telp` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `kata_sandi` `password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `id_cabang` `branch_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `id_divisi` `division_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `id_departemen` `department_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `id_jabatan` `position_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `id_unit_kerja` `work_unit_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `gagal_masuk` `failed_login_attempts` INT(11) NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_users` CHANGE `terakhir_login` `last_login_at` DATETIME NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `id_peran_menu` `role_menu_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `id_peran` `role_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `id_menu` `menu_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `hak_lihat` `can_view` TINYINT(4) NOT NULL DEFAULT 1",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `hak_buat` `can_create` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `hak_ubah` `can_update` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `hak_hapus` `can_delete` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_role_menus` CHANGE `hak_setuju` `can_approve` TINYINT(4) NOT NULL DEFAULT 0",
  );

  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `id_peran` `role_id` INT(11) NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `kode_peran` `role_code` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `nama_peran` `role_name` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_roles` CHANGE `deskripsi` `description` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `id_jabatan` `position_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `kode_jabatan` `position_code` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `nama_jabatan` `position_name` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `tingkat_jabatan` `position_level` INT(11) NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_positions` CHANGE `deskripsi` `description` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_navigation` CHANGE `peran` `role` VARCHAR(50) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `id_menu` `menu_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `id_menu_induk` `parent_menu_id` INT(10) UNSIGNED NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `kode_menu` `menu_code` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `nama_menu` `menu_name` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `jalur_menu` `menu_path` VARCHAR(255) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `ikon_menu` `menu_icon` VARCHAR(100) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `urutan` `sort_order` INT(11) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `status_aktif` `is_active` TINYINT(4) NOT NULL DEFAULT 1",
  );

  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `id_divisi` `division_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `id_cabang` `branch_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `kode_divisi` `division_code` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `nama_divisi` `division_name` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisions` CHANGE `deskripsi` `description` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `id_departemen` `department_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `id_divisi` `division_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `kode_departemen` `department_code` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `nama_departemen` `department_name` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departments` CHANGE `deskripsi` `description` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `id_cabang` `branch_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `kode_cabang` `branch_code` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `nama_cabang` `branch_name` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `alamat` `address` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `telepon` `telp` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_branches` CHANGE `surel` `email` VARCHAR(150) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `nama_pengguna` `username` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `peran` `role` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `aksi` `action` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `alamat_ip` `ip_address` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_audit_trails` CHANGE `agen_pengguna` `user_agent` TEXT COLLATE utf8mb4_unicode_ci NOT NULL",
  );

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
