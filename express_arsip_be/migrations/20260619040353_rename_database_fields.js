/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    // 0. Rename Tabel tr_visitations -> trx_visitations
    await knex.schema.renameTable('tr_visitations', 'trx_visitations');

    // 1. Table: access_token
    await knex.raw('ALTER TABLE `access_token` CHANGE `ID` TO `id`');
    await knex.raw('ALTER TABLE `access_token` CHANGE `Token` TO `token`');
    await knex.raw('ALTER TABLE `access_token` CHANGE `Expired` TO `expired`');
    await knex.raw('ALTER TABLE `access_token` CHANGE `Datetime` TO `datetime`');

    // 2. Table: config
    await knex.raw('ALTER TABLE `config` CHANGE `Id` TO `id`');
    await knex.raw('ALTER TABLE `config` CHANGE `Kode` TO `kode`');
    await knex.raw('ALTER TABLE `config` CHANGE `Keterangan` TO `keterangan`');

    // 3. Table: log
    await knex.raw('ALTER TABLE `log` CHANGE `ID` TO `id`');
    await knex.raw('ALTER TABLE `log` CHANGE `Tgl` TO `tgl`');
    await knex.raw('ALTER TABLE `log` CHANGE `Controller` TO `controller`');
    await knex.raw('ALTER TABLE `log` CHANGE `Function` TO `function`');
    await knex.raw('ALTER TABLE `log` CHANGE `Request` TO `request`');
    await knex.raw('ALTER TABLE `log` CHANGE `Response` TO `response`');
    await knex.raw('ALTER TABLE `log` CHANGE `Stack` TO `stack`');
    await knex.raw('ALTER TABLE `log` CHANGE `User` TO `user`');
    await knex.raw('ALTER TABLE `log` CHANGE `DateTime` TO `datetime`');

    // 4. Table: mst_audit_trails
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `Id` TO `id`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `Username` TO `username`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `Role` TO `role`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `Action` TO `action`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `IpAddress` TO `ip_address`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `UserAgent` TO `user_agent`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `CreatedAt` TO `created_at`');

    // 5. Table: mst_branches
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `BranchId` TO `branch_id`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `BranchCode` TO `branch_code`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `BranchName` TO `branch_name`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `Address` TO `address`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `Telp` TO `telp`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `Email` TO `email`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `UpdatedAt` TO `updated_at`');

    // 6. Table: mst_divisions
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `DivisionId` TO `division_id`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `BranchId` TO `branch_id`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `DivisionCode` TO `division_code`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `DivisionName` TO `division_name`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `UpdatedAt` TO `updated_at`');

    // 7. Table: mst_departments
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `DepartmentId` TO `department_id`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `DivisionId` TO `division_id`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `DepartmentCode` TO `department_code`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `DepartmentName` TO `department_name`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `UpdatedAt` TO `updated_at`');

    // 8. Table: mst_positions
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `PositionId` TO `position_id`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `PositionCode` TO `position_code`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `PositionName` TO `position_name`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `PositionLevel` TO `position_level`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `UpdatedAt` TO `updated_at`');

    // 9. Table: mst_work_units
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `WorkUnitId` TO `work_unit_id`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `DepartmentId` TO `department_id`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `WorkUnitCode` TO `work_unit_code`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `WorkUnitName` TO `work_unit_name`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `UpdatedAt` TO `updated_at`');

    // 10. Table: mst_users
    await knex.raw('ALTER TABLE `mst_users` CHANGE `UserId` TO `user_id`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `Fullname` TO `fullname`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `Username` TO `username`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `Email` TO `email`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `Telp` TO `telp`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `Password` TO `password`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `BranchId` TO `branch_id`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `DivisionId` TO `division_id`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `DepartmentId` TO `department_id`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `PositionId` TO `position_id`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `WorkUnitId` TO `work_unit_id`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `FailedLoginAttempts` TO `failed_login_attempts`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `LastLoginAt` TO `last_login_at`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `UpdatedAt` TO `updated_at`');

    // 11. Table: mst_roles
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `RoleId` TO `role_id`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `RoleCode` TO `role_code`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `RoleName` TO `role_name`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `UpdatedAt` TO `updated_at`');

    // 12. Table: mst_user_roles
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `UserRoleId` TO `user_role_id`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `UserId` TO `user_id`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `RoleId` TO `role_id`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `IsPrimary` TO `is_primary`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `UpdatedAt` TO `updated_at`');

    // 13. Table: mst_menus
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `MenuId` TO `menu_id`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `ParentMenuId` TO `parent_menu_id`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `MenuCode` TO `menu_code`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `MenuName` TO `menu_name`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `MenuPath` TO `menu_path`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `MenuIcon` TO `menu_icon`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `SortOrder` TO `sort_order`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `IsActive` TO `is_active`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `UpdatedAt` TO `updated_at`');

    // 14. Table: mst_role_menus
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `RoleMenuId` TO `role_menu_id`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `RoleId` TO `role_id`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `MenuId` TO `menu_id`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `CanView` TO `can_view`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `CanCreate` TO `can_create`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `CanUpdate` TO `can_update`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `CanDelete` TO `can_delete`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `CanApprove` TO `can_approve`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `UpdatedAt` TO `updated_at`');

    // 15. Table: mst_navigation
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `Id` TO `id`');
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `Menu` TO `menu`');
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `Role` TO `role`');
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `CreatedAt` TO `created_at`');

    // 16. Table: user_navigation
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `Id` TO `id`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `UserId` TO `user_id`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `Menu` TO `menu`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `UpdatedAt` TO `updated_at`');

    // 17. Table: user_credential
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Id` TO `id`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `UniqueId` TO `unique_id`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Username` TO `username`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Fullname` TO `fullname`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Telp` TO `telp`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Role` TO `role`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Password` TO `password`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `Status` TO `status`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `CreatedAt` TO `created_at`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `UpdatedAt` TO `updated_at`');

    // 18. Table: nomor_faktur
    await knex.raw('ALTER TABLE `nomor_faktur` CHANGE `Kode` TO `kode`');
    await knex.raw('ALTER TABLE `nomor_faktur` CHANGE `Id` TO `id`');

    // 19. Table: mst_visit_purpose
    await knex.raw('ALTER TABLE `mst_visit_purpose` CHANGE `Description` TO `description`');
    await knex.raw('ALTER TABLE `mst_visit_purpose` CHANGE `Status` TO `status`');

    // 20. Table: trx_visitations
    await knex.raw('ALTER TABLE `trx_visitations` CHANGE `Status` TO `status`');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.raw('ALTER TABLE `trx_visitations` CHANGE `status` TO `Status`');

    await knex.raw('ALTER TABLE `mst_visit_purpose` CHANGE `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_visit_purpose` RENAME COLUMN `status` TO `Status`');

    await knex.raw('ALTER TABLE `nomor_faktur` CHANGE `kode` TO `Kode`');
    await knex.raw('ALTER TABLE `nomor_faktur` CHANGE `id` TO `Id`');

    await knex.raw('ALTER TABLE `user_credential` CHANGE `id` TO `Id`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `unique_id` TO `UniqueId`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `username` TO `Username`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `fullname` TO `Fullname`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `telp` TO `Telp`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `role` TO `Role`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `password` TO `Password`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `user_credential` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `user_navigation` CHANGE `id` TO `Id`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `user_id` TO `UserId`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `menu` TO `Menu`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `user_navigation` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `id` TO `Id`');
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `menu` TO `Menu`');
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `role` TO `Role`');
    await knex.raw('ALTER TABLE `mst_navigation` CHANGE `created_at` TO `CreatedAt`');

    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `role_menu_id` TO `RoleMenuId`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `role_id` TO `RoleId`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `menu_id` TO `MenuId`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `can_view` TO `CanView`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `can_create` TO `CanCreate`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `can_update` TO `CanUpdate`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `can_delete` TO `CanDelete`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `can_approve` TO `CanApprove`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_role_menus` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_menus` CHANGE `menu_id` TO `MenuId`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `parent_menu_id` TO `ParentMenuId`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `menu_code` TO `MenuCode`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `menu_name` TO `MenuName`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `menu_path` TO `MenuPath`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `menu_icon` TO `MenuIcon`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `sort_order` TO `SortOrder`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `is_active` TO `IsActive`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_menus` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `user_role_id` TO `UserRoleId`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `user_id` TO `UserId`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `role_id` TO `RoleId`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `is_primary` TO `IsPrimary`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_user_roles` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_roles` CHANGE `role_id` TO `RoleId`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `role_code` TO `RoleCode`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `role_name` TO `RoleName`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_roles` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_users` CHANGE `user_id` TO `UserId`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `fullname` TO `Fullname`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `username` TO `Username`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `email` TO `Email`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `telp` TO `Telp`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `password` TO `Password`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `branch_id` TO `BranchId`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `division_id` TO `DivisionId`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `department_id` TO `DepartmentId`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `position_id` TO `PositionId`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `work_unit_id` TO `WorkUnitId`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `failed_login_attempts` TO `FailedLoginAttempts`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `last_login_at` TO `LastLoginAt`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_users` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `work_unit_id` TO `WorkUnitId`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `department_id` TO `DepartmentId`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `work_unit_code` TO `WorkUnitCode`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `work_unit_name` TO `WorkUnitName`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_work_units` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_positions` CHANGE `position_id` TO `PositionId`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `position_code` TO `PositionCode`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `position_name` TO `PositionName`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `position_level` TO `PositionLevel`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_positions` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_departments` CHANGE `department_id` TO `DepartmentId`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `division_id` TO `DivisionId`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `department_code` TO `DepartmentCode`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `department_name` TO `DepartmentName`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_departments` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `division_id` TO `DivisionId`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `branch_id` TO `BranchId`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `division_code` TO `DivisionCode`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `division_name` TO `DivisionName`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `description` TO `Description`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_divisions` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_branches` CHANGE `branch_id` TO `BranchId`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `branch_code` TO `BranchCode`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `branch_name` TO `BranchName`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `address` TO `Address`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `telp` TO `Telp`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `email` TO `Email`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `created_at` TO `CreatedAt`');
    await knex.raw('ALTER TABLE `mst_branches` CHANGE `updated_at` TO `UpdatedAt`');

    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `id` TO `Id`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `username` TO `Username`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `role` TO `Role`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `action` TO `Action`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `ip_address` TO `IpAddress`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `user_agent` TO `UserAgent`');
    await knex.raw('ALTER TABLE `mst_audit_trails` CHANGE `status` TO `Status`');
    await knex.raw('ALTER TABLE `mst_audit_trails` RENAME COLUMN `created_at` TO `CreatedAt`');

    await knex.raw('ALTER TABLE `log` CHANGE `id` TO `ID`');
    await knex.raw('ALTER TABLE `log` CHANGE `tgl` TO `Tgl`');
    await knex.raw('ALTER TABLE `log` CHANGE `controller` TO `Controller`');
    await knex.raw('ALTER TABLE `log` CHANGE `function` TO `Function`');
    await knex.raw('ALTER TABLE `log` CHANGE `request` TO `Request`');
    await knex.raw('ALTER TABLE `log` CHANGE `response` TO `Response`');
    await knex.raw('ALTER TABLE `log` CHANGE `stack` TO `Stack`');
    await knex.raw('ALTER TABLE `log` CHANGE `user` TO `User`');
    await knex.raw('ALTER TABLE `log` CHANGE `datetime` TO `DateTime`');

    await knex.raw('ALTER TABLE `config` CHANGE `id` TO `Id`');
    await knex.raw('ALTER TABLE `config` CHANGE `kode` TO `Kode`');
    await knex.raw('ALTER TABLE `config` CHANGE `keterangan` TO `Keterangan`');

    await knex.raw('ALTER TABLE `access_token` CHANGE `id` TO `ID`');
    await knex.raw('ALTER TABLE `access_token` CHANGE `token` TO `Token`');
    await knex.raw('ALTER TABLE `access_token` CHANGE `expired` TO `Expired`');
    await knex.raw('ALTER TABLE `access_token` CHANGE `datetime` TO `Datetime`');

    await knex.schema.renameTable('trx_visitations', 'tr_visitations');
}