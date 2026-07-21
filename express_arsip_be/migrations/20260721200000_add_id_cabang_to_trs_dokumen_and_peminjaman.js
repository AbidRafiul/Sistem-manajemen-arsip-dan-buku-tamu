/**
 * Add id_cabang column to trs_dokumen and trs_peminjaman_arsip for explicit multi-tenant ownership
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasDokumenCabang = await knex.schema.hasColumn("trs_dokumen", "id_cabang");
  if (!hasDokumenCabang) {
    await knex.schema.alterTable("trs_dokumen", (table) => {
      table.integer("id_cabang").unsigned().nullable().after("id_dokumen");
      table.index("id_cabang", "idx_trs_dokumen_id_cabang");
    });
  }

  const hasPeminjamanTable = await knex.schema.hasTable("trs_peminjaman_arsip");
  if (hasPeminjamanTable) {
    const hasPeminjamanCabang = await knex.schema.hasColumn("trs_peminjaman_arsip", "id_cabang");
    if (!hasPeminjamanCabang) {
      await knex.schema.alterTable("trs_peminjaman_arsip", (table) => {
        table.integer("id_cabang").unsigned().nullable().after("id_peminjaman");
        table.index("id_cabang", "idx_trs_peminjaman_id_cabang");
      });
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasDokumenCabang = await knex.schema.hasColumn("trs_dokumen", "id_cabang");
  if (hasDokumenCabang) {
    await knex.schema.alterTable("trs_dokumen", (table) => {
      table.dropIndex(["id_cabang"], "idx_trs_dokumen_id_cabang");
      table.dropColumn("id_cabang");
    });
  }

  const hasPeminjamanTable = await knex.schema.hasTable("trs_peminjaman_arsip");
  if (hasPeminjamanTable) {
    const hasPeminjamanCabang = await knex.schema.hasColumn("trs_peminjaman_arsip", "id_cabang");
    if (hasPeminjamanCabang) {
      await knex.schema.alterTable("trs_peminjaman_arsip", (table) => {
        table.dropIndex(["id_cabang"], "idx_trs_peminjaman_id_cabang");
        table.dropColumn("id_cabang");
      });
    }
  }
}
