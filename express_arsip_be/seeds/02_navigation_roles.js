export const seed = async function (knex) {
  // 1. Bersihkan tabel
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");
  await knex("mst_navigasi").truncate();
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  // Waktu sekarang
  const dNow = "2026-06-18 11:41:00";
  const masterMenu = [
    {
      label: "BERANDA",
      items: [
        { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
      ],
    },
    {
      label: "SETUP",
      items: [
        { label: "Users", icon: "pi pi-fw pi-users", to: "/setup/users" },
        {
          label: "Config",
          icon: "pi pi-fw pi-wrench",
          to: "/setup/config",
        },
      ],
    },
    {
      label: "BUKU TAMU",
      items: [
        {
          label: "Registrasi Tamu",
          icon: "pi pi-fw pi-id-card",
          to: "/buku_tamu/registrasi",
        },
        {
          label: "Monitoring Tamu",
          icon: "pi pi-fw pi-list",
          to: "/buku_tamu/monitoring",
        },
        {
          label: "Checkout Tamu",
          icon: "pi pi-fw pi-sign-out",
          to: "/buku_tamu/checkout",
        },
      ],
    },
    {
      label: "PERSURATAN",
      items: [
        {
          label: "Surat Masuk",
          icon: "pi pi-fw pi-inbox",
          class: "mail-in-menu",
          items: [
            {
              label: "Dashboard",
              icon: "pi pi-fw pi-chart-line",
              to: "/correspondence/mail_in",
              class: "mail-in-child",
            },
            {
              label: "Data Surat Masuk",
              icon: "pi pi-fw pi-table",
              to: "/correspondence/mail_in/data",
              class: "mail-in-child",
            },
            {
              label: "Disposisi Surat",
              icon: "pi pi-fw pi-send",
              to: "/correspondence/mail_in/disposition",
              class: "mail-in-child",
            },
          ],
        },
      ],
    },
    {
      label: "ARSIP DOKUMEN",
      items: [
        {
          label: "Dokumen Arsip",
          icon: "pi pi-fw pi-folder-open",
          to: "/edms/archive_document",
        },
        {
          label: "Peminjaman Arsip",
          icon: "pi pi-fw pi-share-alt",
          to: "/edms/archive_loan",
        },
      ],
    },
  ];

  // 2. Data menu dengan created_at
  const menus = [
    {
      role: "master",
      menu: JSON.stringify(masterMenu),
      created_at: dNow,
    },
    {
      role: "Administrator",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            {
              label: "Master Data",
              icon: "pi pi-fw pi-database",
              to: "/master-data",
            },
            { label: "Utility", icon: "pi pi-fw pi-cog", to: "/utility" },
          ],
        },
        {
          label: "SETUP",
          items: [
            { label: "Users", icon: "pi pi-fw pi-users", to: "/setup/users" },
          ],
        },
      ]),
      created_at: dNow,
    },
    {
      role: "Pimpinan",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            {
              label: "Report Arsip",
              icon: "pi pi-fw pi-file",
              to: "/report-arsip",
            },
            {
              label: "Approval",
              icon: "pi pi-fw pi-check-square",
              to: "/approval",
            },
          ],
        },
      ]),
      created_at: dNow,
    },
    {
      role: "Sekretaris",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            {
              label: "Arsip Masuk",
              icon: "pi pi-fw pi-inbox",
              to: "/arsip-masuk",
            },
            {
              label: "Arsip Keluar",
              icon: "pi pi-fw pi-send",
              to: "/arsip-keluar",
            },
          ],
        },
      ]),
      created_at: dNow,
    },
    {
      role: "Staff Arsip",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            {
              label: "Arsip Input",
              icon: "pi pi-fw pi-file-edit",
              to: "/arsip-input",
            },
            {
              label: "Arsip Digital",
              icon: "pi pi-fw pi-cloud",
              to: "/arsip-digital",
            },
          ],
        },
      ]),
      created_at: dNow,
    },
    {
      role: "Staff Umum",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            {
              label: "Monitoring Tamu",
              icon: "pi pi-fw pi-desktop",
              to: "/buku_tamu/monitoring",
            },
          ],
        },
      ]),
      created_at: dNow,
    },
    {
      role: "Resepsionis",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            {
              label: "Registrasi Kunjungan",
              icon: "pi pi-fw pi-user-plus",
              to: "/buku_tamu/registrasi",
            },
          ],
        },
      ]),
      created_at: dNow,
    },
    {
      role: "Auditor",
      menu: JSON.stringify([
        {
          label: "HOME",
          items: [
            { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
            { label: "Audit Log", icon: "pi pi-fw pi-list", to: "/audit-log" },
            { label: "Report", icon: "pi pi-fw pi-chart-bar", to: "/report" },
          ],
        },
      ]),
      created_at: dNow,
    },
  ];

  // 3. Masukkan ke database
  await knex("mst_navigasi").insert(menus);

  // Superadmin memakai menu custom user_navigation lebih dulu daripada template
  // role, jadi sync user_id 1 agar tampilan web langsung mengikuti menu master.
  await knex("user_navigation")
    .insert({
      user_id: 1,
      menu: JSON.stringify(masterMenu),
      created_at: dNow,
      updated_at: dNow,
    })
    .onConflict("user_id")
    .merge({
      menu: JSON.stringify(masterMenu),
      updated_at: dNow,
    });

  await knex("mst_visit_purpose")
    .insert([
      {
        visit_purpose_id: 1,
        visit_purpose_code: "MEETING",
        visit_purpose_name: "Meeting",
        description: "Pertemuan atau rapat",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        visit_purpose_id: 2,
        visit_purpose_code: "DELIVERY",
        visit_purpose_name: "Pengiriman",
        description: "Pengiriman barang atau dokumen",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        visit_purpose_id: 3,
        visit_purpose_code: "CONSULTATION",
        visit_purpose_name: "Konsultasi",
        description: "Konsultasi atau koordinasi",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ])
    .onConflict("visit_purpose_id")
    .merge();

  await knex("config")
    .insert([
      { id: 1, kode: "msNamaPerusahaan", keterangan: "Sistem Manajemen Arsip dan Buku Tamu" },
      { id: 2, kode: "msAlamatPerusahaan", keterangan: "-" },
      { id: 3, kode: "msKotaPerusahaan", keterangan: "-" },
      { id: 4, kode: "msTeleponPerusahaan", keterangan: "-" },
      { id: 5, kode: "msNamaPimpinan", keterangan: "-" },
      { id: 6, kode: "msLogoPerusahaan", keterangan: "" },
    ])
    .onConflict("id")
    .merge();

  console.log("Navigasi berhasil di-reset ke ID 1 dengan created_at!");
};
