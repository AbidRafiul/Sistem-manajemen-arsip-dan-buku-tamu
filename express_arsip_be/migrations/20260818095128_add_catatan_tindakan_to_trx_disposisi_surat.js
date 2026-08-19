export async function up(knex) {
  await knex.schema.alterTable("trx_disposisi_surat", (table) => {
    table.text("catatan_tindakan").nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable("trx_disposisi_surat", (table) => {
    table.dropColumn("catatan_tindakan");
  });
}
