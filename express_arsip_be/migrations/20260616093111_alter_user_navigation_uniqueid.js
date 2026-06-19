/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Cek apakah kolom lama (UniqueId) masih ada
  const hasUniqueId = await knex.schema.hasColumn('user_navigation', 'UniqueId');
  
  if (hasUniqueId) {
    // Rename sekaligus ubah tipe data ke INT untuk konsistensi dengan mst_users.user_id
    await knex.raw('ALTER TABLE user_navigation CHANGE UniqueId user_id INT;');
    console.log("Kolom UniqueId berhasil diubah menjadi user_id (INT).");
  } else {
    // Cek jika sudah bernama user_id, pastikan tipe datanya adalah INT
    const hasUserId = await knex.schema.hasColumn('user_navigation', 'user_id');
    if (hasUserId) {
      await knex.raw('ALTER TABLE user_navigation MODIFY user_id INT;');
      console.log("Kolom user_id sudah sesuai dan dikonfirmasi sebagai INT.");
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasUserId = await knex.schema.hasColumn('user_navigation', 'user_id');
  if (hasUserId) {
    // Rollback: Kembalikan ke format lama jika diperlukan
    await knex.raw('ALTER TABLE user_navigation CHANGE user_id unique_id VARCHAR(36);');
  }
}