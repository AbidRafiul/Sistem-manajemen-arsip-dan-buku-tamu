/**
 * Add explicit branch ownership to incoming and outgoing letters.
 *
 * Previously correspondence lists inferred branch from created_by user. That
 * breaks when superadmin/admin switches active branch before creating a letter.
 */
export async function up(knex) {
  const addBranchColumn = async (tableName, afterColumn) => {
    if (!(await knex.schema.hasTable(tableName))) return;
    if (await knex.schema.hasColumn(tableName, "id_cabang")) return;

    await knex.schema.alterTable(tableName, (table) => {
      table.integer("id_cabang").unsigned().nullable().after(afterColumn);
      table.index("id_cabang", `idx_${tableName}_id_cabang`);
      table
        .foreign("id_cabang", `${tableName}_id_cabang_foreign`)
        .references("id_cabang")
        .inTable("mst_cabang")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
    });
  };

  await addBranchColumn("trs_surat_masuk", "surat_masuk_id");
  await addBranchColumn("trs_surat_keluar", "id_surat_keluar");

  if (await knex.schema.hasColumn("trs_surat_masuk", "id_cabang")) {
    await knex.raw(`
      UPDATE trs_surat_masuk sm
      LEFT JOIN mst_pengguna u ON sm.created_by = u.id_pengguna
      SET sm.id_cabang = u.id_cabang
      WHERE sm.id_cabang IS NULL
    `);
  }

  if (await knex.schema.hasColumn("trs_surat_keluar", "id_cabang")) {
    await knex.raw(`
      UPDATE trs_surat_keluar sk
      LEFT JOIN mst_pengguna u ON sk.created_by = u.id_pengguna
      SET sk.id_cabang = u.id_cabang
      WHERE sk.id_cabang IS NULL
    `);
  }
}

export async function down(knex) {
  const dropBranchColumn = async (tableName) => {
    if (!(await knex.schema.hasTable(tableName))) return;
    if (!(await knex.schema.hasColumn(tableName, "id_cabang"))) return;

    await knex.schema.alterTable(tableName, (table) => {
      table.dropForeign(["id_cabang"], `${tableName}_id_cabang_foreign`);
      table.dropIndex(["id_cabang"], `idx_${tableName}_id_cabang`);
      table.dropColumn("id_cabang");
    });
  };

  await dropBranchColumn("trs_surat_masuk");
  await dropBranchColumn("trs_surat_keluar");
}
