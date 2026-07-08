export async function seed(knex) {
  const dNow = new Date();
  const adminRole = await knex("mst_peran")
    .where("kode_peran", "ADM")
    .first();

  if (!adminRole) {
    throw new Error("Peran ADM belum tersedia untuk seed dynamic menu");
  }

  // 1. Insert missing menus into mst_menu
  const vaMenus = [
    {
      id_menu: 1,
      id_menu_induk: 2,
      kode_menu: "MENU",
      nama_menu: "Management Menu",
      jalur_menu: "/setup/menu",
      ikon_menu: "i pi-fw pi-users",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 2,
      id_menu_induk: null,
      kode_menu: "MENU_SETUP",
      nama_menu: "Set Up",
      jalur_menu: "",
      ikon_menu: "pi pi-fw pi-cog",
      urutan: 0,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 3,
      id_menu_induk: null,
      kode_menu: "MASTER_ORG",
      nama_menu: "Master Organisasi",
      jalur_menu: "",
      ikon_menu: "pi pi-fw pi-sitemap",
      urutan: 0,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 4,
      id_menu_induk: 3,
      kode_menu: "MENU_CABANG",
      nama_menu: "Data Cabang",
      jalur_menu: "/master/organisasi/branches",
      ikon_menu: "pi pi-building",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 5,
      id_menu_induk: 3,
      kode_menu: "MENU_DIVISI",
      nama_menu: "Data Divisi",
      jalur_menu: "/master/organisasi/divisions",
      ikon_menu: "pi pi-sitemap",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 6,
      id_menu_induk: 3,
      kode_menu: "MENU_DEPART",
      nama_menu: "Data Department",
      jalur_menu: "/master/organisasi/department",
      ikon_menu: "pi pi-briefcase",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 7,
      id_menu_induk: 3,
      kode_menu: "MENU_JABATAN",
      nama_menu: "Data Jabatan",
      jalur_menu: "/master/organisasi/positions",
      ikon_menu: "pi pi-id-card",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 8,
      id_menu_induk: 3,
      kode_menu: "MENU PERAN",
      nama_menu: "Data Peran",
      jalur_menu: "/master/organisasi/roles",
      ikon_menu: "pi pi-users",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 9,
      id_menu_induk: 3,
      kode_menu: "MENU UK",
      nama_menu: "Data Unit Kerja",
      jalur_menu: "/master/organisasi/work_unit",
      ikon_menu: "pi pi-desktop",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 10,
      id_menu_induk: null,
      kode_menu: "ARSIP",
      nama_menu: "ARSIP DOKUMEN",
      jalur_menu: "",
      ikon_menu: "pi pi-fw pi-folder",
      urutan: 2,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 11,
      id_menu_induk: 10,
      kode_menu: "ARSIP_DOC",
      nama_menu: "Dokumen Arsip",
      jalur_menu: "/edms/archive_document",
      ikon_menu: "pi pi-fw pi-folder-open",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 12,
      id_menu_induk: 10,
      kode_menu: "ARSIP_LOAN",
      nama_menu: "Peminjaman Arsip",
      jalur_menu: "/edms/archive_loan",
      ikon_menu: "pi pi-fw pi-share-alt",
      urutan: 2,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 13,
      id_menu_induk: null,
      kode_menu: "BERANDA",
      nama_menu: "BERANDA",
      jalur_menu: "",
      ikon_menu: "",
      urutan: -1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 14,
      id_menu_induk: 13,
      kode_menu: "MENU_DASH",
      nama_menu: "Dashboard",
      jalur_menu: "/dashboard",
      ikon_menu: "pi pi-fw pi-home",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 15,
      id_menu_induk: 2,
      kode_menu: "SETUP_USERS",
      nama_menu: "Users",
      jalur_menu: "/setup/users",
      ikon_menu: "pi pi-fw pi-users",
      urutan: 2,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 16,
      id_menu_induk: 2,
      kode_menu: "SETUP_CONFIG",
      nama_menu: "Config",
      jalur_menu: "/setup/config",
      ikon_menu: "pi pi-fw pi-wrench",
      urutan: 3,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 20,
      id_menu_induk: null,
      kode_menu: "BUKU_TAMU",
      nama_menu: "BUKU TAMU",
      jalur_menu: "",
      ikon_menu: "",
      urutan: 4,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 21,
      id_menu_induk: 20,
      kode_menu: "MENU_REGISTRASI_TAMU",
      nama_menu: "Registrasi Tamu",
      jalur_menu: "/buku_tamu/registrasi",
      ikon_menu: "pi pi-fw pi-id-card",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 22,
      id_menu_induk: 20,
      kode_menu: "MENU_MONITORING_TAMU",
      nama_menu: "Monitoring Tamu",
      jalur_menu: "/buku_tamu/monitoring",
      ikon_menu: "pi pi-fw pi-list",
      urutan: 2,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 28,
      id_menu_induk: 20,
      kode_menu: "MENU_CHECKOUT_TAMU",
      nama_menu: "Riwayat Tamu",
      jalur_menu: "/buku_tamu/checkout",
      ikon_menu: "pi pi-fw pi-sign-out",
      urutan: 3,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 23,
      id_menu_induk: null,
      kode_menu: "PERSURATAN",
      nama_menu: "PERSURATAN",
      jalur_menu: "",
      ikon_menu: "",
      urutan: 5,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 24,
      id_menu_induk: 23,
      kode_menu: "MENU_SURAT_MASUK",
      nama_menu: "Surat Masuk",
      jalur_menu: "",
      ikon_menu: "pi pi-fw pi-inbox",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 25,
      id_menu_induk: 24,
      kode_menu: "SM_DASHBOARD",
      nama_menu: "Dashboard",
      jalur_menu: "/correspondence/mail_in",
      ikon_menu: "pi pi-fw pi-chart-line",
      urutan: 1,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 26,
      id_menu_induk: 24,
      kode_menu: "SM_DATA",
      nama_menu: "Data Surat Masuk",
      jalur_menu: "/correspondence/mail_in/data",
      ikon_menu: "pi pi-fw pi-table",
      urutan: 2,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_menu: 27,
      id_menu_induk: 24,
      kode_menu: "SM_DISPOSISI",
      nama_menu: "Disposisi Surat",
      jalur_menu: "/correspondence/mail_in/disposition",
      ikon_menu: "pi pi-fw pi-send",
      urutan: 3,
      status_aktif: 1,
      created_at: dNow,
      updated_at: dNow,
    }
  ];

  // Hapus menu lama yang memiliki id_menu atau kode_menu yang berkonflik agar tidak memicu error unique constraint
  const targetMenuIds = vaMenus.map(m => m.id_menu);
  const targetMenuCodes = vaMenus.map(m => m.kode_menu);

  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");
  await knex("mst_menu")
    .whereIn("id_menu", targetMenuIds)
    .orWhereIn("kode_menu", targetMenuCodes)
    .del();

  await knex("mst_menu").insert(vaMenus).onConflict("id_menu").merge();
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  // Perbaiki tanggal created_at/updated_at untuk menu bawaan 1-12 yang masih "0000-00-00"
  await knex.raw("SET SESSION sql_mode = '';");
  await knex("mst_menu")
    .where("id_menu", "<=", 12)
    .whereRaw("created_at = '0000-00-00 00:00:00' OR created_at IS NULL")
    .update({
      created_at: dNow,
      updated_at: dNow,
    });

  // 2. Berikan seluruh hak menu kepada Administrator.
  const vaPeranMenus = vaMenus.map(oMenu => ({
    id_peran: adminRole.id_peran,
    id_menu: oMenu.id_menu,
    hak_lihat: 1,
    hak_buat: 1,
    hak_ubah: 1,
    hak_hapus: 1,
    hak_setuju: 1,
    created_at: dNow,
    updated_at: dNow
  }));

  // also let's make sure id_menu 1 to 12 are mapped to superadmin if they are not
  const vaExistingMenus = await knex("mst_menu").where("id_menu", "<", 13).select("id_menu");
  for (const oRow of vaExistingMenus) {
      vaPeranMenus.push({
          id_peran: adminRole.id_peran,
          id_menu: oRow.id_menu,
          hak_lihat: 1,
          hak_buat: 1,
          hak_ubah: 1,
          hak_hapus: 1,
          hak_setuju: 1,
          created_at: dNow,
          updated_at: dNow
      });
  }

  const uniquePeranMenus = Array.from(
    new Map(vaPeranMenus.map((row) => [row.id_menu, row])).values(),
  );

  await knex("mst_peran_menu").where("id_peran", adminRole.id_peran).del();
  await knex("mst_peran_menu").insert(uniquePeranMenus);
}
