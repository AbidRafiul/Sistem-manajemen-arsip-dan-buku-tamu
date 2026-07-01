import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

export async function seed(knex) {
    const dNow = new Date();

    // 1. Insert missing menus into mst_menu
    const menus = [
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
            kode_menu: "DASHBOARD",
            nama_menu: "Dashboard",
            jalur_menu: "/dashboard",
            ikon_menu: "pi pi-fw pi-home",
            urutan: 1,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        // Setup sub-menus (Set Up is id 2)
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
        // BUKU TAMU
        {
            id_menu: 17,
            id_menu_induk: null,
            kode_menu: "BUKU_TAMU",
            nama_menu: "BUKU TAMU",
            jalur_menu: "",
            ikon_menu: "",
            urutan: 3,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        {
            id_menu: 18,
            id_menu_induk: 17,
            kode_menu: "BT_REGISTRASI",
            nama_menu: "Registrasi Tamu",
            jalur_menu: "/buku_tamu/registrasi",
            ikon_menu: "pi pi-fw pi-id-card",
            urutan: 1,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        {
            id_menu: 19,
            id_menu_induk: 17,
            kode_menu: "BT_MONITORING",
            nama_menu: "Monitoring Tamu",
            jalur_menu: "/buku_tamu/monitoring",
            ikon_menu: "pi pi-fw pi-list",
            urutan: 2,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        {
            id_menu: 20,
            id_menu_induk: 17,
            kode_menu: "BT_CHECKOUT",
            nama_menu: "Checkout Tamu",
            jalur_menu: "/buku_tamu/checkout",
            ikon_menu: "pi pi-fw pi-sign-out",
            urutan: 3,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        // PERSURATAN
        {
            id_menu: 21,
            id_menu_induk: null,
            kode_menu: "PERSURATAN",
            nama_menu: "PERSURATAN",
            jalur_menu: "",
            ikon_menu: "",
            urutan: 4,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        {
            id_menu: 22,
            id_menu_induk: 21,
            kode_menu: "SURAT_MASUK",
            nama_menu: "Surat Masuk",
            jalur_menu: "",
            ikon_menu: "pi pi-fw pi-inbox",
            urutan: 1,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        {
            id_menu: 23,
            id_menu_induk: 22,
            kode_menu: "SM_DASHBOARD",
            nama_menu: "Dashboard Surat Masuk",
            jalur_menu: "/correspondence/mail_in",
            ikon_menu: "pi pi-fw pi-chart-line",
            urutan: 1,
            status_aktif: 1,
            created_at: dNow,
            updated_at: dNow,
        },
        {
            id_menu: 24,
            id_menu_induk: 22,
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
            id_menu: 25,
            id_menu_induk: 22,
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

    await knex("mst_menu").insert(menus).onConflict("id_menu").merge();

    // Perbaiki tanggal created_at/updated_at untuk menu bawaan 1-12 yang masih "0000-00-00"
    await knex.raw("SET SESSION sql_mode = '';");
    await knex("mst_menu")
        .where("id_menu", "<=", 12)
        .whereRaw("created_at = '0000-00-00 00:00:00' OR created_at IS NULL")
        .update({
            created_at: dNow,
            updated_at: dNow,
        });

    // 2. Insert into mst_peran_menu for Superadmin (id_peran: 1) and Administrator (id_peran: 57)
    const rolesToSeed = [1, 57];
    const peranMenus = [];

    for (const roleId of rolesToSeed) {
        for (const m of menus) {
            peranMenus.push({
                id_peran: roleId,
                id_menu: m.id_menu,
                hak_lihat: 1,
                hak_buat: 1,
                hak_ubah: 1,
                hak_hapus: 1,
                hak_setuju: 1,
                created_at: dNow,
                updated_at: dNow
            });
        }

        const existingMenus = await knex("mst_menu").where("id_menu", "<", 13).select("id_menu");
        for (const row of existingMenus) {
            peranMenus.push({
                id_peran: roleId,
                id_menu: row.id_menu,
                hak_lihat: 1,
                hak_buat: 1,
                hak_ubah: 1,
                hak_hapus: 1,
                hak_setuju: 1,
                created_at: dNow,
                updated_at: dNow
            });
        }
    }

    // delete existing for id_peran 1 and 57 and re-insert all
    await knex("mst_peran_menu").whereIn("id_peran", rolesToSeed).del();
    await knex("mst_peran_menu").insert(peranMenus);

    // Rebuild caches for all seeded roles
    for (const roleId of rolesToSeed) {
        await buildAndCacheMenu(roleId);
    }

    // Sync navigasi_pengguna for superadmin user (id_pengguna: 1)
    const menuTree = await buildAndCacheMenu(57);
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