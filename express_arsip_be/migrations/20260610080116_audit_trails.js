/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable("mst_riwayat_audit", function (table) {
    table.increments("id").primary();
    table.string("nama_pengguna", 100).notNullable();
    table.string("peran", 50).notNullable();
    table.string("action", 100).notNullable();
    table.string("ip_alamat", 50);
    table.text("user_agent");
    table.string("status", 50);
    table.datetime("created_at");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTableIfExists("mst_riwayat_audit");
};
