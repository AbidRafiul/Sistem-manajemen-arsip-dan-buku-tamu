/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Rename table mst_positions to mst_jabatan
  if (await knex.schema.hasTable("mst_positions") && !(await knex.schema.hasTable("mst_jabatan"))) {
    await knex.raw("RENAME TABLE `mst_positions` TO `mst_jabatan`");
  }

  // 2. Rename table user_navigation to navigasi_pengguna
  if (await knex.schema.hasTable("user_navigation") && !(await knex.schema.hasTable("navigasi_pengguna"))) {
    await knex.raw("RENAME TABLE `user_navigation` TO `navigasi_pengguna`");
  }

  const renameColumns = async (tableName, columnMap) => {
    if (await knex.schema.hasTable(tableName)) {
      for (const [oldCol, newCol] of Object.entries(columnMap)) {
        const hasOld = await knex.schema.hasColumn(tableName, oldCol);
        const hasNew = await knex.schema.hasColumn(tableName, newCol);
        if (hasOld && !hasNew) {
          await knex.raw(`ALTER TABLE ?? RENAME COLUMN ?? TO ??`, [tableName, oldCol, newCol]);
        }
      }
    }
  };

  // 3. Rename columns of mst_pengguna
  await renameColumns("mst_pengguna", {
    user_id: "id_pengguna",
    fullname: "nama_lengkap",
    username: "nama_pengguna",
    email: "surel",
    telepon: "telepon",
    password: "kata_sandi",
    branch_id: "id_cabang",
    division_id: "id_divisi",
    department_id: "id_departemen",
    position_id: "id_jabatan",
    work_unit_id: "id_unit_kerja",
    failed_login_attempts: "gagal_masuk",
    last_login_at: "terakhir_login",
  });

  // 4. Rename columns of mst_pengguna_peran
  await renameColumns("mst_pengguna_peran", {
    user_role_id: "id_peran_pengguna",
    user_id: "id_pengguna",
    role_id: "id_peran",
    is_primary: "peran_utama",
  });

  // 5. Rename columns of mst_peran
  await renameColumns("mst_peran", {
    role_id: "id_peran",
    role_code: "kode_peran",
    role_name: "nama_peran",
    description: "deskripsi",
  });

  // 6. Rename columns of mst_peran_menu
  await renameColumns("mst_peran_menu", {
    role_menu_id: "id_peran_menu",
    role_id: "id_peran",
    menu_id: "id_menu",
    can_view: "hak_lihat",
    can_create: "hak_buat",
    can_update: "hak_ubah",
    can_delete: "hak_hapus",
    can_approve: "hak_setuju",
  });

  // 7. Rename columns of mst_jabatan
  await renameColumns("mst_jabatan", {
    position_id: "id_jabatan",
    position_code: "kode_jabatan",
    position_name: "nama_jabatan",
    position_level: "tingkat_jabatan",
    description: "deskripsi",
  });

  // 8. Rename columns of mst_divisi
  await renameColumns("mst_divisi", {
    division_id: "id_divisi",
    branch_id: "id_cabang",
    division_code: "kode_divisi",
    division_name: "nama_divisi",
    description: "deskripsi",
  });

  // 9. Rename columns of mst_departemen
  await renameColumns("mst_departemen", {
    department_id: "id_departemen",
    division_id: "id_divisi",
    department_code: "kode_departemen",
    department_name: "nama_departemen",
    description: "deskripsi",
  });

  // 10. Rename columns of mst_cabang
  await renameColumns("mst_cabang", {
    branch_id: "id_cabang",
    branch_code: "kode_cabang",
    branch_name: "nama_cabang",
    address: "alamat",
    telp: "telepon",
    email: "surel",
  });

  // 11. Rename columns of mst_riwayat_audit
  await renameColumns("mst_riwayat_audit", {
    ip_address: "alamat_ip",
    user_agent: "agen_pengguna",
    action: "aksi",
  });

  // 12. Rename columns of navigasi_pengguna
  await renameColumns("navigasi_pengguna", {
    user_id: "id_pengguna",
  });

  // 13. Rename columns of mst_navigasi
  await renameColumns("mst_navigasi", {
    role: "peran",
  });

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const renameColumns = async (tableName, columnMap) => {
    if (await knex.schema.hasTable(tableName)) {
      for (const [oldCol, newCol] of Object.entries(columnMap)) {
        const hasOld = await knex.schema.hasColumn(tableName, oldCol);
        const hasNew = await knex.schema.hasColumn(tableName, newCol);
        if (hasOld && !hasNew) {
          await knex.raw(`ALTER TABLE ?? RENAME COLUMN ?? TO ??`, [tableName, oldCol, newCol]);
        }
      }
    }
  };

  // 1. Rename columns of navigasi_pengguna back
  await renameColumns("navigasi_pengguna", {
    id_pengguna: "user_id",
  });

  // 2. Rename columns of mst_riwayat_audit back
  await renameColumns("mst_riwayat_audit", {
    alamat_ip: "ip_address",
    agen_pengguna: "user_agent",
    aksi: "action",
  });

  // 3. Rename columns of mst_cabang back
  await renameColumns("mst_cabang", {
    id_cabang: "branch_id",
    kode_cabang: "branch_code",
    nama_cabang: "branch_name",
    alamat: "address",
    telepon: "telp",
    surel: "email",
  });

  // 4. Rename columns of mst_departemen back
  await renameColumns("mst_departemen", {
    id_departemen: "department_id",
    id_divisi: "division_id",
    kode_departemen: "department_code",
    nama_departemen: "department_name",
    deskripsi: "description",
  });

  // 5. Rename columns of mst_divisi back
  await renameColumns("mst_divisi", {
    id_divisi: "division_id",
    id_cabang: "branch_id",
    kode_divisi: "division_code",
    nama_divisi: "division_name",
    deskripsi: "description",
  });

  // 6. Rename columns of mst_jabatan back
  await renameColumns("mst_jabatan", {
    id_jabatan: "position_id",
    kode_jabatan: "position_code",
    nama_jabatan: "position_name",
    tingkat_jabatan: "position_level",
    deskripsi: "description",
  });

  // 7. Rename columns of mst_peran_menu back
  await renameColumns("mst_peran_menu", {
    id_peran_menu: "role_menu_id",
    id_peran: "role_id",
    id_menu: "menu_id",
    hak_lihat: "can_view",
    hak_buat: "can_create",
    hak_ubah: "can_update",
    hak_hapus: "can_delete",
    hak_setuju: "can_approve",
  });

  // 8. Rename columns of mst_peran back
  await renameColumns("mst_peran", {
    id_peran: "role_id",
    kode_peran: "role_code",
    nama_peran: "role_name",
    deskripsi: "description",
  });

  // 9. Rename columns of mst_pengguna_peran back
  await renameColumns("mst_pengguna_peran", {
    id_peran_pengguna: "user_role_id",
    id_pengguna: "user_id",
    id_peran: "role_id",
    peran_utama: "is_primary",
  });

  // 10. Rename columns of mst_pengguna back
  await renameColumns("mst_pengguna", {
    id_pengguna: "user_id",
    nama_lengkap: "fullname",
    nama_pengguna: "username",
    surel: "email",
    telepon: "telepon",
    kata_sandi: "password",
    id_cabang: "branch_id",
    id_divisi: "division_id",
    id_departemen: "department_id",
    id_jabatan: "position_id",
    id_unit_kerja: "work_unit_id",
    gagal_masuk: "failed_login_attempts",
    terakhir_login: "last_login_at",
  });

  // 10.1 Rename columns of mst_navigasi back
  await renameColumns("mst_navigasi", {
    peran: "role",
  });

  // 11. Rename tables back
  if (await knex.schema.hasTable("navigasi_pengguna") && !(await knex.schema.hasTable("user_navigation"))) {
    await knex.raw("RENAME TABLE `navigasi_pengguna` TO `user_navigation`");
  }

  if (await knex.schema.hasTable("mst_jabatan") && !(await knex.schema.hasTable("mst_positions"))) {
    await knex.raw("RENAME TABLE `mst_jabatan` TO `mst_positions`");
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
