const MENU_CATALOG = {
  dashboard: { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" },
  users: { label: "Users", icon: "pi pi-fw pi-users", to: "/setup/users" },
  config: { label: "Config", icon: "pi pi-fw pi-wrench", to: "/setup/config" },
  master_data: {
    label: "Master Data",
    icon: "pi pi-fw pi-database",
    items: [
      { label: "Users", icon: "pi pi-fw pi-users", to: "/setup/users" },
      { label: "Config", icon: "pi pi-fw pi-wrench", to: "/setup/config" },
    ],
  },
  utility: {
    label: "Utility",
    icon: "pi pi-fw pi-cog",
    items: [
      { label: "Config", icon: "pi pi-fw pi-wrench", to: "/setup/config" },
    ],
  },
  buku_tamu_input: {
    label: "Registrasi Tamu",
    icon: "pi pi-fw pi-id-card",
    to: "/buku_tamu/registrasi",
  },
  buku_tamu_view: {
    label: "Monitoring Tamu",
    icon: "pi pi-fw pi-list",
    to: "/buku_tamu/monitoring",
  },
  arsip_input: {
    label: "Dokumen Arsip",
    icon: "pi pi-fw pi-file-edit",
    to: "/edms/archive_document",
  },
  arsip_digital: {
    label: "Dokumen Arsip",
    icon: "pi pi-fw pi-folder-open",
    to: "/edms/archive_document",
  },
  arsip_masuk: {
    label: "Surat Masuk",
    icon: "pi pi-fw pi-inbox",
    to: "/correspondence/mail-in",
  },
  arsip_keluar: {
    label: "Surat Keluar",
    icon: "pi pi-fw pi-send",
    to: "/correspondence/mail-out",
  },
  report_arsip: {
    label: "Laporan Arsip",
    icon: "pi pi-fw pi-chart-bar",
    to: "/edms/archive_document",
  },
  approval: {
    label: "Approval",
    icon: "pi pi-fw pi-check-square",
    to: "/edms/archive_document",
  },
  audit_log: {
    label: "Audit Trail",
    icon: "pi pi-fw pi-history",
    to: "/setup/audit-trail",
  },
  report: {
    label: "Report",
    icon: "pi pi-fw pi-chart-line",
    to: "/dashboard",
  },
};

const peran_ALIASES = {
  superadmin: ["superadmin", "admin", "master", "ADM", "Administrator"],
  admin: ["admin", "master", "ADM", "Administrator"],
  master: ["master", "ADM", "Administrator"],
  administrator: ["Administrator", "ADM", "admin", "master"],
  adm: ["ADM", "Administrator", "admin", "master"],
  pimpinan: ["Pimpinan", "PMN"],
  pmn: ["PMN", "Pimpinan"],
  sekretaris: ["Sekretaris", "SKR"],
  skr: ["SKR", "Sekretaris"],
  "staff arsip": ["Staff Arsip", "STF_ARS"],
  stf_ars: ["STF_ARS", "Staff Arsip"],
  "staff umum": ["Staff Umum", "STF_UMM"],
  stf_umm: ["STF_UMM", "Staff Umum"],
  resepsionis: ["Resepsionis", "RSP"],
  rsp: ["RSP", "Resepsionis"],
  auditor: ["Auditor", "AUD"],
  aud: ["AUD", "Auditor"],
};

const cloneMenu = (item) => JSON.parse(JSON.stringify(item));

const archiveDocumentItems = [
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
];

const ensureArchiveDocumentMenu = (menu) => {
  if (!Array.isArray(menu)) return [];

  const hasItem = (items = [], toPath) => {
    return items.some(
      (item) => item.to === toPath || hasItem(item.items || [], toPath),
    );
  };

  const hasAll = archiveDocumentItems.every((reqItem) =>
    hasItem(menu, reqItem.to),
  );
  if (hasAll) return menu;

  const archiveGroup = menu.find((item) => {
    const label = item.label?.toLowerCase();
    return label === "arsip dokumen" || label === "edms" || label === "arsip";
  });

  if (archiveGroup) {
    const existingTos = (archiveGroup.items || []).map((item) => item.to);
    const missingItems = archiveDocumentItems
      .filter((item) => !existingTos.includes(item.to))
      .map(cloneMenu);
    archiveGroup.items = [...(archiveGroup.items || []), ...missingItems];
    return menu;
  }

  return [
    ...menu,
    {
      label: "ARSIP DOKUMEN",
      icon: "pi pi-fw pi-folder",
      items: archiveDocumentItems.map(cloneMenu),
    },
  ];
};

const peranAliases = (peran) => {
  const normalized = String(peran || "").trim();
  const key = normalized.toLowerCase();
  return Array.from(
    new Set([normalized, ...(peran_ALIASES[key] || [])].filter(Boolean)),
  );
};

const roleAliases = peranAliases;

const normalizeLegacyMenu = (rawMenu) => {
  if (!rawMenu) return [];

  let parsed;
  try {
    parsed = typeof rawMenu === "string" ? JSON.parse(rawMenu) : rawMenu;
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed?.data)) {
    return parsed.data;
  }

  if (Array.isArray(parsed?.menu)) {
    return parsed.menu;
  }

  if (Array.isArray(parsed?.menus)) {
    const grouped = parsed.menus.reduce(
      (acc, code) => {
        const menu = MENU_CATALOG[code];
        if (!menu) return acc;

        if (code === "dashboard") {
          acc.home.push(cloneMenu(menu));
        } else if (code.startsWith("buku_tamu")) {
          acc.guest.push(cloneMenu(menu));
        } else if (
          code.startsWith("arsip") ||
          code === "report_arsip" ||
          code === "approval"
        ) {
          acc.archive.push(cloneMenu(menu));
        } else if (code === "audit_log" || code === "report") {
          acc.report.push(cloneMenu(menu));
        } else {
          acc.setup.push(cloneMenu(menu));
        }

        return acc;
      },
      { home: [], setup: [], guest: [], archive: [], report: [] },
    );

    return [
      grouped.home.length && { label: "HOME", items: grouped.home },
      grouped.setup.length && { label: "SETUP", items: grouped.setup },
      grouped.guest.length && { label: "BUKU TAMU", items: grouped.guest },
      grouped.archive.length && { label: "ARSIP", items: grouped.archive },
      grouped.report.length && { label: "REPORT", items: grouped.report },
    ].filter(Boolean);
  }

  return [];
};

const buildTree = (rows) => {
  const nodeById = new Map();
  const roots = [];

  rows.forEach((row) => {
    nodeById.set(row.MenuId, {
      id: row.MenuId,
      parentId: row.ParentMenuId,
      sortOrder: row.SortOrder || 0,
      label: row.MenuName,
      icon: row.MenuIcon || undefined,
      to: row.MenuPath || undefined,
      items: [],
    });
  });

  nodeById.forEach((node) => {
    if (node.parentId) {
      if (nodeById.has(node.parentId)) {
        nodeById.get(node.parentId).items.push(node);
      }
      // Jika parentId ada tapi parent tidak ditemukan (orphan karena hak akses dicabut), 
      // maka jangan dimasukkan ke roots agar tidak muncul berantakan di luar.
    } else {
      roots.push(node);
    }
  });

  const clean = (items) =>
    items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((node) => {
        const { items: childItems, ...item } = node;
        delete item.id;
        delete item.parentId;
        delete item.sortOrder;

        return {
          ...item,
          ...(childItems.length ? { items: clean(childItems) } : {}),
        };
      });

  return clean(roots);
};

const querySafely = async (queryBuilder) => {
  try {
    return await queryBuilder();
  } catch {
    return null;
  }
};

const getPrimaryRole = async (DB, user) => {
  if (!user?.id_pengguna) return null;

  const query = DB("mst_pengguna_peran as pengguna_peran")
    .leftJoin(
      "mst_peran as peran",
      "pengguna_peran.id_peran",
      "peran.id_peran",
    )
    .select(
      "peran.kode_peran",
      "peran.nama_peran",
    )
    .where("pengguna_peran.id_pengguna", user.id_pengguna)
    .where((builder) => {
      builder
        .where("pengguna_peran.status", "active")
        .orWhereNull("pengguna_peran.status");
    })
    .orderBy("pengguna_peran.peran_utama", "desc");

  return await querySafely(() => query.first());
};

const getUser = async (DB, uniqueId) => {
  const query = DB("mst_pengguna").select(
    "id_pengguna",
    "nama_pengguna",
    "nama_lengkap",
    "status",
  );

  query.where((builder) => {
    builder.where("nama_pengguna", uniqueId);

    if (uniqueId !== undefined && uniqueId !== null && uniqueId !== "") {
      const numericId = Number(uniqueId);
      if (Number.isFinite(numericId)) {
        builder.orWhere("id_pengguna", numericId);
      }
    }
  });

  const user = await querySafely(() => query.first());
  if (!user) return null;

  const role = await getPrimaryRole(DB, user);

  return {
    ...user,
    peran: role?.nama_peran || role?.kode_peran || null,
    kode_peran: role?.kode_peran || null,
  };
};

const getRbacMenu = async (DB, user) => {
  if (!user?.id_pengguna && !user?.nama_pengguna && !user?.peran) return [];

  let rows = [];

  if (user?.id_pengguna) {
    rows =
      (await querySafely(() =>
        DB("mst_menu as menu")
          .distinct(
            "menu.id_menu as MenuId",
            "menu.id_menu_induk as ParentMenuId",
            "menu.nama_menu as MenuName",
            "menu.jalur_menu as MenuPath",
            "menu.ikon_menu as MenuIcon",
            "menu.urutan as SortOrder",
          )
          .join(
            "mst_peran_menu as peran_menu",
            "peran_menu.id_menu",
            "menu.id_menu",
          )
          .join(
            "mst_peran as peran",
            "peran.id_peran",
            "peran_menu.id_peran",
          )
          .join(
            "mst_pengguna_peran as pengguna_peran",
            "pengguna_peran.id_peran",
            "peran.id_peran",
          )
          .where("pengguna_peran.id_pengguna", user.id_pengguna)
          .where("menu.status_aktif", 1)
          .where("peran_menu.hak_lihat", 1)
          .where("peran.status", "active")
          .where("pengguna_peran.status", "active")
          .orderBy("menu.urutan", "asc"),
      )) || [];
  }

  if (rows.length < 1 && user?.peran) {
    rows =
      (await querySafely(() =>
        DB("mst_menu as menu")
          .distinct(
            "menu.id_menu as MenuId",
            "menu.id_menu_induk as ParentMenuId",
            "menu.nama_menu as MenuName",
            "menu.jalur_menu as MenuPath",
            "menu.ikon_menu as MenuIcon",
            "menu.urutan as SortOrder",
          )
          .join(
            "mst_peran_menu as peran_menu",
            "peran_menu.id_menu",
            "menu.id_menu",
          )
          .join(
            "mst_peran as peran",
            "peran.id_peran",
            "peran_menu.id_peran",
          )
          .where((builder) => {
            builder
              .whereIn("peran.kode_peran", peranAliases(user.peran))
              .orWhereIn("peran.nama_peran", peranAliases(user.peran));
          })
          .where("menu.status_aktif", 1)
          .where("peran_menu.hak_lihat", 1)
          .where("peran.status", "active")
          .orderBy("menu.urutan", "asc"),
      )) || [];
  }

  return rows.length ? buildTree(rows) : [];
};

const getNavigationMenu = async (DB, uniqueId) => {
  const oUser = await getUser(DB, uniqueId);

  const vaRbacMenu = await getRbacMenu(DB, oUser);

  // Helper to merge menus is no longer strictly necessary if we only use vaRbacMenu,
  // but let's keep it in case it's useful or just assign directly.
  const vaCombinedMenu = [...(vaRbacMenu || [])];

  let oSetupGroup = vaCombinedMenu.find(m => m.label && (m.label.toUpperCase() === 'SETUP' || m.label.toUpperCase() === 'SET UP'));

  // Pindahkan Management Menu ke dalam Setup (buat grup jika belum ada)
  const nManagementMenuIdx = vaCombinedMenu.findIndex(m => m.label && m.label.toUpperCase() === 'MANAGEMENT MENU');
  if (nManagementMenuIdx !== -1) {
    const oMm = vaCombinedMenu.splice(nManagementMenuIdx, 1)[0];
    if (!oSetupGroup) {
      oSetupGroup = { label: 'SETUP', items: [] };
      // Sisipkan setelah HOME jika ada, atau di indeks 0
      const nHomeIdx = vaCombinedMenu.findIndex(m => m.label && (m.label.toUpperCase() === 'HOME' || m.label.toUpperCase() === 'BERANDA'));
      vaCombinedMenu.splice(nHomeIdx !== -1 ? nHomeIdx + 1 : 0, 0, oSetupGroup);
    }
    oSetupGroup.items = oSetupGroup.items || [];
    oSetupGroup.items.push(oMm);
  }

  const removeEmptyItems = (vaMenuArray) => {
    return vaMenuArray.map(oItem => {
      const oNewItem = { ...oItem };
      if (oNewItem.items) {
        if (oNewItem.items.length === 0) {
          delete oNewItem.items;
        } else {
          oNewItem.items = removeEmptyItems(oNewItem.items);
          if (oNewItem.items.length === 0) {
            delete oNewItem.items;
          }
        }
      }
      return oNewItem;
    });
  };

  if (vaCombinedMenu && vaCombinedMenu.length) {
    // Reorder: Letakkan "Master Organisasi" tepat di bawah "SETUP"
    const nMasterOrgIdx = vaCombinedMenu.findIndex(m => m.label && m.label.toUpperCase() === 'MASTER ORGANISASI');
    const nSetupIdx = vaCombinedMenu.findIndex(m => m.label && (m.label.toUpperCase() === 'SETUP' || m.label.toUpperCase() === 'SET UP'));

    if (nMasterOrgIdx !== -1 && nSetupIdx !== -1 && nMasterOrgIdx !== nSetupIdx + 1) {
      const oMo = vaCombinedMenu.splice(nMasterOrgIdx, 1)[0];
      // Karena nMasterOrgIdx bisa saja di depan atau di belakang nSetupIdx, kita cari lagi nSetupIdx yang baru
      const nNewSetupIdx = vaCombinedMenu.findIndex(m => m.label && (m.label.toUpperCase() === 'SETUP' || m.label.toUpperCase() === 'SET UP'));
      vaCombinedMenu.splice(nNewSetupIdx + 1, 0, oMo);
    }

    // Reorder: Letakkan "Master Arsip" tepat di bawah "Master Organisasi"
    const nMasterArsipIdx = vaCombinedMenu.findIndex(m => m.label && m.label.toUpperCase() === 'MASTER ARSIP');
    const nNewMasterOrgIdx = vaCombinedMenu.findIndex(m => m.label && m.label.toUpperCase() === 'MASTER ORGANISASI');

    if (nMasterArsipIdx !== -1 && nNewMasterOrgIdx !== -1 && nMasterArsipIdx !== nNewMasterOrgIdx + 1) {
      const oMa = vaCombinedMenu.splice(nMasterArsipIdx, 1)[0];
      const nLatestMasterOrgIdx = vaCombinedMenu.findIndex(m => m.label && m.label.toUpperCase() === 'MASTER ORGANISASI');
      vaCombinedMenu.splice(nLatestMasterOrgIdx + 1, 0, oMa);
    }

    return {
      menu: removeEmptyItems(vaCombinedMenu),
      source: "merged",
      user: oUser,
    };
  }

  return { menu: [], source: null, user: oUser };
};

export { getNavigationMenu, normalizeLegacyMenu, roleAliases };
