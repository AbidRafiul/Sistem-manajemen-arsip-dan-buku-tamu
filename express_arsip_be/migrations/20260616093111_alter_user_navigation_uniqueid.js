// tempat di user navigation

export async function up(knex) {
  // 1. Ubah nama kolomnya dulu dari UniqueId ke UserId
  await knex.schema.alterTable('user_navigation', (table) => {
    table.renameColumn('UniqueId', 'UserId');
  });
  
  // 2. Ubah tipe datanya menjadi INT (Integer)
  await knex.schema.alterTable('user_navigation', (table) => {
    table.integer('UserId').alter();
  });
}

export async function down(knex) {
  // Rollback 1: Balikin tipe data ke string (VARCHAR) kalau ada masalah
  await knex.schema.alterTable('user_navigation', (table) => {
    table.string('UserId', 36).alter();
  });
  
  // Rollback 2: Balikin namanya jadi UniqueId lagi
  await knex.schema.alterTable('user_navigation', (table) => {
    table.renameColumn('UserId', 'UniqueId');
  });
}