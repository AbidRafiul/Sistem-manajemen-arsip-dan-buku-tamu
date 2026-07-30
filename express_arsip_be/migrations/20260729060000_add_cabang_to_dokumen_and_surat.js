/**
 * Migration: Tambah kolom id_cabang pada trs_dokumen dan trs_surat_masuk
 * Best practice: Setiap transaksi harus terikat ke kantor cabang agar bisa difilter
 * berdasarkan konteks organisasi (RBAC isolasi data per cabang).
 */
export async function up(knex) {
  // 1. Tambah id_cabang ke trs_dokumen (arsip dokumen)
  const hasCabangDokumen = await knex.schema.hasColumn("trs_dokumen", "id_cabang");
  if (!hasCabangDokumen) {
    await knex.schema.alterTable("trs_dokumen", (t) => {
      t.integer("id_cabang").unsigned().nullable().after("kode_dokumen");
      t.foreign("id_cabang").references("id_cabang").inTable("mst_cabang").onDelete("SET NULL").onUpdate("CASCADE");
    });

    // Backfill: hubungkan dokumen ke cabang berdasarkan nama_pic → mst_pengguna.nama_lengkap → id_cabang
    await knex.raw(`
      UPDATE trs_dokumen d
      LEFT JOIN mst_pengguna p ON d.nama_pic = p.nama_lengkap
      SET d.id_cabang = p.id_cabang
      WHERE d.id_cabang IS NULL AND p.id_cabang IS NOT NULL
    `);

    // Fallback: jika masih ada yang NULL, set ke cabang pertama (Pusat)
    const defaultBranch = await knex("mst_cabang").orderBy("id_cabang", "asc").first();
    if (defaultBranch) {
      await knex("trs_dokumen")
        .whereNull("id_cabang")
        .update({ id_cabang: defaultBranch.id_cabang });
    }
  }

  // 2. Tambah id_cabang ke trs_surat_masuk (surat masuk / persuratan)
  const hasCabangSurat = await knex.schema.hasColumn("trs_surat_masuk", "id_cabang");
  if (!hasCabangSurat) {
    await knex.schema.alterTable("trs_surat_masuk", (t) => {
      t.integer("id_cabang").unsigned().nullable().after("surat_masuk_id");
      t.foreign("id_cabang").references("id_cabang").inTable("mst_cabang").onDelete("SET NULL").onUpdate("CASCADE");
    });

    // Backfill: hubungkan surat ke cabang berdasarkan created_by → mst_pengguna.id_pengguna → id_cabang
    await knex.raw(`
      UPDATE trs_surat_masuk s
      LEFT JOIN mst_pengguna p ON s.created_by = p.id_pengguna
      SET s.id_cabang = p.id_cabang
      WHERE s.id_cabang IS NULL AND p.id_cabang IS NOT NULL
    `);

    // Fallback
    const defaultBranch2 = await knex("mst_cabang").orderBy("id_cabang", "asc").first();
    if (defaultBranch2) {
      await knex("trs_surat_masuk")
        .whereNull("id_cabang")
        .update({ id_cabang: defaultBranch2.id_cabang });
    }
  }
}

export async function down(knex) {
  const hasCabangDokumen = await knex.schema.hasColumn("trs_dokumen", "id_cabang");
  if (hasCabangDokumen) {
    await knex.schema.alterTable("trs_dokumen", (t) => {
      t.dropForeign(["id_cabang"]);
      t.dropColumn("id_cabang");
    });
  }

  const hasCabangSurat = await knex.schema.hasColumn("trs_surat_masuk", "id_cabang");
  if (hasCabangSurat) {
    await knex.schema.alterTable("trs_surat_masuk", (t) => {
      t.dropForeign(["id_cabang"]);
      t.dropColumn("id_cabang");
    });
  }
}
