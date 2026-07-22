/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasOutgoingLetterTable = await knex.schema.hasTable("trs_surat_keluar");
  if (!hasOutgoingLetterTable) return;

  const hasFinalContentColumn = await knex.schema.hasColumn(
    "trs_surat_keluar",
    "isi_surat_final"
  );

  if (!hasFinalContentColumn) {
    await knex.schema.alterTable("trs_surat_keluar", (table) => {
      table.text("isi_surat_final", "longtext").nullable();
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasOutgoingLetterTable = await knex.schema.hasTable("trs_surat_keluar");
  if (!hasOutgoingLetterTable) return;

  const hasFinalContentColumn = await knex.schema.hasColumn(
    "trs_surat_keluar",
    "isi_surat_final"
  );

  if (hasFinalContentColumn) {
    await knex.schema.alterTable("trs_surat_keluar", (table) => {
      table.dropColumn("isi_surat_final");
    });
  }
}
