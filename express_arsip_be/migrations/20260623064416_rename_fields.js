const withSafeRawAlter = (knex) => {
  const originalRaw = knex.raw.bind(knex);

  const safeRaw = async (...args) => {
    const sql = typeof args[0] === "string" ? args[0] : "";

    try {
      return await originalRaw(...args);
    } catch (error) {
      const isAlterChange = /^\s*ALTER\s+TABLE\s+`?[\w]+`?\s+CHANGE\s+/i.test(
        sql,
      );
      const skippableCodes = new Set([
        "ER_NO_SUCH_TABLE",
        "ER_BAD_FIELD_ERROR",
        "ER_DUP_FIELDNAME",
        "ER_CANT_DROP_FIELD_OR_KEY",
      ]);

      if (isAlterChange && skippableCodes.has(error?.code)) {
        return [];
      }

      throw error;
    }
  };

  return new Proxy(knex, {
    get(target, prop, receiver) {
      if (prop === "raw") return safeRaw;

      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, thisArg, argArray);
    },
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  knex = withSafeRawAlter(knex);

  // Nonaktifkan foreign key checks sementara agar proses modifikasi lancar
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Table: navigasi_pengguna (Hanya ubah nama_pengguna. IdPengguna dilewati karena STORED GENERATED)
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `nama_pengguna` `id_pengguna` INT(11) NULL DEFAULT NULL",
  );

  // 2. Table: mst_pengguna_perans
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_peran_pengguna` `id_peran_pengguna` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `nama_pengguna` `id_pengguna` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_peran` `id_peran` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `peran_utama` `peran_utama` TINYINT(4) NULL DEFAULT 0",
  );

  // 3. Table: mst_pengguna
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_pengguna` `id_pengguna` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_lengkap` `nama_lengkap` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `NamaPengguna` `nama_pengguna` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `surel` `surel` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `telepon` `telepon` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `password` `kata_sandi` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_cabang` `id_cabang` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_divisi` `id_divisi` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_departemen` `id_departemen` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_jabatan` `id_jabatan` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `mst_unit_kerja` `mst_unit_kerja` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `gagal_masuk` `gagal_masuk` INT(11) NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `terakhir_login` `terakhir_login` DATETIME NULL DEFAULT NULL",
  );

  // 4. Table: mst_peran_menus
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `peran_menu_id` `id_peran_menu` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `id_peran` `id_peran` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `menu_id` `id_menu` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_view` `hak_lihat` TINYINT(4) NOT NULL DEFAULT 1",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_create` `hak_buat` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_update` `hak_ubah` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_delete` `hak_hapus` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_approve` `hak_setuju` TINYINT(4) NOT NULL DEFAULT 0",
  );

  // 5. Table: mst_perans (Di gambar tipe datanya INT(11), bukan UNSIGNED)
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `id_peran` `id_peran` INT(11) NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `kode_peran` `kode_peran` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `nama_peran` `nama_peran` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `deskripsi` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 6. Table: mst_jabatan
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `id_jabatan` `id_jabatan` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `kode_jabatan` `kode_jabatan` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `nama_jabatan` `nama_jabatan` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `tingkat_jabatan` `tingkat_jabatan` INT(11) NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `deskripsi` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 7. Table: mst_navigasi
  await knex.raw(
    "ALTER TABLE `mst_navigasi` CHANGE `peran` `peran` VARCHAR(50) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
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

  // 9. Table: mst_divisi (Di gambar deskripsi-nya VARCHAR(45), bukan TEXT)
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `id_divisi` `id_divisi` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `id_cabang` `id_cabang` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `kode_divisi` `kode_divisi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `nama_divisi` `nama_divisi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `deskripsi` `deskripsi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 10. Table: mst_departemens
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `id_departemen` `id_departemen` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `id_divisi` `id_divisi` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `department_code` `kode_departemen` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `department_name` `nama_departemen` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `deskripsi` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 11. Table: mst_cabanges
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `id_cabang` `id_cabang` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `kode_cabang` `kode_cabang` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `nama_cabang` `nama_cabang` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `alamat` `alamat` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `telepon` `telepon` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `surel` `surel` VARCHAR(150) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  // 12. Table: mst_riwayat_audit
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `nama_pengguna` `nama_pengguna` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `peran` `peran` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `action` `aksi` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `ip_alamat` `alamat_ip` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `user_agent` `agen_pengguna` TEXT COLLATE utf8mb4_unicode_ci NOT NULL",
  );

  // Aktifkan kembali foreign key checks
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  knex = withSafeRawAlter(knex);

  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // MENGEMBALIKAN KE NAMA INGGRIS (snake_case) DENGAN TIPE & COLLATION YANG SAMA PERSIS
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `id_pengguna` `nama_pengguna` INT(11) NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_peran_pengguna` `id_peran_pengguna` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_pengguna` `nama_pengguna` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_peran` `id_peran` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `peran_utama` `peran_utama` TINYINT(4) NULL DEFAULT 0",
  );

  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_pengguna` `nama_pengguna` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_lengkap` `nama_lengkap` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_pengguna` `NamaPengguna` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `surel` `surel` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `telepon` `telepon` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `kata_sandi` `password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_cabang` `id_cabang` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_divisi` `id_divisi` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_departemen` `id_departemen` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_jabatan` `id_jabatan` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `mst_unit_kerja` `mst_unit_kerja` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `gagal_masuk` `gagal_masuk` INT(11) NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `terakhir_login` `terakhir_login` DATETIME NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `id_peran_menu` `peran_menu_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `id_peran` `id_peran` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `id_menu` `menu_id` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `hak_lihat` `can_view` TINYINT(4) NOT NULL DEFAULT 1",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `hak_buat` `can_create` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `hak_ubah` `can_update` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `hak_hapus` `can_delete` TINYINT(4) NOT NULL DEFAULT 0",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `hak_setuju` `can_approve` TINYINT(4) NOT NULL DEFAULT 0",
  );

  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `id_peran` `id_peran` INT(11) NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `kode_peran` `kode_peran` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `nama_peran` `nama_peran` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_perans` CHANGE `deskripsi` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `id_jabatan` `id_jabatan` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `kode_jabatan` `kode_jabatan` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `nama_jabatan` `nama_jabatan` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `tingkat_jabatan` `tingkat_jabatan` INT(11) NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `deskripsi` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_navigasi` CHANGE `peran` `peran` VARCHAR(50) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
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
    "ALTER TABLE `mst_divisi` CHANGE `id_divisi` `id_divisi` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `id_cabang` `id_cabang` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `kode_divisi` `kode_divisi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `nama_divisi` `nama_divisi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `deskripsi` `deskripsi` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `id_departemen` `id_departemen` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `id_divisi` `id_divisi` INT(10) UNSIGNED NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `kode_departemen` `department_code` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `nama_departemen` `department_name` VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `deskripsi` `deskripsi` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `id_cabang` `id_cabang` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `kode_cabang` `kode_cabang` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `nama_cabang` `nama_cabang` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `alamat` `alamat` TEXT COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `telepon` `telepon` VARCHAR(45) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `surel` `surel` VARCHAR(150) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL",
  );

  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `nama_pengguna` `nama_pengguna` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `peran` `peran` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `aksi` `action` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `alamat_ip` `ip_alamat` VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `agen_pengguna` `user_agent` TEXT COLLATE utf8mb4_unicode_ci NOT NULL",
  );

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
