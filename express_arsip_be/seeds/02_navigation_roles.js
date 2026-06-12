export const seed = async function(knex) {
  // Hapus data lama biar tidak bentrok
  await knex('mst_navigation').whereIn('Role', [
    'Administrator', 'Pimpinan', 'Sekretaris', 'Staff Arsip', 'Staff Umum', 'Resepsionis', 'Auditor'
  ]).del();

  const dNow = new Date();

  // Insert data HANYA ke kolom yang ada di database (Tanpa UpdatedAt)
  await knex('mst_navigation').insert([
    { Role: 'Administrator', Menu: JSON.stringify({ menus: ["dashboard", "master_data", "utility"] }), CreatedAt: dNow },
    { Role: 'Pimpinan', Menu: JSON.stringify({ menus: ["dashboard", "report_arsip", "approval"] }), CreatedAt: dNow },
    { Role: 'Sekretaris', Menu: JSON.stringify({ menus: ["dashboard", "arsip_masuk", "arsip_keluar"] }), CreatedAt: dNow },
    { Role: 'Staff Arsip', Menu: JSON.stringify({ menus: ["dashboard", "arsip_input", "arsip_digital"] }), CreatedAt: dNow },
    { Role: 'Staff Umum', Menu: JSON.stringify({ menus: ["dashboard", "buku_tamu_view"] }), CreatedAt: dNow },
    { Role: 'Resepsionis', Menu: JSON.stringify({ menus: ["dashboard", "buku_tamu_input"] }), CreatedAt: dNow },
    { Role: 'Auditor', Menu: JSON.stringify({ menus: ["dashboard", "audit_log", "report"] }), CreatedAt: dNow }
  ]);
};