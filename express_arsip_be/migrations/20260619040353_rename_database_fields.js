const getExactColumnNames = async (knex, tableName) => {
    const [columns] = await knex.raw('SHOW FULL COLUMNS FROM ??', [tableName]);
    return columns.map((column) => column.Field);
};

const renameColumnCompat = async (knex, tableName, from, to) => {
    const columns = await getExactColumnNames(knex, tableName);

    // MariaDB treats column lookups case-insensitively, so compare the names
    // exactly to make case-only renames (ID -> id) safe and idempotent.
    if (!columns.includes(from)) {
        if (columns.includes(to)) return;
        throw new Error(`Column ${tableName}.${from} tidak ditemukan`);
    }

    const [rows] = await knex.raw('SHOW CREATE TABLE ??', [tableName]);
    const createSql = rows[0]['Create Table'];
    const quotedFrom = `\`${from.replaceAll('`', '``')}\``;
    const columnLine = createSql
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith(`${quotedFrom} `));

    if (!columnLine) {
        throw new Error(`Definisi column ${tableName}.${from} tidak ditemukan`);
    }

    // Reuse the exact definition emitted by MariaDB so defaults, collation,
    // comments, unsigned and auto_increment remain unchanged.
    const definition = columnLine
        .slice(quotedFrom.length)
        .trim()
        .replace(/,$/, '');

    await knex.raw(
        `ALTER TABLE ?? CHANGE COLUMN ?? ?? ${definition}`,
        [tableName, from, to],
    );
};

const ensureForeignKey = async (
    knex,
    constraintName,
    tableName,
    columnName,
    referencedTable,
    referencedColumn,
) => {
    const [rows] = await knex.raw(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE CONSTRAINT_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND CONSTRAINT_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [tableName, constraintName],
    );

    if (rows.length) return;

    await knex.raw(
        `ALTER TABLE ?? ADD CONSTRAINT ?? FOREIGN KEY (??)
         REFERENCES ?? (??) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        [
            tableName,
            constraintName,
            columnName,
            referencedTable,
            referencedColumn,
        ],
    );
};

const renameTableCompat = async (knex, from, to) => {
    const hasFrom = await knex.schema.hasTable(from);
    const hasTo = await knex.schema.hasTable(to);

    if (hasFrom) {
        await knex.schema.renameTable(from, to);
        return;
    }

    if (!hasTo) {
        throw new Error(`Table ${from} maupun ${to} tidak ditemukan`);
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
<<<<<<< HEAD
    // 0. Rename Tabel tr_visitations -> trx_visitations
    await renameTableCompat(knex, 'tr_visitations', 'trx_visitations');

    // 1. Table: access_token
    await renameColumnCompat(knex, 'access_token', 'ID', 'id');
    await renameColumnCompat(knex, 'access_token', 'Token', 'token');
    await renameColumnCompat(knex, 'access_token', 'Expired', 'expired');
    await renameColumnCompat(knex, 'access_token', 'Datetime', 'datetime');

    // 2. Table: config
    await renameColumnCompat(knex, 'config', 'Id', 'id');
    await renameColumnCompat(knex, 'config', 'Kode', 'kode');
    await renameColumnCompat(knex, 'config', 'Keterangan', 'keterangan');

    // 3. Table: log
    await renameColumnCompat(knex, 'log', 'ID', 'id');
    await renameColumnCompat(knex, 'log', 'Tgl', 'tgl');
    await renameColumnCompat(knex, 'log', 'Controller', 'controller');
    await renameColumnCompat(knex, 'log', 'Function', 'function');
    await renameColumnCompat(knex, 'log', 'Request', 'request');
    await renameColumnCompat(knex, 'log', 'Response', 'response');
    await renameColumnCompat(knex, 'log', 'Stack', 'stack');
    await renameColumnCompat(knex, 'log', 'User', 'user');
    await renameColumnCompat(knex, 'log', 'DateTime', 'datetime');

    // 4. Table: mst_audit_trails
    await renameColumnCompat(knex, 'mst_audit_trails', 'Id', 'id');
    await renameColumnCompat(knex, 'mst_audit_trails', 'Username', 'username');
    await renameColumnCompat(knex, 'mst_audit_trails', 'Role', 'role');
    await renameColumnCompat(knex, 'mst_audit_trails', 'Action', 'action');
    await renameColumnCompat(knex, 'mst_audit_trails', 'IpAddress', 'ip_address');
    await renameColumnCompat(knex, 'mst_audit_trails', 'UserAgent', 'user_agent');
    await renameColumnCompat(knex, 'mst_audit_trails', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_audit_trails', 'CreatedAt', 'created_at');

    // 5. Table: mst_branches
    await renameColumnCompat(knex, 'mst_branches', 'BranchId', 'branch_id');
    await renameColumnCompat(knex, 'mst_branches', 'BranchCode', 'branch_code');
    await renameColumnCompat(knex, 'mst_branches', 'BranchName', 'branch_name');
    await renameColumnCompat(knex, 'mst_branches', 'Address', 'address');
    await renameColumnCompat(knex, 'mst_branches', 'Telp', 'telp');
    await renameColumnCompat(knex, 'mst_branches', 'Email', 'email');
    await renameColumnCompat(knex, 'mst_branches', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_branches', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_branches', 'UpdatedAt', 'updated_at');

    // 6. Table: mst_divisions
    await renameColumnCompat(knex, 'mst_divisions', 'DivisionId', 'division_id');
    await renameColumnCompat(knex, 'mst_divisions', 'BranchId', 'branch_id');
    await renameColumnCompat(knex, 'mst_divisions', 'DivisionCode', 'division_code');
    await renameColumnCompat(knex, 'mst_divisions', 'DivisionName', 'division_name');
    await renameColumnCompat(knex, 'mst_divisions', 'Description', 'description');
    await renameColumnCompat(knex, 'mst_divisions', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_divisions', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_divisions', 'UpdatedAt', 'updated_at');

    // 7. Table: mst_departments
    await renameColumnCompat(knex, 'mst_departments', 'DepartmentId', 'department_id');
    await renameColumnCompat(knex, 'mst_departments', 'DivisionId', 'division_id');
    await renameColumnCompat(knex, 'mst_departments', 'DepartmentCode', 'department_code');
    await renameColumnCompat(knex, 'mst_departments', 'DepartmentName', 'department_name');
    await renameColumnCompat(knex, 'mst_departments', 'Description', 'description');
    await renameColumnCompat(knex, 'mst_departments', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_departments', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_departments', 'UpdatedAt', 'updated_at');

    // 8. Table: mst_positions
    await renameColumnCompat(knex, 'mst_positions', 'PositionId', 'position_id');
    await renameColumnCompat(knex, 'mst_positions', 'PositionCode', 'position_code');
    await renameColumnCompat(knex, 'mst_positions', 'PositionName', 'position_name');
    await renameColumnCompat(knex, 'mst_positions', 'PositionLevel', 'position_level');
    await renameColumnCompat(knex, 'mst_positions', 'Description', 'description');
    await renameColumnCompat(knex, 'mst_positions', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_positions', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_positions', 'UpdatedAt', 'updated_at');

    // 9. Table: mst_work_units
    await renameColumnCompat(knex, 'mst_work_units', 'WorkUnitId', 'work_unit_id');
    await renameColumnCompat(knex, 'mst_work_units', 'DepartmentId', 'department_id');
    await renameColumnCompat(knex, 'mst_work_units', 'WorkUnitCode', 'work_unit_code');
    await renameColumnCompat(knex, 'mst_work_units', 'WorkUnitName', 'work_unit_name');
    await renameColumnCompat(knex, 'mst_work_units', 'Description', 'description');
    await renameColumnCompat(knex, 'mst_work_units', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_work_units', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_work_units', 'UpdatedAt', 'updated_at');

    // 10. Table: mst_users
    await renameColumnCompat(knex, 'mst_users', 'UserId', 'user_id');
    await renameColumnCompat(knex, 'mst_users', 'Fullname', 'fullname');
    await renameColumnCompat(knex, 'mst_users', 'Username', 'username');
    await renameColumnCompat(knex, 'mst_users', 'Email', 'email');
    await renameColumnCompat(knex, 'mst_users', 'Telp', 'telp');
    await renameColumnCompat(knex, 'mst_users', 'Password', 'password');
    await renameColumnCompat(knex, 'mst_users', 'BranchId', 'branch_id');
    await renameColumnCompat(knex, 'mst_users', 'DivisionId', 'division_id');
    await renameColumnCompat(knex, 'mst_users', 'DepartmentId', 'department_id');
    await renameColumnCompat(knex, 'mst_users', 'PositionId', 'position_id');
    await renameColumnCompat(knex, 'mst_users', 'WorkUnitId', 'work_unit_id');
    await renameColumnCompat(knex, 'mst_users', 'FailedLoginAttempts', 'failed_login_attempts');
    await renameColumnCompat(knex, 'mst_users', 'LastLoginAt', 'last_login_at');
    await renameColumnCompat(knex, 'mst_users', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_users', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_users', 'UpdatedAt', 'updated_at');

    // 11. Table: mst_roles
    await renameColumnCompat(knex, 'mst_roles', 'RoleId', 'role_id');
    await renameColumnCompat(knex, 'mst_roles', 'RoleCode', 'role_code');
    await renameColumnCompat(knex, 'mst_roles', 'RoleName', 'role_name');
    await renameColumnCompat(knex, 'mst_roles', 'Description', 'description');
    await renameColumnCompat(knex, 'mst_roles', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_roles', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_roles', 'UpdatedAt', 'updated_at');

    // 12. Table: mst_user_roles
    await renameColumnCompat(knex, 'mst_user_roles', 'UserRoleId', 'user_role_id');
    await renameColumnCompat(knex, 'mst_user_roles', 'UserId', 'user_id');
    await renameColumnCompat(knex, 'mst_user_roles', 'RoleId', 'role_id');
    await renameColumnCompat(knex, 'mst_user_roles', 'IsPrimary', 'is_primary');
    await renameColumnCompat(knex, 'mst_user_roles', 'Status', 'status');
    await renameColumnCompat(knex, 'mst_user_roles', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_user_roles', 'UpdatedAt', 'updated_at');

    // 13. Table: mst_menus
    await renameColumnCompat(knex, 'mst_menus', 'MenuId', 'menu_id');
    await renameColumnCompat(knex, 'mst_menus', 'ParentMenuId', 'parent_menu_id');
    await renameColumnCompat(knex, 'mst_menus', 'MenuCode', 'menu_code');
    await renameColumnCompat(knex, 'mst_menus', 'MenuName', 'menu_name');
    await renameColumnCompat(knex, 'mst_menus', 'MenuPath', 'menu_path');
    await renameColumnCompat(knex, 'mst_menus', 'MenuIcon', 'menu_icon');
    await renameColumnCompat(knex, 'mst_menus', 'SortOrder', 'sort_order');
    await renameColumnCompat(knex, 'mst_menus', 'IsActive', 'is_active');
    await renameColumnCompat(knex, 'mst_menus', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_menus', 'UpdatedAt', 'updated_at');

    // 14. Table: mst_role_menus
    await renameColumnCompat(knex, 'mst_role_menus', 'RoleMenuId', 'role_menu_id');
    await renameColumnCompat(knex, 'mst_role_menus', 'RoleId', 'role_id');
    await renameColumnCompat(knex, 'mst_role_menus', 'MenuId', 'menu_id');
    await renameColumnCompat(knex, 'mst_role_menus', 'CanView', 'can_view');
    await renameColumnCompat(knex, 'mst_role_menus', 'CanCreate', 'can_create');
    await renameColumnCompat(knex, 'mst_role_menus', 'CanUpdate', 'can_update');
    await renameColumnCompat(knex, 'mst_role_menus', 'CanDelete', 'can_delete');
    await renameColumnCompat(knex, 'mst_role_menus', 'CanApprove', 'can_approve');
    await renameColumnCompat(knex, 'mst_role_menus', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'mst_role_menus', 'UpdatedAt', 'updated_at');

    // 15. Table: mst_navigation
    await renameColumnCompat(knex, 'mst_navigation', 'Id', 'id');
    await renameColumnCompat(knex, 'mst_navigation', 'Menu', 'menu');
    await renameColumnCompat(knex, 'mst_navigation', 'Role', 'role');
    await renameColumnCompat(knex, 'mst_navigation', 'CreatedAt', 'created_at');

    // 16. Table: user_navigation
    await renameColumnCompat(knex, 'user_navigation', 'Id', 'id');
    await renameColumnCompat(knex, 'user_navigation', 'UserId', 'user_id');
    await renameColumnCompat(knex, 'user_navigation', 'Menu', 'menu');
    await renameColumnCompat(knex, 'user_navigation', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'user_navigation', 'UpdatedAt', 'updated_at');

    // 17. Table: user_credential
    await renameColumnCompat(knex, 'user_credential', 'Id', 'id');
    await renameColumnCompat(knex, 'user_credential', 'UniqueId', 'unique_id');
    await renameColumnCompat(knex, 'user_credential', 'Username', 'username');
    await renameColumnCompat(knex, 'user_credential', 'Fullname', 'fullname');
    await renameColumnCompat(knex, 'user_credential', 'Telp', 'telp');
    await renameColumnCompat(knex, 'user_credential', 'Role', 'role');
    await renameColumnCompat(knex, 'user_credential', 'Password', 'password');
    await renameColumnCompat(knex, 'user_credential', 'Status', 'status');
    await renameColumnCompat(knex, 'user_credential', 'CreatedAt', 'created_at');
    await renameColumnCompat(knex, 'user_credential', 'UpdatedAt', 'updated_at');

    // 18. Table: nomor_faktur
    await renameColumnCompat(knex, 'nomor_faktur', 'Kode', 'kode');
    await renameColumnCompat(knex, 'nomor_faktur', 'Id', 'id');

    // 19. Table: mst_visit_purpose
    await renameColumnCompat(knex, 'mst_visit_purpose', 'Description', 'description');
    await renameColumnCompat(knex, 'mst_visit_purpose', 'Status', 'status');

    // 20. Table: trx_visitations
    await renameColumnCompat(knex, 'trx_visitations', 'Status', 'status');

    // A failed earlier run using Knex's renameColumn may have dropped this FK
    // before it failed to recreate it. Restore it idempotently.
    await ensureForeignKey(
        knex,
        'mst_divisions_branchid_foreign',
        'mst_divisions',
        'branch_id',
        'mst_branches',
        'branch_id',
    );
=======
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
>>>>>>> main
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
<<<<<<< HEAD
    await renameColumnCompat(knex, 'trx_visitations', 'status', 'Status');

    await renameColumnCompat(knex, 'mst_visit_purpose', 'description', 'Description');
    await renameColumnCompat(knex, 'mst_visit_purpose', 'status', 'Status');

    await renameColumnCompat(knex, 'nomor_faktur', 'kode', 'Kode');
    await renameColumnCompat(knex, 'nomor_faktur', 'id', 'Id');

    await renameColumnCompat(knex, 'user_credential', 'id', 'Id');
    await renameColumnCompat(knex, 'user_credential', 'unique_id', 'UniqueId');
    await renameColumnCompat(knex, 'user_credential', 'username', 'Username');
    await renameColumnCompat(knex, 'user_credential', 'fullname', 'Fullname');
    await renameColumnCompat(knex, 'user_credential', 'telp', 'Telp');
    await renameColumnCompat(knex, 'user_credential', 'role', 'Role');
    await renameColumnCompat(knex, 'user_credential', 'password', 'Password');
    await renameColumnCompat(knex, 'user_credential', 'status', 'Status');
    await renameColumnCompat(knex, 'user_credential', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'user_credential', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'user_navigation', 'id', 'Id');
    await renameColumnCompat(knex, 'user_navigation', 'user_id', 'UserId');
    await renameColumnCompat(knex, 'user_navigation', 'menu', 'Menu');
    await renameColumnCompat(knex, 'user_navigation', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'user_navigation', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_navigation', 'id', 'Id');
    await renameColumnCompat(knex, 'mst_navigation', 'menu', 'Menu');
    await renameColumnCompat(knex, 'mst_navigation', 'role', 'Role');
    await renameColumnCompat(knex, 'mst_navigation', 'created_at', 'CreatedAt');

    await renameColumnCompat(knex, 'mst_role_menus', 'role_menu_id', 'RoleMenuId');
    await renameColumnCompat(knex, 'mst_role_menus', 'role_id', 'RoleId');
    await renameColumnCompat(knex, 'mst_role_menus', 'menu_id', 'MenuId');
    await renameColumnCompat(knex, 'mst_role_menus', 'can_view', 'CanView');
    await renameColumnCompat(knex, 'mst_role_menus', 'can_create', 'CanCreate');
    await renameColumnCompat(knex, 'mst_role_menus', 'can_update', 'CanUpdate');
    await renameColumnCompat(knex, 'mst_role_menus', 'can_delete', 'CanDelete');
    await renameColumnCompat(knex, 'mst_role_menus', 'can_approve', 'CanApprove');
    await renameColumnCompat(knex, 'mst_role_menus', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_role_menus', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_menus', 'menu_id', 'MenuId');
    await renameColumnCompat(knex, 'mst_menus', 'parent_menu_id', 'ParentMenuId');
    await renameColumnCompat(knex, 'mst_menus', 'menu_code', 'MenuCode');
    await renameColumnCompat(knex, 'mst_menus', 'menu_name', 'MenuName');
    await renameColumnCompat(knex, 'mst_menus', 'menu_path', 'MenuPath');
    await renameColumnCompat(knex, 'mst_menus', 'menu_icon', 'MenuIcon');
    await renameColumnCompat(knex, 'mst_menus', 'sort_order', 'SortOrder');
    await renameColumnCompat(knex, 'mst_menus', 'is_active', 'IsActive');
    await renameColumnCompat(knex, 'mst_menus', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_menus', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_user_roles', 'user_role_id', 'UserRoleId');
    await renameColumnCompat(knex, 'mst_user_roles', 'user_id', 'UserId');
    await renameColumnCompat(knex, 'mst_user_roles', 'role_id', 'RoleId');
    await renameColumnCompat(knex, 'mst_user_roles', 'is_primary', 'IsPrimary');
    await renameColumnCompat(knex, 'mst_user_roles', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_user_roles', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_user_roles', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_roles', 'role_id', 'RoleId');
    await renameColumnCompat(knex, 'mst_roles', 'role_code', 'RoleCode');
    await renameColumnCompat(knex, 'mst_roles', 'role_name', 'RoleName');
    await renameColumnCompat(knex, 'mst_roles', 'description', 'Description');
    await renameColumnCompat(knex, 'mst_roles', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_roles', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_roles', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_users', 'user_id', 'UserId');
    await renameColumnCompat(knex, 'mst_users', 'fullname', 'Fullname');
    await renameColumnCompat(knex, 'mst_users', 'username', 'Username');
    await renameColumnCompat(knex, 'mst_users', 'email', 'Email');
    await renameColumnCompat(knex, 'mst_users', 'telp', 'Telp');
    await renameColumnCompat(knex, 'mst_users', 'password', 'Password');
    await renameColumnCompat(knex, 'mst_users', 'branch_id', 'BranchId');
    await renameColumnCompat(knex, 'mst_users', 'division_id', 'DivisionId');
    await renameColumnCompat(knex, 'mst_users', 'department_id', 'DepartmentId');
    await renameColumnCompat(knex, 'mst_users', 'position_id', 'PositionId');
    await renameColumnCompat(knex, 'mst_users', 'work_unit_id', 'WorkUnitId');
    await renameColumnCompat(knex, 'mst_users', 'failed_login_attempts', 'FailedLoginAttempts');
    await renameColumnCompat(knex, 'mst_users', 'last_login_at', 'LastLoginAt');
    await renameColumnCompat(knex, 'mst_users', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_users', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_users', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_work_units', 'work_unit_id', 'WorkUnitId');
    await renameColumnCompat(knex, 'mst_work_units', 'department_id', 'DepartmentId');
    await renameColumnCompat(knex, 'mst_work_units', 'work_unit_code', 'WorkUnitCode');
    await renameColumnCompat(knex, 'mst_work_units', 'work_unit_name', 'WorkUnitName');
    await renameColumnCompat(knex, 'mst_work_units', 'description', 'Description');
    await renameColumnCompat(knex, 'mst_work_units', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_work_units', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_work_units', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_positions', 'position_id', 'PositionId');
    await renameColumnCompat(knex, 'mst_positions', 'position_code', 'PositionCode');
    await renameColumnCompat(knex, 'mst_positions', 'position_name', 'PositionName');
    await renameColumnCompat(knex, 'mst_positions', 'position_level', 'PositionLevel');
    await renameColumnCompat(knex, 'mst_positions', 'description', 'Description');
    await renameColumnCompat(knex, 'mst_positions', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_positions', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_positions', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_departments', 'department_id', 'DepartmentId');
    await renameColumnCompat(knex, 'mst_departments', 'division_id', 'DivisionId');
    await renameColumnCompat(knex, 'mst_departments', 'department_code', 'DepartmentCode');
    await renameColumnCompat(knex, 'mst_departments', 'department_name', 'DepartmentName');
    await renameColumnCompat(knex, 'mst_departments', 'description', 'Description');
    await renameColumnCompat(knex, 'mst_departments', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_departments', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_departments', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_divisions', 'division_id', 'DivisionId');
    await renameColumnCompat(knex, 'mst_divisions', 'branch_id', 'BranchId');
    await renameColumnCompat(knex, 'mst_divisions', 'division_code', 'DivisionCode');
    await renameColumnCompat(knex, 'mst_divisions', 'division_name', 'DivisionName');
    await renameColumnCompat(knex, 'mst_divisions', 'description', 'Description');
    await renameColumnCompat(knex, 'mst_divisions', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_divisions', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_divisions', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_branches', 'branch_id', 'BranchId');
    await renameColumnCompat(knex, 'mst_branches', 'branch_code', 'BranchCode');
    await renameColumnCompat(knex, 'mst_branches', 'branch_name', 'BranchName');
    await renameColumnCompat(knex, 'mst_branches', 'address', 'Address');
    await renameColumnCompat(knex, 'mst_branches', 'telp', 'Telp');
    await renameColumnCompat(knex, 'mst_branches', 'email', 'Email');
    await renameColumnCompat(knex, 'mst_branches', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_branches', 'created_at', 'CreatedAt');
    await renameColumnCompat(knex, 'mst_branches', 'updated_at', 'UpdatedAt');

    await renameColumnCompat(knex, 'mst_audit_trails', 'id', 'Id');
    await renameColumnCompat(knex, 'mst_audit_trails', 'username', 'Username');
    await renameColumnCompat(knex, 'mst_audit_trails', 'role', 'Role');
    await renameColumnCompat(knex, 'mst_audit_trails', 'action', 'Action');
    await renameColumnCompat(knex, 'mst_audit_trails', 'ip_address', 'IpAddress');
    await renameColumnCompat(knex, 'mst_audit_trails', 'user_agent', 'UserAgent');
    await renameColumnCompat(knex, 'mst_audit_trails', 'status', 'Status');
    await renameColumnCompat(knex, 'mst_audit_trails', 'created_at', 'CreatedAt');

    await renameColumnCompat(knex, 'log', 'id', 'ID');
    await renameColumnCompat(knex, 'log', 'tgl', 'Tgl');
    await renameColumnCompat(knex, 'log', 'controller', 'Controller');
    await renameColumnCompat(knex, 'log', 'function', 'Function');
    await renameColumnCompat(knex, 'log', 'request', 'Request');
    await renameColumnCompat(knex, 'log', 'response', 'Response');
    await renameColumnCompat(knex, 'log', 'stack', 'Stack');
    await renameColumnCompat(knex, 'log', 'user', 'User');
    await renameColumnCompat(knex, 'log', 'datetime', 'DateTime');

    await renameColumnCompat(knex, 'config', 'id', 'Id');
    await renameColumnCompat(knex, 'config', 'kode', 'Kode');
    await renameColumnCompat(knex, 'config', 'keterangan', 'Keterangan');

    await renameColumnCompat(knex, 'access_token', 'id', 'ID');
    await renameColumnCompat(knex, 'access_token', 'token', 'Token');
    await renameColumnCompat(knex, 'access_token', 'expired', 'Expired');
    await renameColumnCompat(knex, 'access_token', 'datetime', 'Datetime');

    await knex.schema.renameTable('trx_visitations', 'tr_visitations');
=======
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
>>>>>>> main
}
