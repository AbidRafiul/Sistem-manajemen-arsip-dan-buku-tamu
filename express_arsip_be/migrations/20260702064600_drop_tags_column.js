/**
 * Migration: Drop tags column from trs_dokumen table
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (await knex.schema.hasColumn('trs_dokumen', 'tags')) {
    await knex.schema.alterTable('trs_dokumen', (table) => {
      table.dropColumn('tags');
    });
  }
}

export async function down(knex) {
  if (!(await knex.schema.hasColumn('trs_dokumen', 'tags'))) {
    await knex.schema.alterTable('trs_dokumen', (table) => {
      table.text('tags').nullable().after('qr_code');
    });
  }
}
