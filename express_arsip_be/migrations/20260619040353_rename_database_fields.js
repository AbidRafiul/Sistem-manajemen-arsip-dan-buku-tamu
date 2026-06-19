/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 0. Rename Tabel tr_visitations -> trx_visitations
    await knex.schema.renameTable('tr_visitations', 'trx_visitations');

    // 1. Table: access_token
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `ID` TO `id`');
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `Token` TO `token`');
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `Expired` TO `expired`');
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `Datetime` TO `datetime`');

    // 2. Table: config
    await knex.raw('ALTER TABLE `config` RENAME COLUMN `Id` TO `id`');
    await knex.raw('ALTER TABLE `config` RENAME COLUMN `Kode` TO `kode`');
    await knex.raw('ALTER TABLE `config` RENAME COLUMN `Keterangan` TO `keterangan`');

    // 3. Table: log
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `ID` TO `id`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `Tgl` TO `tgl`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `Controller` TO `controller`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `Function` TO `function`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `Request` TO `request`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `Response` TO `response`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `Stack` TO `stack`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `User` TO `user`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `DateTime` TO `datetime`');

    // 4. Table: mst_audit_trails
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `Id` TO `id`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `Username` TO `username`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `Role` TO `role`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `Action` TO `action`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `IpAddress` TO `ip_address`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `UserAgent` TO `user_agent`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `CreatedAt` TO `created_at`');

    // 5. Table: mst_branches
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `BranchId` TO `branch_id`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `BranchCode` TO `branch_code`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `BranchName` TO `branch_name`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `Address` TO `address`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `Telp` TO `telp`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `Email` TO `email`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 6. Table: mst_divisions
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `DivisionId` TO `division_id`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `BranchId` TO `branch_id`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `DivisionCode` TO `division_code`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `DivisionName` TO `division_name`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 7. Table: mst_departments
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `DepartmentId` TO `department_id`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `DivisionId` TO `division_id`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `DepartmentCode` TO `department_code`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `DepartmentName` TO `department_name`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 8. Table: mst_positions
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `PositionId` TO `position_id`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `PositionCode` TO `position_code`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `PositionName` TO `position_name`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `PositionLevel` TO `position_level`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 9. Table: mst_work_units
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `WorkUnitId` TO `work_unit_id`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `DepartmentId` TO `department_id`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `WorkUnitCode` TO `work_unit_code`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `WorkUnitName` TO `work_unit_name`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 10. Table: mst_users
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `UserId` TO `user_id`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `Fullname` TO `fullname`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `Username` TO `username`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `Email` TO `email`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `Telp` TO `telp`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `Password` TO `password`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `BranchId` TO `branch_id`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `DivisionId` TO `division_id`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `DepartmentId` TO `department_id`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `PositionId` TO `position_id`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `WorkUnitId` TO `work_unit_id`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `FailedLoginAttempts` TO `failed_login_attempts`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `LastLoginAt` TO `last_login_at`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 11. Table: mst_roles
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `RoleId` TO `role_id`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `RoleCode` TO `role_code`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `RoleName` TO `role_name`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 12. Table: mst_user_roles
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `UserRoleId` TO `user_role_id`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `UserId` TO `user_id`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `RoleId` TO `role_id`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `IsPrimary` TO `is_primary`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 13. Table: mst_menus
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `MenuId` TO `menu_id`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `ParentMenuId` TO `parent_menu_id`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `MenuCode` TO `menu_code`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `MenuName` TO `menu_name`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `MenuPath` TO `menu_path`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `MenuIcon` TO `menu_icon`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `SortOrder` TO `sort_order`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `IsActive` TO `is_active`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 14. Table: mst_role_menus
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `RoleMenuId` TO `role_menu_id`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `RoleId` TO `role_id`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `MenuId` TO `menu_id`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `CanView` TO `can_view`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `CanCreate` TO `can_create`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `CanUpdate` TO `can_update`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `CanDelete` TO `can_delete`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `CanApprove` TO `can_approve`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 15. Table: mst_navigation
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `Id` TO `id`');
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `Menu` TO `menu`');
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `Role` TO `role`');
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `CreatedAt` TO `created_at`');

    // 16. Table: user_navigation
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `Id` TO `id`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `UserId` TO `user_id`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `Menu` TO `menu`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 17. Table: user_credential
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Id` TO `id`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `UniqueId` TO `unique_id`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Username` TO `username`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Fullname` TO `fullname`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Telp` TO `telp`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Role` TO `role`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Password` TO `password`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `Status` TO `status`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `UpdatedAt` TO `updated_at`');

    // 18. Table: nomor_faktur
    await knex.raw('ALTER TABLE `nomor_faktur` RENAME COLUMN `Kode` TO `kode`');
    await knex.raw('ALTER TABLE `nomor_faktur` RENAME COLUMN `Id` TO `id`');

    // 19. Table: mst_visit_purpose
    await knex.raw('ALTER TABLE `mst_visit_purpose` RENAME COLUMN `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_visit_purpose` RENAME COLUMN `Status` TO `status`');

    // 20. Table: trx_visitations
    await knex.raw('ALTER TABLE `trx_visitations` RENAME COLUMN `Status` TO `status`');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.raw('ALTER TABLE `trx_visitations` RENAME COLUMN `status` TO `Status`');

    await knex.raw('ALTER TABLE `mst_visit_purpose` RENAME COLUMN `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_visit_purpose` RENAME COLUMN `status` TO `Status`');

    await knex.raw('ALTER TABLE `nomor_faktur` RENAME COLUMN `kode` TO `Kode`');
    await knex.raw('ALTER TABLE `nomor_faktur` RENAME COLUMN `id` TO `Id`');

    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `id` TO `Id`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `unique_id` TO `UniqueId`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `username` TO `Username`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `fullname` TO `Fullname`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `telp` TO `Telp`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `role` TO `Role`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `password` TO `Password`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `user_credential` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `id` TO `Id`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `user_id` TO `UserId`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `menu` TO `Menu`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `user_navigation` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `id` TO `Id`');
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `menu` TO `Menu`');
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `role` TO `Role`');
    await knex.raw('ALTER TABLE `mst_navigation` RENAME COLUMN `created_at` TO `CreatedAt`');

    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `role_menu_id` TO `RoleMenuId`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `role_id` TO `RoleId`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `menu_id` TO `MenuId`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `can_view` TO `CanView`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `can_create` TO `CanCreate`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `can_update` TO `CanUpdate`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `can_delete` TO `CanDelete`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `can_approve` TO `CanApprove`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_role_menus` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `menu_id` TO `MenuId`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `parent_menu_id` TO `ParentMenuId`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `menu_code` TO `MenuCode`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `menu_name` TO `MenuName`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `menu_path` TO `MenuPath`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `menu_icon` TO `MenuIcon`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `sort_order` TO `SortOrder`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `is_active` TO `IsActive`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_menus` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `user_role_id` TO `UserRoleId`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `user_id` TO `UserId`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `role_id` TO `RoleId`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `is_primary` TO `IsPrimary`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_user_roles` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `role_id` TO `RoleId`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `role_code` TO `RoleCode`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `role_name` TO `RoleName`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_roles` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `user_id` TO `UserId`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `fullname` TO `Fullname`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `username` TO `Username`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `email` TO `Email`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `telp` TO `Telp`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `password` TO `Password`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `branch_id` TO `BranchId`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `division_id` TO `DivisionId`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `department_id` TO `DepartmentId`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `position_id` TO `PositionId`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `work_unit_id` TO `WorkUnitId`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `failed_login_attempts` TO `FailedLoginAttempts`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `last_login_at` TO `LastLoginAt`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_users` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `work_unit_id` TO `WorkUnitId`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `department_id` TO `DepartmentId`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `work_unit_code` TO `WorkUnitCode`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `work_unit_name` TO `WorkUnitName`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_work_units` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `position_id` TO `PositionId`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `position_code` TO `PositionCode`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `position_name` TO `PositionName`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `position_level` TO `PositionLevel`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_positions` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `department_id` TO `DepartmentId`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `division_id` TO `DivisionId`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `department_code` TO `DepartmentCode`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `department_name` TO `DepartmentName`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_departments` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `division_id` TO `DivisionId`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `branch_id` TO `BranchId`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `division_code` TO `DivisionCode`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `division_name` TO `DivisionName`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_divisions` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `branch_id` TO `BranchId`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `branch_code` TO `BranchCode`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `branch_name` TO `BranchName`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `address` TO `Address`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `telp` TO `Telp`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `email` TO `Email`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_branches` RENAME COLUMN `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `id` TO `Id`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `username` TO `Username`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `role` TO `Role`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `action` TO `Action`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `ip_address` TO `IpAddress`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `user_agent` TO `UserAgent`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `created_at` TO `CreatedAt`');

    await knex.raw('ALTER TABLE `log` RENAME COLUMN `id` TO `ID`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `tgl` TO `Tgl`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `controller` TO `Controller`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `function` TO `Function`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `request` TO `Request`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `response` TO `Response`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `stack` TO `Stack`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `user` TO `User`');
    await knex.raw('ALTER TABLE `log` RENAME COLUMN `datetime` TO `DateTime`');

    await knex.raw('ALTER TABLE `config` RENAME COLUMN `id` TO `Id`');
    await knex.raw('ALTER TABLE `config` RENAME COLUMN `kode` TO `Kode`');
    await knex.raw('ALTER TABLE `config` RENAME COLUMN `keterangan` TO `Keterangan`');

    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `id` TO `ID`');
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `token` TO `Token`');
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `expired` TO `Expired`');
    await knex.raw('ALTER TABLE `access_token` RENAME COLUMN `datetime` TO `Datetime`');

    await knex.schema.renameTable('trx_visitations', 'tr_visitations');
}