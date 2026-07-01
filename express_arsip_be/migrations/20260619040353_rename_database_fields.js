const getExactColumnNames = async (knex, tableName) => {
  const [columns] = await knex.raw("SHOW FULL COLUMNS FROM ??", [tableName]);
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

  const [rows] = await knex.raw("SHOW CREATE TABLE ??", [tableName]);
  const createSql = rows[0]["Create Table"];
  const quotedFrom = `\`${from.replaceAll("`", "``")}\``;
  const columnLine = createSql
    .split("\n")
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
    .replace(/,$/, "");

  await knex.raw(`ALTER TABLE ?? CHANGE COLUMN ?? ?? ${definition}`, [
    tableName,
    from,
    to,
  ]);
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
    [tableName, constraintName, columnName, referencedTable, referencedColumn],
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
  // 0. Rename Tabel tr_visitations -> trx_visitations
  await renameTableCompat(knex, "tr_visitations", "trx_visitations");

  // 1. Table: access_token
  await renameColumnCompat(knex, "access_token", "ID", "id");
  await renameColumnCompat(knex, "access_token", "Token", "token");
  await renameColumnCompat(knex, "access_token", "Expired", "expired");
  await renameColumnCompat(knex, "access_token", "Datetime", "datetime");

  // 2. Table: config
  await renameColumnCompat(knex, "config", "Id", "id");
  await renameColumnCompat(knex, "config", "Kode", "kode");
  await renameColumnCompat(knex, "config", "Keterangan", "keterangan");

  // 3. Table: log
  await renameColumnCompat(knex, "log", "ID", "id");
  await renameColumnCompat(knex, "log", "Tgl", "tgl");
  await renameColumnCompat(knex, "log", "Controller", "controller");
  await renameColumnCompat(knex, "log", "Function", "function");
  await renameColumnCompat(knex, "log", "Request", "request");
  await renameColumnCompat(knex, "log", "Response", "response");
  await renameColumnCompat(knex, "log", "Stack", "stack");
  await renameColumnCompat(knex, "log", "User", "user");
  await renameColumnCompat(knex, "log", "DateTime", "datetime");

  // 4. Table: mst_audit_trails
  await renameColumnCompat(knex, "mst_audit_trails", "Id", "id");
  await renameColumnCompat(knex, "mst_audit_trails", "Username", "username");
  await renameColumnCompat(knex, "mst_audit_trails", "Role", "role");
  await renameColumnCompat(knex, "mst_audit_trails", "Action", "action");
  await renameColumnCompat(knex, "mst_audit_trails", "IpAddress", "ip_address");
  await renameColumnCompat(knex, "mst_audit_trails", "UserAgent", "user_agent");
  await renameColumnCompat(knex, "mst_audit_trails", "Status", "status");
  await renameColumnCompat(knex, "mst_audit_trails", "CreatedAt", "created_at");

  // 5. Table: mst_branches
  await renameColumnCompat(knex, "mst_branches", "BranchId", "branch_id");
  await renameColumnCompat(knex, "mst_branches", "BranchCode", "branch_code");
  await renameColumnCompat(knex, "mst_branches", "BranchName", "branch_name");
  await renameColumnCompat(knex, "mst_branches", "Address", "address");
  await renameColumnCompat(knex, "mst_branches", "Telp", "telp");
  await renameColumnCompat(knex, "mst_branches", "Email", "email");
  await renameColumnCompat(knex, "mst_branches", "Status", "status");
  await renameColumnCompat(knex, "mst_branches", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_branches", "UpdatedAt", "updated_at");

  // 6. Table: mst_divisions
  await renameColumnCompat(knex, "mst_divisions", "DivisionId", "division_id");
  await renameColumnCompat(knex, "mst_divisions", "BranchId", "branch_id");
  await renameColumnCompat(
    knex,
    "mst_divisions",
    "DivisionCode",
    "division_code",
  );
  await renameColumnCompat(
    knex,
    "mst_divisions",
    "DivisionName",
    "division_name",
  );
  await renameColumnCompat(knex, "mst_divisions", "Description", "description");
  await renameColumnCompat(knex, "mst_divisions", "Status", "status");
  await renameColumnCompat(knex, "mst_divisions", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_divisions", "UpdatedAt", "updated_at");

  // 7. Table: mst_departments
  await renameColumnCompat(
    knex,
    "mst_departments",
    "DepartmentId",
    "department_id",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "DivisionId",
    "division_id",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "DepartmentCode",
    "department_code",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "DepartmentName",
    "department_name",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "Description",
    "description",
  );
  await renameColumnCompat(knex, "mst_departments", "Status", "status");
  await renameColumnCompat(knex, "mst_departments", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_departments", "UpdatedAt", "updated_at");

  // 8. Table: mst_positions
  await renameColumnCompat(knex, "mst_positions", "PositionId", "position_id");
  await renameColumnCompat(
    knex,
    "mst_positions",
    "PositionCode",
    "position_code",
  );
  await renameColumnCompat(
    knex,
    "mst_positions",
    "PositionName",
    "position_name",
  );
  await renameColumnCompat(
    knex,
    "mst_positions",
    "PositionLevel",
    "position_level",
  );
  await renameColumnCompat(knex, "mst_positions", "Description", "description");
  await renameColumnCompat(knex, "mst_positions", "Status", "status");
  await renameColumnCompat(knex, "mst_positions", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_positions", "UpdatedAt", "updated_at");

  // 9. Table: mst_work_units
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "WorkUnitId",
    "work_unit_id",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "DepartmentId",
    "department_id",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "WorkUnitCode",
    "work_unit_code",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "WorkUnitName",
    "work_unit_name",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "Description",
    "description",
  );
  await renameColumnCompat(knex, "mst_work_units", "Status", "status");
  await renameColumnCompat(knex, "mst_work_units", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_work_units", "UpdatedAt", "updated_at");

  // 10. Table: mst_users
  await renameColumnCompat(knex, "mst_users", "UserId", "id_pengguna");
  await renameColumnCompat(knex, "mst_users", "Fullname", "fullname");
  await renameColumnCompat(knex, "mst_users", "Username", "username");
  await renameColumnCompat(knex, "mst_users", "Email", "email");
  await renameColumnCompat(knex, "mst_users", "Telp", "telp");
  await renameColumnCompat(knex, "mst_users", "Password", "password");
  await renameColumnCompat(knex, "mst_users", "BranchId", "branch_id");
  await renameColumnCompat(knex, "mst_users", "DivisionId", "division_id");
  await renameColumnCompat(knex, "mst_users", "DepartmentId", "department_id");
  await renameColumnCompat(knex, "mst_users", "PositionId", "position_id");
  await renameColumnCompat(knex, "mst_users", "WorkUnitId", "work_unit_id");
  await renameColumnCompat(
    knex,
    "mst_users",
    "FailedLoginAttempts",
    "failed_login_attempts",
  );
  await renameColumnCompat(knex, "mst_users", "LastLoginAt", "last_login_at");
  await renameColumnCompat(knex, "mst_users", "Status", "status");
  await renameColumnCompat(knex, "mst_users", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_users", "UpdatedAt", "updated_at");

  // 11. Table: mst_roles
  await renameColumnCompat(knex, "mst_roles", "RoleId", "role_id");
  await renameColumnCompat(knex, "mst_roles", "RoleCode", "role_code");
  await renameColumnCompat(knex, "mst_roles", "RoleName", "role_name");
  await renameColumnCompat(knex, "mst_roles", "Description", "description");
  await renameColumnCompat(knex, "mst_roles", "Status", "status");
  await renameColumnCompat(knex, "mst_roles", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_roles", "UpdatedAt", "updated_at");

  // 12. Table: mst_user_roles
  await renameColumnCompat(
    knex,
    "mst_user_roles",
    "UserRoleId",
    "user_role_id",
  );
  await renameColumnCompat(knex, "mst_user_roles", "UserId", "id_pengguna");
  await renameColumnCompat(knex, "mst_user_roles", "RoleId", "role_id");
  await renameColumnCompat(knex, "mst_user_roles", "IsPrimary", "is_primary");
  await renameColumnCompat(knex, "mst_user_roles", "Status", "status");
  await renameColumnCompat(knex, "mst_user_roles", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_user_roles", "UpdatedAt", "updated_at");

  // 13. Table: mst_menus
  await renameColumnCompat(knex, "mst_menus", "MenuId", "menu_id");
  await renameColumnCompat(knex, "mst_menus", "ParentMenuId", "parent_menu_id");
  await renameColumnCompat(knex, "mst_menus", "MenuCode", "menu_code");
  await renameColumnCompat(knex, "mst_menus", "MenuName", "menu_name");
  await renameColumnCompat(knex, "mst_menus", "MenuPath", "menu_path");
  await renameColumnCompat(knex, "mst_menus", "MenuIcon", "menu_icon");
  await renameColumnCompat(knex, "mst_menus", "SortOrder", "sort_order");
  await renameColumnCompat(knex, "mst_menus", "IsActive", "is_active");
  await renameColumnCompat(knex, "mst_menus", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_menus", "UpdatedAt", "updated_at");

  // 14. Table: mst_role_menus
  await renameColumnCompat(
    knex,
    "mst_role_menus",
    "RoleMenuId",
    "role_menu_id",
  );
  await renameColumnCompat(knex, "mst_role_menus", "RoleId", "role_id");
  await renameColumnCompat(knex, "mst_role_menus", "MenuId", "menu_id");
  await renameColumnCompat(knex, "mst_role_menus", "CanView", "can_view");
  await renameColumnCompat(knex, "mst_role_menus", "CanCreate", "can_create");
  await renameColumnCompat(knex, "mst_role_menus", "CanUpdate", "can_update");
  await renameColumnCompat(knex, "mst_role_menus", "CanDelete", "can_delete");
  await renameColumnCompat(knex, "mst_role_menus", "CanApprove", "can_approve");
  await renameColumnCompat(knex, "mst_role_menus", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "mst_role_menus", "UpdatedAt", "updated_at");

  // 15. Table: mst_navigation
  await renameColumnCompat(knex, "mst_navigation", "Id", "id");
  await renameColumnCompat(knex, "mst_navigation", "Menu", "menu");
  await renameColumnCompat(knex, "mst_navigation", "Role", "role");
  await renameColumnCompat(knex, "mst_navigation", "CreatedAt", "created_at");

  // 16. Table: user_navigation
  await renameColumnCompat(knex, "user_navigation", "Id", "id");
  await renameColumnCompat(knex, "user_navigation", "UserId", "id_pengguna");
  await renameColumnCompat(knex, "user_navigation", "Menu", "menu");
  await renameColumnCompat(knex, "user_navigation", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "user_navigation", "UpdatedAt", "updated_at");

  // 17. Table: user_credential
  await renameColumnCompat(knex, "user_credential", "Id", "id");
  await renameColumnCompat(knex, "user_credential", "UniqueId", "unique_id");
  await renameColumnCompat(knex, "user_credential", "Username", "username");
  await renameColumnCompat(knex, "user_credential", "Fullname", "fullname");
  await renameColumnCompat(knex, "user_credential", "Telp", "telp");
  await renameColumnCompat(knex, "user_credential", "Role", "role");
  await renameColumnCompat(knex, "user_credential", "Password", "password");
  await renameColumnCompat(knex, "user_credential", "Status", "status");
  await renameColumnCompat(knex, "user_credential", "CreatedAt", "created_at");
  await renameColumnCompat(knex, "user_credential", "UpdatedAt", "updated_at");

  // 18. Table: nomor_faktur
  await renameColumnCompat(knex, "nomor_faktur", "Kode", "kode");
  await renameColumnCompat(knex, "nomor_faktur", "Id", "id");

  // 19. Table: mst_visit_purpose
  await renameColumnCompat(
    knex,
    "mst_visit_purpose",
    "Description",
    "description",
  );
  await renameColumnCompat(knex, "mst_visit_purpose", "Status", "status");

  // 20. Table: trx_visitations
  await renameColumnCompat(knex, "trx_visitations", "Status", "status");

  // A failed earlier run using Knex's renameColumn may have dropped this FK
  // before it failed to recreate it. Restore it idempotently.
  await ensureForeignKey(
    knex,
    "mst_divisions_branchid_foreign",
    "mst_divisions",
    "branch_id",
    "mst_branches",
    "branch_id",
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await renameColumnCompat(knex, "trx_visitations", "status", "Status");

  await renameColumnCompat(
    knex,
    "mst_visit_purpose",
    "description",
    "Description",
  );
  await renameColumnCompat(knex, "mst_visit_purpose", "status", "Status");

  await renameColumnCompat(knex, "nomor_faktur", "kode", "Kode");
  await renameColumnCompat(knex, "nomor_faktur", "id", "Id");

  await renameColumnCompat(knex, "user_credential", "id", "Id");
  await renameColumnCompat(knex, "user_credential", "unique_id", "UniqueId");
  await renameColumnCompat(knex, "user_credential", "username", "Username");
  await renameColumnCompat(knex, "user_credential", "fullname", "Fullname");
  await renameColumnCompat(knex, "user_credential", "telp", "Telp");
  await renameColumnCompat(knex, "user_credential", "role", "Role");
  await renameColumnCompat(knex, "user_credential", "password", "Password");
  await renameColumnCompat(knex, "user_credential", "status", "Status");
  await renameColumnCompat(knex, "user_credential", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "user_credential", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "user_navigation", "id", "Id");
  await renameColumnCompat(knex, "user_navigation", "id_pengguna", "UserId");
  await renameColumnCompat(knex, "user_navigation", "menu", "Menu");
  await renameColumnCompat(knex, "user_navigation", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "user_navigation", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_navigation", "id", "Id");
  await renameColumnCompat(knex, "mst_navigation", "menu", "Menu");
  await renameColumnCompat(knex, "mst_navigation", "role", "Role");
  await renameColumnCompat(knex, "mst_navigation", "created_at", "CreatedAt");

  await renameColumnCompat(
    knex,
    "mst_role_menus",
    "role_menu_id",
    "RoleMenuId",
  );
  await renameColumnCompat(knex, "mst_role_menus", "role_id", "RoleId");
  await renameColumnCompat(knex, "mst_role_menus", "menu_id", "MenuId");
  await renameColumnCompat(knex, "mst_role_menus", "can_view", "CanView");
  await renameColumnCompat(knex, "mst_role_menus", "can_create", "CanCreate");
  await renameColumnCompat(knex, "mst_role_menus", "can_update", "CanUpdate");
  await renameColumnCompat(knex, "mst_role_menus", "can_delete", "CanDelete");
  await renameColumnCompat(knex, "mst_role_menus", "can_approve", "CanApprove");
  await renameColumnCompat(knex, "mst_role_menus", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_role_menus", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_menus", "menu_id", "MenuId");
  await renameColumnCompat(knex, "mst_menus", "parent_menu_id", "ParentMenuId");
  await renameColumnCompat(knex, "mst_menus", "menu_code", "MenuCode");
  await renameColumnCompat(knex, "mst_menus", "menu_name", "MenuName");
  await renameColumnCompat(knex, "mst_menus", "menu_path", "MenuPath");
  await renameColumnCompat(knex, "mst_menus", "menu_icon", "MenuIcon");
  await renameColumnCompat(knex, "mst_menus", "sort_order", "SortOrder");
  await renameColumnCompat(knex, "mst_menus", "is_active", "IsActive");
  await renameColumnCompat(knex, "mst_menus", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_menus", "updated_at", "UpdatedAt");

  await renameColumnCompat(
    knex,
    "mst_user_roles",
    "user_role_id",
    "UserRoleId",
  );
  await renameColumnCompat(knex, "mst_user_roles", "id_pengguna", "UserId");
  await renameColumnCompat(knex, "mst_user_roles", "role_id", "RoleId");
  await renameColumnCompat(knex, "mst_user_roles", "is_primary", "IsPrimary");
  await renameColumnCompat(knex, "mst_user_roles", "status", "Status");
  await renameColumnCompat(knex, "mst_user_roles", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_user_roles", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_roles", "role_id", "RoleId");
  await renameColumnCompat(knex, "mst_roles", "role_code", "RoleCode");
  await renameColumnCompat(knex, "mst_roles", "role_name", "RoleName");
  await renameColumnCompat(knex, "mst_roles", "description", "Description");
  await renameColumnCompat(knex, "mst_roles", "status", "Status");
  await renameColumnCompat(knex, "mst_roles", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_roles", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_users", "id_pengguna", "UserId");
  await renameColumnCompat(knex, "mst_users", "fullname", "Fullname");
  await renameColumnCompat(knex, "mst_users", "username", "Username");
  await renameColumnCompat(knex, "mst_users", "email", "Email");
  await renameColumnCompat(knex, "mst_users", "telp", "Telp");
  await renameColumnCompat(knex, "mst_users", "password", "Password");
  await renameColumnCompat(knex, "mst_users", "branch_id", "BranchId");
  await renameColumnCompat(knex, "mst_users", "division_id", "DivisionId");
  await renameColumnCompat(knex, "mst_users", "department_id", "DepartmentId");
  await renameColumnCompat(knex, "mst_users", "position_id", "PositionId");
  await renameColumnCompat(knex, "mst_users", "work_unit_id", "WorkUnitId");
  await renameColumnCompat(
    knex,
    "mst_users",
    "failed_login_attempts",
    "FailedLoginAttempts",
  );
  await renameColumnCompat(knex, "mst_users", "last_login_at", "LastLoginAt");
  await renameColumnCompat(knex, "mst_users", "status", "Status");
  await renameColumnCompat(knex, "mst_users", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_users", "updated_at", "UpdatedAt");

  await renameColumnCompat(
    knex,
    "mst_work_units",
    "work_unit_id",
    "WorkUnitId",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "department_id",
    "DepartmentId",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "work_unit_code",
    "WorkUnitCode",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "work_unit_name",
    "WorkUnitName",
  );
  await renameColumnCompat(
    knex,
    "mst_work_units",
    "description",
    "Description",
  );
  await renameColumnCompat(knex, "mst_work_units", "status", "Status");
  await renameColumnCompat(knex, "mst_work_units", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_work_units", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_positions", "position_id", "PositionId");
  await renameColumnCompat(
    knex,
    "mst_positions",
    "position_code",
    "PositionCode",
  );
  await renameColumnCompat(
    knex,
    "mst_positions",
    "position_name",
    "PositionName",
  );
  await renameColumnCompat(
    knex,
    "mst_positions",
    "position_level",
    "PositionLevel",
  );
  await renameColumnCompat(knex, "mst_positions", "description", "Description");
  await renameColumnCompat(knex, "mst_positions", "status", "Status");
  await renameColumnCompat(knex, "mst_positions", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_positions", "updated_at", "UpdatedAt");

  await renameColumnCompat(
    knex,
    "mst_departments",
    "department_id",
    "DepartmentId",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "division_id",
    "DivisionId",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "department_code",
    "DepartmentCode",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "department_name",
    "DepartmentName",
  );
  await renameColumnCompat(
    knex,
    "mst_departments",
    "description",
    "Description",
  );
  await renameColumnCompat(knex, "mst_departments", "status", "Status");
  await renameColumnCompat(knex, "mst_departments", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_departments", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_divisions", "division_id", "DivisionId");
  await renameColumnCompat(knex, "mst_divisions", "branch_id", "BranchId");
  await renameColumnCompat(
    knex,
    "mst_divisions",
    "division_code",
    "DivisionCode",
  );
  await renameColumnCompat(
    knex,
    "mst_divisions",
    "division_name",
    "DivisionName",
  );
  await renameColumnCompat(knex, "mst_divisions", "description", "Description");
  await renameColumnCompat(knex, "mst_divisions", "status", "Status");
  await renameColumnCompat(knex, "mst_divisions", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_divisions", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_branches", "branch_id", "BranchId");
  await renameColumnCompat(knex, "mst_branches", "branch_code", "BranchCode");
  await renameColumnCompat(knex, "mst_branches", "branch_name", "BranchName");
  await renameColumnCompat(knex, "mst_branches", "address", "Address");
  await renameColumnCompat(knex, "mst_branches", "telp", "Telp");
  await renameColumnCompat(knex, "mst_branches", "email", "Email");
  await renameColumnCompat(knex, "mst_branches", "status", "Status");
  await renameColumnCompat(knex, "mst_branches", "created_at", "CreatedAt");
  await renameColumnCompat(knex, "mst_branches", "updated_at", "UpdatedAt");

  await renameColumnCompat(knex, "mst_audit_trails", "id", "Id");
  await renameColumnCompat(knex, "mst_audit_trails", "username", "Username");
  await renameColumnCompat(knex, "mst_audit_trails", "role", "Role");
  await renameColumnCompat(knex, "mst_audit_trails", "action", "Action");
  await renameColumnCompat(knex, "mst_audit_trails", "ip_address", "IpAddress");
  await renameColumnCompat(knex, "mst_audit_trails", "user_agent", "UserAgent");
  await renameColumnCompat(knex, "mst_audit_trails", "status", "Status");
  await renameColumnCompat(knex, "mst_audit_trails", "created_at", "CreatedAt");

  await renameColumnCompat(knex, "log", "id", "ID");
  await renameColumnCompat(knex, "log", "tgl", "Tgl");
  await renameColumnCompat(knex, "log", "controller", "Controller");
  await renameColumnCompat(knex, "log", "function", "Function");
  await renameColumnCompat(knex, "log", "request", "Request");
  await renameColumnCompat(knex, "log", "response", "Response");
  await renameColumnCompat(knex, "log", "stack", "Stack");
  await renameColumnCompat(knex, "log", "user", "User");
  await renameColumnCompat(knex, "log", "datetime", "DateTime");

  await renameColumnCompat(knex, "config", "id", "Id");
  await renameColumnCompat(knex, "config", "kode", "Kode");
  await renameColumnCompat(knex, "config", "keterangan", "Keterangan");

  await renameColumnCompat(knex, "access_token", "id", "ID");
  await renameColumnCompat(knex, "access_token", "token", "Token");
  await renameColumnCompat(knex, "access_token", "expired", "Expired");
  await renameColumnCompat(knex, "access_token", "datetime", "Datetime");

  await knex.schema.renameTable("trx_visitations", "tr_visitations");
}
