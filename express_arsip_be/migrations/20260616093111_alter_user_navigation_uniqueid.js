/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Cek apakah UniqueId masih ada
  const hasUniqueId = await knex.schema.hasColumn('user_navigation', 'UniqueId');
  
  if (hasUniqueId) {
    // Kalau masih ada, ganti nama SEKALIGUS ganti tipe data pakai Raw SQL
    await knex.raw('ALTER TABLE user_navigation CHANGE UniqueId UserId INT;');
    console.log("Kolom UniqueId berhasil diubah menjadi UserId (INT).");
  } else {
    // Kalau ternyata udah ke-rename jadi UserId (efek crash sebelumnya), kita tinggal ganti tipenya aja
    const hasUserId = await knex.schema.hasColumn('user_navigation', 'UserId');
    if (hasUserId) {
      await knex.raw('ALTER TABLE user_navigation MODIFY UserId INT;');
      console.log("Kolom UserId berhasil diubah tipe datanya menjadi INT.");
    }
  }
}

export async function down(knex) {
  const hasUserId = await knex.schema.hasColumn('user_navigation', 'UserId');
  if (hasUserId) {
    // Kembalikan ke asalnya
    await knex.raw('ALTER TABLE user_navigation CHANGE UserId UniqueId VARCHAR(36);');
  }
}