/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('mst_audit_trails', function(table) {
    table.increments('Id').primary();
    table.string('Username', 100).notNullable();
    table.string('Role', 50).notNullable(); // <--- TAMBAHIN INI
    table.string('Action', 100).notNullable(); 
    table.string('IpAddress', 50);
    table.text('UserAgent');
    table.string('Status', 50);
    table.datetime('CreatedAt');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTableIfExists('mst_audit_trails');
};