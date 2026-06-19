/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

  await knex('mst_roles').whereIn('role_code', [
    'ADM', 'PMN', 'SKR', 'STF_ARS', 'STF_UMM', 'RSP', 'AUD'
  ]).del();

  const dNow = new Date();

  await knex('mst_roles').insert([
    { role_code: 'ADM', role_name: 'Administrator', description: 'Akses penuh sistem', status: 'active', created_at: dNow, updated_at: dNow },
    { role_code: 'PMN', role_name: 'Pimpinan', description: 'Approval dokumen', status: 'active', created_at: dNow, updated_at: dNow },
    { role_code: 'SKR', role_name: 'Sekretaris', description: 'Manajemen surat', status: 'active', created_at: dNow, updated_at: dNow },
    { role_code: 'STF_ARS', role_name: 'Staff Arsip', description: 'Digitalisasi arsip', status: 'active', created_at: dNow, updated_at: dNow },
    { role_code: 'STF_UMM', role_name: 'Staff Umum', description: 'Melihat buku tamu', status: 'active', created_at: dNow, updated_at: dNow },
    { role_code: 'RSP', role_name: 'Resepsionis', description: 'Input buku tamu', status: 'active', created_at: dNow, updated_at: dNow },
    { role_code: 'AUD', role_name: 'Auditor', description: 'Akses audit trail', status: 'active', created_at: dNow, updated_at: dNow }
  ]);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};