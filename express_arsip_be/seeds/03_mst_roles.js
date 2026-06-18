/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

  await knex('mst_roles').whereIn('RoleCode', [
    'ADM', 'PMN', 'SKR', 'STF_ARS', 'STF_UMM', 'RSP', 'AUD'
  ]).del();

  const dNow = new Date();

  await knex('mst_roles').insert([
    { RoleCode: 'ADM', RoleName: 'Administrator', Description: 'Akses penuh sistem', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow },
    { RoleCode: 'PMN', RoleName: 'Pimpinan', Description: 'Approval dokumen', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow },
    { RoleCode: 'SKR', RoleName: 'Sekretaris', Description: 'Manajemen surat', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow },
    { RoleCode: 'STF_ARS', RoleName: 'Staff Arsip', Description: 'Digitalisasi arsip', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow },
    { RoleCode: 'STF_UMM', RoleName: 'Staff Umum', Description: 'Melihat buku tamu', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow },
    { RoleCode: 'RSP', RoleName: 'Resepsionis', Description: 'Input buku tamu', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow },
    { RoleCode: 'AUD', RoleName: 'Auditor', Description: 'Akses audit trail', Status: 'active', CreatedAt: dNow, UpdatedAt: dNow }
  ]);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};