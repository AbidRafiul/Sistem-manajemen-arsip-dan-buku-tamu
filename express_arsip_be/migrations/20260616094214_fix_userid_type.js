// ngerubah type data

export async function up(knex) {
  // 1. Sapu bersih data rongsokan 'USR...' biar kolomnya kosong
  await knex("navigasi_pengguna").truncate();

  // 2. Ubah tipe datanya jadi INT (Pakai Raw Query biar anti-error di MySQL)
  await knex.raw(
    "ALTER TABLE navigasi_pengguna MODIFY COLUMN nama_pengguna INT",
  );
}

export async function down(knex) {
  await knex.raw(
    "ALTER TABLE navigasi_pengguna MODIFY COLUMN nama_pengguna VARCHAR(36)",
  );
}
