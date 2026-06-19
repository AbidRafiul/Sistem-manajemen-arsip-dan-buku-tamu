/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Mengubah kolom Password menjadi varchar(255)
  await knex.schema.alterTable('mst_users', (table) => {
    table.string('Password', 255).notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Mengembalikan ke varchar(100) jika ingin dibatalkan (rollback)
  await knex.schema.alterTable('mst_users', (table) => {
    table.string('Password', 100).notNullable().alter();
  });
}