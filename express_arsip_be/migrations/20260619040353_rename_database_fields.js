/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 0. Rename Tabel tr_visitations -> trx_visitations
  await knex.schema.renameTable("tr_visitations", "trx_visitations");

  // 1. Table: access_token
  await knex.raw("ALTER TABLE `access_token` CHANGE `ID` TO `id`");
  await knex.raw("ALTER TABLE `access_token` CHANGE `Token` TO `token`");
  await knex.raw("ALTER TABLE `access_token` CHANGE `Expired` TO `expired`");
  await knex.raw("ALTER TABLE `access_token` CHANGE `Datetime` TO `datetime`");

  // 2. Table: config
  await knex.raw("ALTER TABLE `config` CHANGE `Id` TO `id`");
  await knex.raw("ALTER TABLE `config` CHANGE `Kode` TO `kode`");
  await knex.raw("ALTER TABLE `config` CHANGE `Keterangan` TO `keterangan`");

  // 3. Table: log
  await knex.raw("ALTER TABLE `log` CHANGE `ID` TO `id`");
  await knex.raw("ALTER TABLE `log` CHANGE `Tgl` TO `tgl`");
  await knex.raw("ALTER TABLE `log` CHANGE `Controller` TO `controller`");
  await knex.raw("ALTER TABLE `log` CHANGE `Function` TO `function`");
  await knex.raw("ALTER TABLE `log` CHANGE `Request` TO `request`");
  await knex.raw("ALTER TABLE `log` CHANGE `Response` TO `response`");
  await knex.raw("ALTER TABLE `log` CHANGE `Stack` TO `stack`");
  await knex.raw("ALTER TABLE `log` CHANGE `User` TO `user`");
  await knex.raw("ALTER TABLE `log` CHANGE `DateTime` TO `datetime`");

  // 4. Table: mst_riwayat_audit
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `Id` TO `id`");
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `nama_pengguna` TO `nama_pengguna`",
  );
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `peran` TO `peran`");
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `Action` TO `action`");
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `Ipalamat` TO `ip_alamat`",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `UserAgent` TO `user_agent`",
  );
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `CreatedAt` TO `created_at`",
  );

  // 5. Table: mst_cabanges
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `IdCabang` TO `id_cabang`");
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `BranchCode` TO `kode_cabang`",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `BranchName` TO `nama_cabang`",
  );
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `alamat` TO `alamat`");
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `telepon` TO `telepon`");
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `surel` TO `surel`");
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 6. Table: mst_divisi
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `IdDivisi` TO `id_divisi`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `IdCabang` TO `id_cabang`");
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `DivisionCode` TO `kode_divisi`",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `DivisionName` TO `nama_divisi`",
  );
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `deskripsi` TO `deskripsi`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `Status` TO `status`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `CreatedAt` TO `created_at`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `UpdatedAt` TO `updated_at`");

  // 7. Table: mst_departemens
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `IdDepartemen` TO `id_departemen`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `IdDivisi` TO `id_divisi`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `DepartmentCode` TO `department_code`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `DepartmentName` TO `department_name`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `deskripsi` TO `deskripsi`",
  );
  await knex.raw("ALTER TABLE `mst_departemens` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 8. Table: mst_jabatan
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `IdJabatan` TO `id_jabatan`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `PositionCode` TO `kode_jabatan`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `PositionName` TO `nama_jabatan`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `PositionLevel` TO `tingkat_jabatan`",
  );
  await knex.raw("ALTER TABLE `mst_jabatan` CHANGE `deskripsi` TO `deskripsi`");
  await knex.raw("ALTER TABLE `mst_jabatan` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 9. Table: mst_unit_kerja
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `IdUnitKerja` TO `mst_unit_kerja`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `IdDepartemen` TO `id_departemen`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `WorkUnitCode` TO `kode_unit_kerja`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `WorkUnitName` TO `work_unit_name`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `deskripsi` TO `deskripsi`",
  );
  await knex.raw("ALTER TABLE `mst_unit_kerja` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 10. Table: mst_pengguna
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `NamaPengguna` TO `nama_pengguna`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_lengkap` TO `nama_lengkap`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_pengguna` TO `nama_pengguna`",
  );
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `surel` TO `surel`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `telepon` TO `telepon`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `Password` TO `password`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `IdCabang` TO `id_cabang`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `IdDivisi` TO `id_divisi`");
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `IdDepartemen` TO `id_departemen`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `IdJabatan` TO `id_jabatan`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `IdUnitKerja` TO `mst_unit_kerja`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `FailedLoginAttempts` TO `gagal_masuk`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `LastLoginAt` TO `terakhir_login`",
  );
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 11. Table: mst_perans
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `peranId` TO `id_peran`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `peranCode` TO `kode_peran`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `peranName` TO `nama_peran`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `deskripsi` TO `deskripsi`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `Status` TO `status`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `CreatedAt` TO `created_at`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `UpdatedAt` TO `updated_at`");

  // 12. Table: mst_pengguna_perans
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `UserperanId` TO `id_peran_pengguna`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `NamaPengguna` TO `nama_pengguna`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `peranId` TO `id_peran`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `IsPrimary` TO `peran_utama`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `Status` TO `status`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 13. Table: mst_menus
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `MenuId` TO `menu_id`");
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `ParentMenuId` TO `parent_menu_id`",
  );
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `MenuCode` TO `menu_code`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `MenuName` TO `menu_name`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `MenuPath` TO `menu_path`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `MenuIcon` TO `menu_icon`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `SortOrder` TO `sort_order`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `IsActive` TO `is_active`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `CreatedAt` TO `created_at`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `UpdatedAt` TO `updated_at`");

  // 14. Table: mst_peran_menus
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `peranMenuId` TO `peran_menu_id`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `peranId` TO `id_peran`",
  );
  await knex.raw("ALTER TABLE `mst_peran_menus` CHANGE `MenuId` TO `menu_id`");
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `CanView` TO `can_view`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `CanCreate` TO `can_create`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `CanUpdate` TO `can_update`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `CanDelete` TO `can_delete`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `CanApprove` TO `can_approve`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 15. Table: mst_navigasi
  await knex.raw("ALTER TABLE `mst_navigasi` CHANGE `Id` TO `id`");
  await knex.raw("ALTER TABLE `mst_navigasi` CHANGE `Menu` TO `menu`");
  await knex.raw("ALTER TABLE `mst_navigasi` CHANGE `peran` TO `peran`");
  await knex.raw(
    "ALTER TABLE `mst_navigasi` CHANGE `CreatedAt` TO `created_at`",
  );

  // 16. Table: navigasi_pengguna
  await knex.raw("ALTER TABLE `navigasi_pengguna` CHANGE `Id` TO `id`");
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `NamaPengguna` TO `nama_pengguna`",
  );
  await knex.raw("ALTER TABLE `navigasi_pengguna` CHANGE `Menu` TO `menu`");
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 17. Table: user_credential
  await knex.raw("ALTER TABLE `user_credential` CHANGE `Id` TO `id`");
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `UniqueId` TO `unique_id`",
  );
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `nama_pengguna` TO `nama_pengguna`",
  );
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `nama_lengkap` TO `nama_lengkap`",
  );
  await knex.raw("ALTER TABLE `user_credential` CHANGE `telepon` TO `telepon`");
  await knex.raw("ALTER TABLE `user_credential` CHANGE `peran` TO `peran`");
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `Password` TO `password`",
  );
  await knex.raw("ALTER TABLE `user_credential` CHANGE `Status` TO `status`");
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `CreatedAt` TO `created_at`",
  );
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `UpdatedAt` TO `updated_at`",
  );

  // 18. Table: nomor_faktur
  await knex.raw("ALTER TABLE `nomor_faktur` CHANGE `Kode` TO `kode`");
  await knex.raw("ALTER TABLE `nomor_faktur` CHANGE `Id` TO `id`");

  // 19. Table: mst_visit_purpose
  await knex.raw(
    "ALTER TABLE `mst_visit_purpose` CHANGE `deskripsi` TO `deskripsi`",
  );
  await knex.raw("ALTER TABLE `mst_visit_purpose` CHANGE `Status` TO `status`");

  // 20. Table: trx_visitations
  await knex.raw("ALTER TABLE `trx_visitations` CHANGE `Status` TO `status`");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("ALTER TABLE `trx_visitations` CHANGE `status` TO `Status`");

  await knex.raw(
    "ALTER TABLE `mst_visit_purpose` CHANGE `deskripsi` TO `deskripsi`",
  );
  await knex.raw(
    "ALTER TABLE `mst_visit_purpose` RENAME COLUMN `status` TO `Status`",
  );

  await knex.raw("ALTER TABLE `nomor_faktur` CHANGE `kode` TO `Kode`");
  await knex.raw("ALTER TABLE `nomor_faktur` CHANGE `id` TO `Id`");

  await knex.raw("ALTER TABLE `user_credential` CHANGE `id` TO `Id`");
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `unique_id` TO `UniqueId`",
  );
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `nama_pengguna` TO `nama_pengguna`",
  );
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `nama_lengkap` TO `nama_lengkap`",
  );
  await knex.raw("ALTER TABLE `user_credential` CHANGE `telepon` TO `telepon`");
  await knex.raw("ALTER TABLE `user_credential` CHANGE `peran` TO `peran`");
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `password` TO `Password`",
  );
  await knex.raw("ALTER TABLE `user_credential` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `user_credential` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw("ALTER TABLE `navigasi_pengguna` CHANGE `id` TO `Id`");
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `nama_pengguna` TO `NamaPengguna`",
  );
  await knex.raw("ALTER TABLE `navigasi_pengguna` CHANGE `menu` TO `Menu`");
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `navigasi_pengguna` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw("ALTER TABLE `mst_navigasi` CHANGE `id` TO `Id`");
  await knex.raw("ALTER TABLE `mst_navigasi` CHANGE `menu` TO `Menu`");
  await knex.raw("ALTER TABLE `mst_navigasi` CHANGE `peran` TO `peran`");
  await knex.raw(
    "ALTER TABLE `mst_navigasi` CHANGE `created_at` TO `CreatedAt`",
  );

  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `peran_menu_id` TO `peranMenuId`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `id_peran` TO `peranId`",
  );
  await knex.raw("ALTER TABLE `mst_peran_menus` CHANGE `menu_id` TO `MenuId`");
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_view` TO `CanView`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_create` TO `CanCreate`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_update` TO `CanUpdate`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_delete` TO `CanDelete`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `can_approve` TO `CanApprove`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_peran_menus` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw("ALTER TABLE `mst_menus` CHANGE `menu_id` TO `MenuId`");
  await knex.raw(
    "ALTER TABLE `mst_menus` CHANGE `parent_menu_id` TO `ParentMenuId`",
  );
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `menu_code` TO `MenuCode`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `menu_name` TO `MenuName`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `menu_path` TO `MenuPath`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `menu_icon` TO `MenuIcon`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `sort_order` TO `SortOrder`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `is_active` TO `IsActive`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `created_at` TO `CreatedAt`");
  await knex.raw("ALTER TABLE `mst_menus` CHANGE `updated_at` TO `UpdatedAt`");

  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_peran_pengguna` TO `UserperanId`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `nama_pengguna` TO `NamaPengguna`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `id_peran` TO `peranId`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `peran_utama` TO `IsPrimary`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `status` TO `Status`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna_perans` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw("ALTER TABLE `mst_perans` CHANGE `id_peran` TO `peranId`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `kode_peran` TO `peranCode`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `nama_peran` TO `peranName`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `deskripsi` TO `deskripsi`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `status` TO `Status`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `created_at` TO `CreatedAt`");
  await knex.raw("ALTER TABLE `mst_perans` CHANGE `updated_at` TO `UpdatedAt`");

  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_pengguna` TO `NamaPengguna`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_lengkap` TO `nama_lengkap`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `nama_pengguna` TO `nama_pengguna`",
  );
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `surel` TO `surel`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `telepon` TO `telepon`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `password` TO `Password`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `id_cabang` TO `IdCabang`");
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `id_divisi` TO `IdDivisi`");
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_departemen` TO `IdDepartemen`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `id_jabatan` TO `IdJabatan`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `mst_unit_kerja` TO `IdUnitKerja`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `gagal_masuk` TO `FailedLoginAttempts`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `terakhir_login` TO `LastLoginAt`",
  );
  await knex.raw("ALTER TABLE `mst_pengguna` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_pengguna` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `mst_unit_kerja` TO `IdUnitKerja`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `id_departemen` TO `IdDepartemen`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `kode_unit_kerja` TO `WorkUnitCode`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `work_unit_name` TO `WorkUnitName`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `deskripsi` TO `deskripsi`",
  );
  await knex.raw("ALTER TABLE `mst_unit_kerja` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_unit_kerja` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `id_jabatan` TO `IdJabatan`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `kode_jabatan` TO `PositionCode`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `nama_jabatan` TO `PositionName`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `tingkat_jabatan` TO `PositionLevel`",
  );
  await knex.raw("ALTER TABLE `mst_jabatan` CHANGE `deskripsi` TO `deskripsi`");
  await knex.raw("ALTER TABLE `mst_jabatan` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_jabatan` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `id_departemen` TO `IdDepartemen`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `id_divisi` TO `IdDivisi`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `department_code` TO `DepartmentCode`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `department_name` TO `DepartmentName`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `deskripsi` TO `deskripsi`",
  );
  await knex.raw("ALTER TABLE `mst_departemens` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_departemens` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `id_divisi` TO `IdDivisi`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `id_cabang` TO `IdCabang`");
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `kode_divisi` TO `DivisionCode`",
  );
  await knex.raw(
    "ALTER TABLE `mst_divisi` CHANGE `nama_divisi` TO `DivisionName`",
  );
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `deskripsi` TO `deskripsi`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `status` TO `Status`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `created_at` TO `CreatedAt`");
  await knex.raw("ALTER TABLE `mst_divisi` CHANGE `updated_at` TO `UpdatedAt`");

  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `id_cabang` TO `IdCabang`");
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `kode_cabang` TO `BranchCode`",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `nama_cabang` TO `BranchName`",
  );
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `alamat` TO `alamat`");
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `telepon` TO `telepon`");
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `surel` TO `surel`");
  await knex.raw("ALTER TABLE `mst_cabanges` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `created_at` TO `CreatedAt`",
  );
  await knex.raw(
    "ALTER TABLE `mst_cabanges` CHANGE `updated_at` TO `UpdatedAt`",
  );

  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `id` TO `Id`");
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `nama_pengguna` TO `nama_pengguna`",
  );
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `peran` TO `peran`");
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `action` TO `Action`");
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `ip_alamat` TO `Ipalamat`",
  );
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` CHANGE `user_agent` TO `UserAgent`",
  );
  await knex.raw("ALTER TABLE `mst_riwayat_audit` CHANGE `status` TO `Status`");
  await knex.raw(
    "ALTER TABLE `mst_riwayat_audit` RENAME COLUMN `created_at` TO `CreatedAt`",
  );

  await knex.raw("ALTER TABLE `log` CHANGE `id` TO `ID`");
  await knex.raw("ALTER TABLE `log` CHANGE `tgl` TO `Tgl`");
  await knex.raw("ALTER TABLE `log` CHANGE `controller` TO `Controller`");
  await knex.raw("ALTER TABLE `log` CHANGE `function` TO `Function`");
  await knex.raw("ALTER TABLE `log` CHANGE `request` TO `Request`");
  await knex.raw("ALTER TABLE `log` CHANGE `response` TO `Response`");
  await knex.raw("ALTER TABLE `log` CHANGE `stack` TO `Stack`");
  await knex.raw("ALTER TABLE `log` CHANGE `user` TO `User`");
  await knex.raw("ALTER TABLE `log` CHANGE `datetime` TO `DateTime`");

  await knex.raw("ALTER TABLE `config` CHANGE `id` TO `Id`");
  await knex.raw("ALTER TABLE `config` CHANGE `kode` TO `Kode`");
  await knex.raw("ALTER TABLE `config` CHANGE `keterangan` TO `Keterangan`");

  await knex.raw("ALTER TABLE `access_token` CHANGE `id` TO `ID`");
  await knex.raw("ALTER TABLE `access_token` CHANGE `token` TO `Token`");
  await knex.raw("ALTER TABLE `access_token` CHANGE `expired` TO `Expired`");
  await knex.raw("ALTER TABLE `access_token` CHANGE `datetime` TO `Datetime`");

  await knex.schema.renameTable("trx_visitations", "tr_visitations");
}
