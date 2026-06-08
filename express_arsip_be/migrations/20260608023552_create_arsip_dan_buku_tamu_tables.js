/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Tabel-tabel Master Tanpa Foreign Key Dependencies
  await knex.schema.createTable('mst_roles', (table) => {
    table.increments('RoleId').primary();
    table.string('RoleCode', 45).notNullable().unique();
    table.string('RoleName', 100).notNullable();
    table.text('Description').nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_branches', (table) => {
    table.increments('BranchId').primary();
    table.string('BranchCode', 50).notNullable().unique();
    table.string('BranchName', 100).notNullable();
    table.text('Address').nullable();
    table.string('Telp', 45).nullable();
    table.string('Email', 150).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_positions', (table) => {
    table.increments('PositionId').primary();
    table.string('PositionCode', 50).notNullable().unique();
    table.string('PositionName', 100).notNullable();
    table.integer('PositionLevel').nullable();
    table.text('Description').nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_archive_classifications', (table) => {
    table.increments('ArchiveClassificationId').primary();
    table.string('ClassificationCode', 45).notNullable().unique();
    table.string('ClassificationName', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_document_type', (table) => {
    table.increments('DocumentTypeId').primary();
    table.string('DocumentTypeCode', 45).notNullable().unique();
    table.string('DocumentTypeName', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_confidentiality_levels', (table) => {
    table.increments('ConfidentialityLevelId').primary();
    table.string('ConfidentialityLevelCode', 45).notNullable().unique();
    table.string('ConfidentialityLevelName', 100).notNullable();
    table.integer('ConfidentialityLevel').notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_visit_purpose', (table) => {
    table.integer('VisitPurposeId').primary(); // Sesuai SQL Workbench: INT NOT NULL tanpa AI
    table.string('VisitPurposeCode', 45).notNullable().unique();
    table.string('VisitPurposeName', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  // 2. Self-Referencing Table (Menus)
  await knex.schema.createTable('mst_menus', (table) => {
    table.increments('MenuId').primary();
    table.integer('ParentMenuId').unsigned().nullable().references('MenuId').inTable('mst_menus').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('MenuCode', 45).notNullable().unique();
    table.string('MenuName', 45).notNullable();
    table.string('MenuPath', 255).nullable();
    table.string('MenuIcon', 100).nullable();
    table.integer('SortOrder').notNullable().defaultTo(0);
    table.tinyint('IsActive').notNullable().defaultTo(1);
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  // 3. Tabel dengan Single Dependency
  await knex.schema.createTable('mst_divisions', (table) => {
    table.increments('DivisionId').primary();
    table.integer('BranchId').unsigned().notNullable().references('BranchId').inTable('mst_branches').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('DivisionCode', 45).notNullable().unique();
    table.string('DivisionName', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_document_categories', (table) => {
    table.increments('DocumentCategoryId').primary();
    table.integer('ArchiveClassificationId').unsigned().notNullable().references('ArchiveClassificationId').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('DocumentCategoryCode', 45).notNullable().unique();
    table.string('DocumentCategoryName', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_role_menus', (table) => {
    table.increments('RoleMenuId').primary();
    table.integer('RoleId').unsigned().notNullable().references('RoleId').inTable('mst_roles').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('MenuId').unsigned().notNullable().references('MenuId').inTable('mst_menus').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.tinyint('CanView').notNullable().defaultTo(1);
    table.tinyint('CanCreate').notNullable().defaultTo(0);
    table.tinyint('CanUpdate').notNullable().defaultTo(0);
    table.tinyint('CanDelete').notNullable().defaultTo(0);
    table.tinyint('CanApprove').notNullable().defaultTo(0);
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  // 4. Tabel dengan Multi Dependency / Bertingkat
  await knex.schema.createTable('mst_departments', (table) => {
    table.increments('DepartmentId').primary();
    table.integer('DivisionId').unsigned().notNullable().references('DivisionId').inTable('mst_divisions').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('DepartmentCode', 50).notNullable().unique();
    table.string('DepartmentName', 150).notNullable();
    table.text('Description').nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_retention_schedule', (table) => {
    table.increments('RetentionScheduleId').primary();
    table.integer('DocumentCategoryId').unsigned().notNullable().references('DocumentCategoryId').inTable('mst_document_categories').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('RetentionCode', 45).notNullable().unique();
    table.string('RetentionName', 45).notNullable();
    table.integer('RetentionYears').notNullable();
    table.string('RetentionAction', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_work_units', (table) => {
    table.increments('WorkUnitId').primary();
    table.integer('DepartmentId').unsigned().notNullable().references('DepartmentId').inTable('mst_departments').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('WorkUnitCode', 45).notNullable().unique();
    table.string('WorkUnitName', 45).notNullable();
    table.string('Description', 45).nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable();
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  // 5. Master Users & User Roles (Paling akhir karena bergantung pada cabang, divisi, dll)
  await knex.schema.createTable('mst_users', (table) => {
    table.increments('UserId').primary();
    table.string('Fullname', 45).notNullable();
    table.string('Username', 45).notNullable().unique();
    table.string('Email', 45).nullable();
    table.string('Telp', 45).nullable();
    table.string('Password', 100).notNullable();
    table.integer('BranchId').unsigned().notNullable().references('BranchId').inTable('mst_branches').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('DivisionId').unsigned().notNullable().references('DivisionId').inTable('mst_divisions').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('DepartmentId').unsigned().notNullable().references('DepartmentId').inTable('mst_departments').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('PositionId').unsigned().notNullable().references('PositionId').inTable('mst_positions').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('WorkUnitId').unsigned().notNullable().references('WorkUnitId').inTable('mst_work_units').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('FailedLoginAttempts').nullable().defaultTo(0);
    table.datetime('LastLoginAt').nullable();
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable();
    table.datetime('UpdatedAt').notNullable();
  });

  await knex.schema.createTable('mst_user_roles', (table) => {
    table.increments('UserRoleId').primary();
    // Perbaikan: Diubah menjadi kolom biasa bermitra FK ke mst_users karena rancangan virtual kolom sebelumnya error
    table.integer('UserId').unsigned().notNullable().references('UserId').inTable('mst_users').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('RoleId').unsigned().notNullable().references('RoleId').inTable('mst_roles').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.tinyint('IsPrimary').nullable().defaultTo(0);
    table.enu('Status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('CreatedAt').notNullable(); 
    table.datetime('UpdatedAt').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Drop dengan urutan terbalik untuk menghindari Foreign Key Violation
  await knex.schema.dropTableIfExists('mst_user_roles');
  await knex.schema.dropTableIfExists('mst_users');
  await knex.schema.dropTableIfExists('mst_work_units');
  await knex.schema.dropTableIfExists('mst_retention_schedule');
  await knex.schema.dropTableIfExists('mst_departments');
  await knex.schema.dropTableIfExists('mst_role_menus');
  await knex.schema.dropTableIfExists('mst_document_categories');
  await knex.schema.dropTableIfExists('mst_divisions');
  await knex.schema.dropTableIfExists('mst_menus');
  await knex.schema.dropTableIfExists('mst_visit_purpose');
  await knex.schema.dropTableIfExists('mst_confidentiality_levels');
  await knex.schema.dropTableIfExists('mst_document_type');
  await knex.schema.dropTableIfExists('mst_archive_classifications');
  await knex.schema.dropTableIfExists('mst_positions');
  await knex.schema.dropTableIfExists('mst_branches');
  await knex.schema.dropTableIfExists('mst_roles');
};
