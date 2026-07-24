import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

export async function seed(knex) {
  const dNow = new Date();

  // Dapatkan parent menu "MASTER DATA"
  const parentMasterData = await knex("mst_menu")
    .where("kode_menu", "MASTER_DATA")
    .first();
  const idMasterData = parentMasterData ? parentMasterData.id_menu : null;

  // 1. Dapatkan/Buat parent menu "Master Arsip"
  let parentMasterArsip = await knex("mst_menu")
    .where("kode_menu", "MN_MASTER_ARSIP")
    .first();
  let idMasterArsip = parentMasterArsip ? parentMasterArsip.id_menu : null;

  if (!idMasterArsip) {
    [idMasterArsip] = await knex("mst_menu").insert({
      id_menu_induk: idMasterData,
      kode_menu: "MN_MASTER_ARSIP",
      nama_menu: "Master Arsip",
      ikon_menu: "pi pi-fw pi-folder",
      urutan: 3,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    });
  } else {
    await knex("mst_menu")
      .where("id_menu", idMasterArsip)
      .update({
        id_menu_induk: idMasterData,
        ikon_menu: "pi pi-fw pi-folder",
        urutan: 3,
        updated_at: dNow
      });
  }

  // 2. Dapatkan parent menu "ARSIP DOKUMEN"
  let parentMenu = await knex("mst_menu")
    .where("kode_menu", "MN_ARSIP_DOKUMEN")
    .orWhere("kode_menu", "ARSIP")
    .orWhere("nama_menu", "ARSIP DOKUMEN")
    .first();

  let idParent = parentMenu ? parentMenu.id_menu : null;

  if (!idParent) {
    [idParent] = await knex("mst_menu").insert({
      kode_menu: "MN_ARSIP_DOKUMEN",
      nama_menu: "ARSIP DOKUMEN",
      urutan: 5,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    });
  }

  // 3. Definisikan menu-menu Master Arsip & Retensi
  const newMenus = [
    {
      kode_menu: "MN_KLASIFIKASI_ARSIP",
      nama_menu: "Klasifikasi Arsip",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/arsip/archive_classifications",
      ikon_menu: "pi pi-fw pi-sitemap",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_KATEGORI_DOKUMEN",
      nama_menu: "Kategori Dokumen",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/arsip/document_categories",
      ikon_menu: "pi pi-fw pi-tags",
      urutan: 2,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_JENIS_DOKUMEN",
      nama_menu: "Jenis Dokumen",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/arsip/document_types",
      ikon_menu: "pi pi-fw pi-file",
      urutan: 3,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_JENIS_SURAT",
      nama_menu: "Jenis Surat",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/korespondensi/letter_types",
      ikon_menu: "pi pi-fw pi-envelope",
      urutan: 4,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_JADWAL_RETENSI",
      nama_menu: "Jadwal Retensi",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/arsip/retention_schedules",
      ikon_menu: "pi pi-fw pi-calendar",
      urutan: 5,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_TEMPLATE_SURAT",
      nama_menu: "Master Template Surat",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/korespondensi/template_surats",
      ikon_menu: "pi pi-fw pi-file",
      urutan: 6,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_PENOMORAN_SURAT",
      nama_menu: "Master Penomoran Surat",
      id_menu_induk: idMasterArsip,
      jalur_menu: "/master/korespondensi/letter_numbering",
      ikon_menu: "pi pi-fw pi-sort-numeric-up",
      urutan: 7,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    },
    {
      kode_menu: "MN_PEMUSNAHAN_ARSIP",
      nama_menu: "Pemusnahan & Retensi",
      id_menu_induk: idParent,
      jalur_menu: "/edms/destruction",
      ikon_menu: "pi pi-fw pi-trash",
      urutan: 4,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow
    }
  ];

  // Masukkan/update menu satu per satu
  const insertedMenuIds = [];
  for (const m of newMenus) {
    const existing = await knex("mst_menu")
      .where("kode_menu", m.kode_menu)
      .first();
    
    if (existing) {
      await knex("mst_menu")
        .where("id_menu", existing.id_menu)
        .update({
          nama_menu: m.nama_menu,
          id_menu_induk: m.id_menu_induk,
          jalur_menu: m.jalur_menu,
          ikon_menu: m.ikon_menu,
          urutan: m.urutan,
          updated_at: dNow
        });
      insertedMenuIds.push({ kode: m.kode_menu, id: existing.id_menu });
    } else {
      const [newId] = await knex("mst_menu").insert(m);
      insertedMenuIds.push({ kode: m.kode_menu, id: newId });
    }
  }

  const idKlasifikasiMenu = insertedMenuIds.find(item => item.kode === "MN_KLASIFIKASI_ARSIP")?.id;
  const idKategoriMenu = insertedMenuIds.find(item => item.kode === "MN_KATEGORI_DOKUMEN")?.id;
  const idJenisMenu = insertedMenuIds.find(item => item.kode === "MN_JENIS_DOKUMEN")?.id;
  const idJenisSuratMenu = insertedMenuIds.find(item => item.kode === "MN_JENIS_SURAT")?.id;
  const idJadwalMenu = insertedMenuIds.find(item => item.kode === "MN_JADWAL_RETENSI")?.id;
  const idTemplateMenu = insertedMenuIds.find(item => item.kode === "MN_TEMPLATE_SURAT")?.id;
  const idPenomoranMenu = insertedMenuIds.find(item => item.kode === "MN_PENOMORAN_SURAT")?.id;
  const idPemusnahanMenu = insertedMenuIds.find(item => item.kode === "MN_PEMUSNAHAN_ARSIP")?.id;

  // 4. Hak akses peran (mst_peran_menu)
  const roles = await knex("mst_peran").select("*");
  const superadminRole = roles.find(r => r.kode_peran === "SUPERADMIN");
  const admRole = roles.find(r => r.kode_peran === "ADM");
  const pmnRole = roles.find(r => r.kode_peran === "PMN"); // Pimpinan
  const stfArsRole = roles.find(r => r.kode_peran === "STF_ARS"); // Staff Arsip

  const grant = async (roleId, menuId, perms = {}) => {
    if (!roleId || !menuId) return;
    // Hapus jika sudah ada untuk menghindari duplikat
    await knex("mst_peran_menu")
      .where("id_peran", roleId)
      .where("id_menu", menuId)
      .del();
    
    await knex("mst_peran_menu").insert({
      id_peran: roleId,
      id_menu: menuId,
      hak_lihat: perms.view ?? 1,
      hak_buat: perms.create ?? 1,
      hak_ubah: perms.update ?? 1,
      hak_hapus: perms.delete ?? 1,
      hak_setuju: perms.approve ?? 1,
      created_at: dNow,
      updated_at: dNow
    });
  };

  // SUPERADMIN & ADM (Akses Penuh)
  if (superadminRole) {
    await grant(superadminRole.id_peran, idMasterData, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idMasterArsip, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idKlasifikasiMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idKategoriMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idJenisMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idJenisSuratMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idJadwalMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idTemplateMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idPenomoranMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(superadminRole.id_peran, idPemusnahanMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
  }
  if (admRole) {
    await grant(admRole.id_peran, idMasterData, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idMasterArsip, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idKlasifikasiMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idKategoriMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idJenisMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idJenisSuratMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idJadwalMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idTemplateMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idPenomoranMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
    await grant(admRole.id_peran, idPemusnahanMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 1 });
  }

  // PMN (Pimpinan - Hanya Lihat & Setuju/Review Pemusnahan)
  if (pmnRole) {
    await grant(pmnRole.id_peran, idPemusnahanMenu, { view: 1, create: 0, update: 0, delete: 0, approve: 1 });
  }

  // STF_ARS (Staff Arsip - Full Akses ke Master data arsip dan operational pemusnahan)
  if (stfArsRole) {
    await grant(stfArsRole.id_peran, idMasterData, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idMasterArsip, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idKlasifikasiMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idKategoriMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idJenisMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idJenisSuratMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idJadwalMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
    await grant(stfArsRole.id_peran, idPemusnahanMenu, { view: 1, create: 1, update: 1, delete: 1, approve: 0 });
  }

  // 5. Rebuild menu caches for all roles
  for (const role of roles) {
    await buildAndCacheMenu(role.id_peran);
  }

  // 6. Sync navigasi_pengguna for superadmin user (id_pengguna: 1)
  const syncRole = admRole || superadminRole;
  if (syncRole) {
    const menuTree = await buildAndCacheMenu(syncRole.id_peran);
    await knex("navigasi_pengguna")
      .insert({
        id_pengguna: 1,
        menu: JSON.stringify(menuTree),
        created_at: dNow,
        updated_at: dNow
      })
      .onConflict("id_pengguna")
      .merge({
        menu: JSON.stringify(menuTree),
        updated_at: dNow
      });
  }

  console.log("Master Arsip & JRA menus successfully seeded and cached!");
}
