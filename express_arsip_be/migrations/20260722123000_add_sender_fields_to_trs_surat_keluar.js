export async function up(knex) {
  const hasNamaPengirim = await knex.schema.hasColumn("trs_surat_keluar", "nama_pengirim");
  const hasJabatan = await knex.schema.hasColumn("trs_surat_keluar", "jabatan");

  if (!hasNamaPengirim || !hasJabatan) {
    await knex.schema.alterTable("trs_surat_keluar", (table) => {
      if (!hasNamaPengirim) table.string("nama_pengirim", 150).nullable().after("isi_surat_final");
      if (!hasJabatan) table.string("jabatan", 150).nullable().after("nama_pengirim");
    });
  }
}

export async function down(knex) {
  const hasNamaPengirim = await knex.schema.hasColumn("trs_surat_keluar", "nama_pengirim");
  const hasJabatan = await knex.schema.hasColumn("trs_surat_keluar", "jabatan");

  if (hasNamaPengirim || hasJabatan) {
    await knex.schema.alterTable("trs_surat_keluar", (table) => {
      if (hasJabatan) table.dropColumn("jabatan");
      if (hasNamaPengirim) table.dropColumn("nama_pengirim");
    });
  }
}
