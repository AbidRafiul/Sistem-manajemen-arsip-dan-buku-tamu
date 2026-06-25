/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Cek apakah kolom lama (UniqueId) masih ada
  const hasUniqueId = await knex.schema.hasColumn(
    "navigasi_pengguna",
    "UniqueId",
  );

  if (hasUniqueId) {
    // Rename sekaligus ubah tipe data ke INT untuk konsistensi dengan mst_pengguna.nama_pengguna
    await knex.raw(
      "ALTER TABLE navigasi_pengguna CHANGE UniqueId nama_pengguna INT;",
    );
    console.log("Kolom UniqueId berhasil diubah menjadi nama_pengguna (INT).");
  } else {
    // Cek jika sudah bernama nama_pengguna, pastikan tipe datanya adalah INT
    const hasNamaPengguna = await knex.schema.hasColumn(
      "navigasi_pengguna",
      "nama_pengguna",
    );
    if (hasNamaPengguna) {
      await knex.raw("ALTER TABLE navigasi_pengguna MODIFY nama_pengguna INT;");
      console.log(
        "Kolom nama_pengguna sudah sesuai dan dikonfirmasi sebagai INT.",
      );
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasNamaPengguna = await knex.schema.hasColumn(
    "navigasi_pengguna",
    "nama_pengguna",
  );
  if (hasNamaPengguna) {
    // Rollback: Kembalikan ke format lama jika diperlukan
    await knex.raw(
      "ALTER TABLE navigasi_pengguna CHANGE nama_pengguna unique_id VARCHAR(36);",
    );
  }
}
