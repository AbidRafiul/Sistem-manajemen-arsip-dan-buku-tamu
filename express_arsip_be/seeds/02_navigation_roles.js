export const seed = async function(knex) {
  // 1. Bersihkan tabel
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  await knex('mst_navigation').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');

  // Waktu sekarang
  const dNow = '2026-06-18 11:41:00'; 

  // 2. Data menu dengan CreatedAt
  const menus = [
    { Role: 'master', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"}]},{"label":"SETUP",items:[{label:"Users",icon:"pi pi-fw pi-users",to:"/setup/users"},{label:"Config",icon:"pi pi-fw pi-wrench",to:"/setup/config"}]}]), CreatedAt: dNow },
    { Role: 'Administrator', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Master Data",icon:"pi pi-fw pi-database",to:"/master-data"},{label:"Utility",icon:"pi pi-fw pi-cog",to:"/utility"}]},{"label":"SETUP",items:[{label:"Users",icon:"pi pi-fw pi-users",to:"/setup/users"}]}]), CreatedAt: dNow },
    { Role: 'Pimpinan', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Report Arsip",icon:"pi pi-fw pi-file",to:"/report-arsip"},{label:"Approval",icon:"pi pi-fw pi-check-square",to:"/approval"}]}]), CreatedAt: dNow },
    { Role: 'Sekretaris', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Arsip Masuk",icon:"pi pi-fw pi-inbox",to:"/arsip-masuk"},{label:"Arsip Keluar",icon:"pi pi-fw pi-send",to:"/arsip-keluar"}]}]), CreatedAt: dNow },
    { Role: 'Staff Arsip', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Arsip Input",icon:"pi pi-fw pi-file-edit",to:"/arsip-input"},{label:"Arsip Digital",icon:"pi pi-fw pi-cloud",to:"/arsip-digital"}]}]), CreatedAt: dNow },
    { Role: 'Staff Umum', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Buku Tamu View",icon:"pi pi-fw pi-users",to:"/buku-tamu-view"}]}]), CreatedAt: dNow },
    { Role: 'Resepsionis', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Buku Tamu Input",icon:"pi pi-fw pi-user-plus",to:"/buku-tamu-input"}]}]), CreatedAt: dNow },
    { Role: 'Auditor', Menu: JSON.stringify([{label:"HOME",items:[{label:"Dashboard",icon:"pi pi-fw pi-home",to:"/dashboard"},{label:"Audit Log",icon:"pi pi-fw pi-list",to:"/audit-log"},{label:"Report",icon:"pi pi-fw pi-chart-bar",to:"/report"}]}]), CreatedAt: dNow }
  ];

  // 3. Masukkan ke database
  await knex('mst_navigation').insert(menus);
  console.log("Navigasi berhasil di-reset ke ID 1 dengan CreatedAt!");
};