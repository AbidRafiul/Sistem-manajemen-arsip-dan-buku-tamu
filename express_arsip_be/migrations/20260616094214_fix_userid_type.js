// ngerubah type data

export async function up(knex) {
  // 1. Sapu bersih data rongsokan 'USR...' biar kolomnya kosong
  await knex('user_navigation').truncate();
  
  // 2. Ubah tipe datanya jadi INT (Pakai Raw Query biar anti-error di MySQL)
  await knex.raw('ALTER TABLE user_navigation MODIFY COLUMN user_id INT');
}

export async function down(knex) {
  await knex.raw('ALTER TABLE user_navigation MODIFY COLUMN user_id VARCHAR(36)');
}