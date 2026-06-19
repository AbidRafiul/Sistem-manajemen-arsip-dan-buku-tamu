/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Tabel-tabel Master Tanpa Foreign Key Dependencies
  await knex.schema.createTable('mst_roles', (table) => {
    table.increments('role_id').primary();
    table.string('role_code', 45).notNullable().unique();
    table.string('role_name', 100).notNullable();
    table.text('description').nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_branches', (table) => {
    table.increments('branch_id').primary();
    table.string('branch_code', 50).notNullable().unique();
    table.string('branch_name', 100).notNullable();
    table.text('address').nullable();
    table.string('telp', 45).nullable();
    table.string('email', 150).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_positions', (table) => {
    table.increments('position_id').primary();
    table.string('position_code', 50).notNullable().unique();
    table.string('position_name', 100).notNullable();
    table.integer('position_level').nullable();
    table.text('description').nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_archive_classifications', (table) => {
    table.increments('archive_classification_id').primary();
    table.string('classification_code', 45).notNullable().unique();
    table.string('classification_name', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_document_type', (table) => {
    table.increments('document_type_id').primary();
    table.string('document_type_code', 45).notNullable().unique();
    table.string('document_type_name', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_confidentiality_levels', (table) => {
    table.increments('confidentiality_level_id').primary();
    table.string('confidentiality_level_code', 45).notNullable().unique();
    table.string('confidentiality_level_name', 100).notNullable();
    table.integer('confidentiality_level').notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_visit_purpose', (table) => {
    table.integer('visit_purpose_id').primary(); // Sesuai SQL Workbench: INT NOT NULL tanpa AI
    table.string('visit_purpose_code', 45).notNullable().unique();
    table.string('visit_purpose_name', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  // 2. Self-Referencing Table (Menus)
  await knex.schema.createTable('mst_menus', (table) => {
    table.increments('menu_id').primary();
    table.integer('parent_menu_id').unsigned().nullable().references('menu_id').inTable('mst_menus').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('menu_code', 45).notNullable().unique();
    table.string('menu_name', 45).notNullable();
    table.string('menu_path', 255).nullable();
    table.string('menu_icon', 100).nullable();
    table.integer('sort_order').notNullable().defaultTo(0);
    table.tinyint('is_active').notNullable().defaultTo(1);
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  // 3. Tabel dengan Single Dependency
  await knex.schema.createTable('mst_divisions', (table) => {
    table.increments('division_id').primary();
    table.integer('branch_id').unsigned().notNullable().references('branch_id').inTable('mst_branches').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('division_code', 45).notNullable().unique();
    table.string('division_name', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_document_categories', (table) => {
    table.increments('document_category_id').primary();
    table.integer('archive_classification_id').unsigned().notNullable().references('archive_classification_id').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('document_category_code', 45).notNullable().unique();
    table.string('document_category_name', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_role_menus', (table) => {
    table.increments('role_menu_id').primary();
    table.integer('role_id').unsigned().notNullable().references('role_id').inTable('mst_roles').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('menu_id').unsigned().notNullable().references('menu_id').inTable('mst_menus').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.tinyint('can_view').notNullable().defaultTo(1);
    table.tinyint('can_create').notNullable().defaultTo(0);
    table.tinyint('can_update').notNullable().defaultTo(0);
    table.tinyint('can_delete').notNullable().defaultTo(0);
    table.tinyint('can_approve').notNullable().defaultTo(0);
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  // 4. Tabel dengan Multi Dependency / Bertingkat
  await knex.schema.createTable('mst_departments', (table) => {
    table.increments('department_id').primary();
    table.integer('division_id').unsigned().notNullable().references('division_id').inTable('mst_divisions').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('department_code', 50).notNullable().unique();
    table.string('department_name', 150).notNullable();
    table.text('description').nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_retention_schedule', (table) => {
    table.increments('retention_schedule_id').primary();
    table.integer('document_category_id').unsigned().notNullable().references('document_category_id').inTable('mst_document_categories').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('retention_code', 45).notNullable().unique();
    table.string('retention_name', 45).notNullable();
    table.integer('retention_years').notNullable();
    table.string('retention_action', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_work_units', (table) => {
    table.increments('work_unit_id').primary();
    table.integer('department_id').unsigned().notNullable().references('department_id').inTable('mst_departments').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.string('work_unit_code', 45).notNullable().unique();
    table.string('work_unit_name', 45).notNullable();
    table.string('description', 45).nullable();
    table.enu('status', ['active', 'nonactive']).notNullable();
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  // 5. Master Users & User Roles (Paling akhir karena bergantung pada cabang, divisi, dll)
  await knex.schema.createTable('mst_users', (table) => {
    table.increments('user_id').primary();
    table.string('fullname', 45).notNullable();
    table.string('username', 45).notNullable().unique();
    table.string('email', 45).nullable();
    table.string('telp', 45).nullable();
    table.string('password', 100).notNullable();
    table.integer('branch_id').unsigned().notNullable().references('branch_id').inTable('mst_branches').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('division_id').unsigned().notNullable().references('division_id').inTable('mst_divisions').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('department_id').unsigned().notNullable().references('department_id').inTable('mst_departments').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('position_id').unsigned().notNullable().references('position_id').inTable('mst_positions').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('work_unit_id').unsigned().notNullable().references('work_unit_id').inTable('mst_work_units').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('failed_login_attempts').nullable().defaultTo(0);
    table.datetime('last_login_at').nullable();
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('mst_user_roles', (table) => {
    table.increments('user_role_id').primary();
    table.integer('user_id').unsigned().notNullable().references('user_id').inTable('mst_users').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.integer('role_id').unsigned().notNullable().references('role_id').inTable('mst_roles').onDelete('NO ACTION').onUpdate('NO ACTION');
    table.tinyint('is_primary').nullable().defaultTo(0);
    table.enu('status', ['active', 'nonactive']).notNullable().defaultTo('active');
    table.datetime('created_at').notNullable(); 
    table.datetime('updated_at').notNullable();
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