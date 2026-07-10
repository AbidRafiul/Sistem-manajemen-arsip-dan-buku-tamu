import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

export async function seed(knex) {
  // 1. Clear existing menu records safely
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");
  await knex("mst_peran_menu").truncate();
  await knex("mst_menu").truncate();
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  const now = new Date();

  // Helper to insert a menu
  const insertMenu = async (menu) => {
    const [id] = await knex("mst_menu").insert({
      ...menu,
      created_at: now,
      updated_at: now
    });
    return id;
  };

  // 2. Insert Parent Menus
  const idBeranda = await insertMenu({
    kode_menu: "MN_BERANDA",
    nama_menu: "BERANDA",
    urutan: 1,
    status_aktif: 1
  });

  const idSetup = await insertMenu({
    kode_menu: "MN_SETUP",
    nama_menu: "SETUP",
    urutan: 2,
    status_aktif: 1
  });

  const idBukuTamu = await insertMenu({
    kode_menu: "MN_BUKU_TAMU",
    nama_menu: "BUKU TAMU",
    urutan: 3,
    status_aktif: 1
  });

  const idPersuratan = await insertMenu({
    kode_menu: "MN_PERSURATAN",
    nama_menu: "PERSURATAN",
    urutan: 4,
    status_aktif: 1
  });

  const idArsipDokumen = await insertMenu({
    kode_menu: "MN_ARSIP_DOKUMEN",
    nama_menu: "ARSIP DOKUMEN",
    urutan: 5,
    status_aktif: 1
  });

  // 3. Insert Child Menus
  // Beranda
  const idDashboard = await insertMenu({
    id_menu_induk: idBeranda,
    kode_menu: "MN_DASHBOARD",
    nama_menu: "Dashboard",
    jalur_menu: "/dashboard",
    ikon_menu: "pi pi-fw pi-home",
    urutan: 1,
    status_aktif: 1
  });

  // Setup
  const idUsers = await insertMenu({
    id_menu_induk: idSetup,
    kode_menu: "MN_USERS",
    nama_menu: "Users",
    jalur_menu: "/setup/users",
    ikon_menu: "pi pi-fw pi-users",
    urutan: 1,
    status_aktif: 1
  });

  const idConfig = await insertMenu({
    id_menu_induk: idSetup,
    kode_menu: "MN_CONFIG",
    nama_menu: "Config",
    jalur_menu: "/setup/config",
    ikon_menu: "pi pi-fw pi-wrench",
    urutan: 2,
    status_aktif: 1
  });

  const idMenuNav = await insertMenu({
    id_menu_induk: idSetup,
    kode_menu: "MN_MENU_NAVIGASI",
    nama_menu: "Menu Navigasi",
    jalur_menu: "/setup/menu",
    ikon_menu: "pi pi-fw pi-list",
    urutan: 3,
    status_aktif: 1
  });

  // Buku Tamu
  const idBukuTamuParent = await insertMenu({
    id_menu_induk: idBukuTamu,
    kode_menu: "MN_BUKU_TAMU_PARENT",
    nama_menu: "Buku Tamu",
    jalur_menu: "",
    ikon_menu: "pi pi-fw pi-book",
    urutan: 1,
    status_aktif: 1
  });

  const idRegTamu = await insertMenu({
    id_menu_induk: idBukuTamuParent,
    kode_menu: "MN_REGISTRASI_TAMU",
    nama_menu: "Registrasi Tamu",
    jalur_menu: "/buku_tamu/registrasi",
    ikon_menu: "pi pi-fw pi-id-card",
    urutan: 1,
    status_aktif: 1
  });

  const idMonTamu = await insertMenu({
    id_menu_induk: idBukuTamuParent,
    kode_menu: "MN_MONITORING_TAMU",
    nama_menu: "Monitoring Tamu",
    jalur_menu: "/buku_tamu/monitoring",
    ikon_menu: "pi pi-fw pi-list",
    urutan: 2,
    status_aktif: 1
  });

  const idCheckTamu = await insertMenu({
    id_menu_induk: idBukuTamuParent,
    kode_menu: "MN_CHECKOUT_TAMU",
    nama_menu: "Riwayat Tamu",
    jalur_menu: "/buku_tamu/checkout",
    ikon_menu: "pi pi-fw pi-history",
    urutan: 3,
    status_aktif: 1
  });

  // Persuratan
  const idSuratMasuk = await insertMenu({
    id_menu_induk: idPersuratan,
    kode_menu: "MN_SURAT_MASUK",
    nama_menu: "Surat Masuk",
    jalur_menu: "/correspondence/mail_in",
    ikon_menu: "pi pi-fw pi-inbox",
    urutan: 1,
    status_aktif: 1
  });

  const idDataSurat = await insertMenu({
    id_menu_induk: idPersuratan,
    kode_menu: "MN_DATA_SURAT_MASUK",
    nama_menu: "Data Surat Masuk",
    jalur_menu: "/correspondence/mail_in/data",
    ikon_menu: "pi pi-fw pi-table",
    urutan: 2,
    status_aktif: 1
  });

  const idDispSurat = await insertMenu({
    id_menu_induk: idPersuratan,
    kode_menu: "MN_DISPOSISI_SURAT",
    nama_menu: "Disposisi Surat",
    jalur_menu: "/correspondence/mail_in/disposition",
    ikon_menu: "pi pi-fw pi-send",
    urutan: 3,
    status_aktif: 1
  });

  // Arsip Dokumen
  const idDocArsip = await insertMenu({
    id_menu_induk: idArsipDokumen,
    kode_menu: "MN_DOKUMEN_ARSIP",
    nama_menu: "Dokumen Arsip",
    jalur_menu: "/edms/archive_document",
    ikon_menu: "pi pi-fw pi-folder-open",
    urutan: 1,
    status_aktif: 1
  });

  const idPemArsip = await insertMenu({
    id_menu_induk: idArsipDokumen,
    kode_menu: "MN_PEMINJAMAN_ARSIP",
    nama_menu: "Peminjaman Arsip",
    jalur_menu: "/edms/archive_loan",
    ikon_menu: "pi pi-fw pi-share-alt",
    urutan: 2,
    status_aktif: 1
  });

  // Get all roles
  const roles = await knex("mst_peran").select("*");

  // Helper to map a role to a menu with permissions
  const grantAccess = async (roleCode, menuId, perms = {}) => {
    const role = roles.find(r => r.kode_peran === roleCode);
    if (!role) return;

    await knex("mst_peran_menu").insert({
      id_peran: role.id_peran,
      id_menu: menuId,
      hak_lihat: perms.view ?? 1,
      hak_buat: perms.create ?? 1,
      hak_ubah: perms.update ?? 1,
      hak_hapus: perms.delete ?? 1,
      hak_setuju: perms.approve ?? 1,
      created_at: now,
      updated_at: now
    });
  };

  // Assign full access to SUPERADMIN and ADM (Administrator)
  const allMenuIds = [
    idBeranda, idSetup, idBukuTamu, idPersuratan, idArsipDokumen,
    idDashboard, idUsers, idConfig, idMenuNav,
    idBukuTamuParent, idRegTamu, idMonTamu, idCheckTamu,
    idSuratMasuk, idDataSurat, idDispSurat,
    idDocArsip, idPemArsip
  ];

  for (const menuId of allMenuIds) {
    await grantAccess("SUPERADMIN", menuId);
    await grantAccess("ADM", menuId);
  }

  // Assign access to other roles
  // 1. Pimpinan (PMN)
  const pmnMenus = [
    { id: idBeranda }, { id: idDashboard },
    { id: idBukuTamu }, { id: idBukuTamuParent }, { id: idMonTamu },
    { id: idArsipDokumen }, { id: idDocArsip }
  ];
  for (const item of pmnMenus) {
    await grantAccess("PMN", item.id, item.perms ?? { view: 1, create: 0, update: 0, delete: 0, approve: 1 });
  }

  // 2. Sekretaris (SKR)
  const skrMenus = [
    { id: idBeranda }, { id: idDashboard },
    { id: idPersuratan }, { id: idSuratMasuk }, { id: idDataSurat }, { id: idDispSurat }
  ];
  for (const item of skrMenus) {
    await grantAccess("SKR", item.id);
  }

  // 3. Staff Arsip (STF_ARS)
  const stfArsMenus = [
    { id: idBeranda }, { id: idDashboard },
    { id: idArsipDokumen }, { id: idDocArsip }, { id: idPemArsip }
  ];
  for (const item of stfArsMenus) {
    await grantAccess("STF_ARS", item.id);
  }

  // 4. Staff Umum (STF_UMM)
  const stfUmmMenus = [
    { id: idBeranda }, { id: idDashboard },
    { id: idBukuTamu }, { id: idBukuTamuParent }, { id: idMonTamu }
  ];
  for (const item of stfUmmMenus) {
    await grantAccess("STF_UMM", item.id, { view: 1, create: 0, update: 0, delete: 0, approve: 0 });
  }

  // 5. Resepsionis (RSP)
  const rspMenus = [
    { id: idBeranda }, { id: idDashboard },
    { id: idBukuTamu }, { id: idBukuTamuParent }, { id: idRegTamu }, { id: idMonTamu }, { id: idCheckTamu }
  ];
  for (const item of rspMenus) {
    await grantAccess("RSP", item.id);
  }

  // 6. Auditor (AUD)
  const audMenus = [
    { id: idBeranda }, { id: idDashboard },
    { id: idArsipDokumen }, { id: idDocArsip }
  ];
  for (const item of audMenus) {
    await grantAccess("AUD", item.id, { view: 1, create: 0, update: 0, delete: 0, approve: 0 });
  }

  // Rebuild menu caches for all roles
  for (const role of roles) {
    await buildAndCacheMenu(role.id_peran);
  }

  // Sync navigasi_pengguna for superadmin user (id_pengguna: 1)
  const admRole = roles.find(r => r.kode_peran === "ADM");
  if (admRole) {
    const menuTree = await buildAndCacheMenu(admRole.id_peran);
    await knex("navigasi_pengguna")
      .insert({
        id_pengguna: 1,
        menu: JSON.stringify(menuTree),
        created_at: now,
        updated_at: now
      })
      .onConflict("id_pengguna")
      .merge({
        menu: JSON.stringify(menuTree),
        updated_at: now
      });
  }

  console.log("Mst_menu and Mst_peran_menu tables successfully seeded!");
}
