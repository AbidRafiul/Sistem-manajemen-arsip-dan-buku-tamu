export async function up(knex) {
  await knex.schema.alterTable("trs_file_surat_masuk", (table) => {
    table.date("tanggal_upload")
    .notNullable()
    .defaultTo(knex.fn.now())
    .after("ukuran_file");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("trs_file_surat_masuk", (table) => {
    table.dropColumn("tanggal_upload");
  });
}
