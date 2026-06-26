/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    const hasTable = await knex.schema.hasTable('mst_visit_purpose');
    if (hasTable) {
        await knex.schema.renameTable('mst_visit_purpose', 'mst_tujuan_kunjungan');
    }

    await knex.schema.alterTable('mst_tujuan_kunjungan', (table) => {
        table.renameColumn('visit_purpose_id', 'id_tujuan_kunjungan');
        table.renameColumn('visit_purpose_code', 'kode_tujuan_kunjungan');
        table.renameColumn('visit_purpose_name', 'nama_tujuan_kunjungan');
        table.renameColumn('description', 'deskripsi');
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    const hasTable = await knex.schema.hasTable('mst_tujuan_kunjungan');
    if (hasTable) {
        await knex.schema.alterTable('mst_tujuan_kunjungan', (table) => {
            table.renameColumn('id_tujuan_kunjungan', 'visit_purpose_id');
            table.renameColumn('kode_tujuan_kunjungan', 'visit_purpose_code');
            table.renameColumn('nama_tujuan_kunjungan', 'visit_purpose_name');
            table.renameColumn('deskripsi', 'description');
        });

        await knex.schema.renameTable('mst_tujuan_kunjungan', 'mst_visit_purpose');
    }
}