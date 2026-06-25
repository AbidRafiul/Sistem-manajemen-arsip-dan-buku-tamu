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
  pimpinan: ["Pimpinan", "PMN"],
  sekretaris: ["Sekretaris", "SKR"],
  "staff arsip": ["Staff Arsip", "STF_ARS"],
  "staff umum": ["Staff Umum", "STF_UMM"],
  resepsionis: ["Resepsionis", "RSP"],
  auditor: ["Auditor", "AUD"],
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
    if (node.parentId && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId).items.push(node);
    } else {
      roots.push(node);
    }
  });

  const clean = (items) =>
    items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ id, parentId, sortOrder, items, ...item }) => ({
        ...item,
        ...(items.length ? { items: clean(items) } : {}),
      }));

  return clean(roots);
};

const querySafely = async (queryBuilder) => {
  try {
    return await queryBuilder();
  } catch {
    return null;
  }
};

const getUser = async (DB, uniqueId) => {
  return await querySafely(() =>
    DB("mst_pengguna")
      .leftJoin(
        "mst_pengguna_perans",
        "mst_pengguna.nama_pengguna",
        "mst_pengguna_perans.nama_pengguna",
      )
      .leftJoin(
        "mst_perans",
        "mst_pengguna_perans.id_peran",
        "mst_perans.id_peran",
      )
      .select(
        "mst_pengguna.nama_pengguna as nama_pengguna",
        "mst_pengguna.nama_pengguna as nama_pengguna",
        "mst_perans.nama_peran as peran",
      )
      .where("mst_pengguna.nama_pengguna", uniqueId)
      .first(),
  );
};

const getLegacyUserMenu = async (DB, uniqueId) => {
  const navigation = await querySafely(() =>
    DB("navigasi_pengguna")
      .select("menu")
      .where("nama_pengguna", uniqueId)
      .first(),
  );

  return normalizeLegacyMenu(navigation?.menu);
};

const getLegacyperanMenu = async (DB, peran) => {
  const aliases = peranAliases(peran);
  const navigation = await querySafely(() =>
    DB("mst_navigasi")
      .select("menu")
      .whereIn("peran", aliases)
      .orderByRaw(`CASE WHEN peran = ? THEN 0 ELSE 1 END`, [peran || ""])
      .first(),
  );

  return normalizeLegacyMenu(navigation?.menu);
};

const getRbacMenu = async (DB, user) => {
  if (!user?.nama_pengguna && !user?.peran) return [];

  let rows = [];

  if (user?.nama_pengguna) {
    rows =
      (await querySafely(() =>
        DB("mst_menus as m")
          .distinct(
            "m.menu_id as MenuId",
            "m.parent_menu_id as ParentMenuId",
            "m.menu_name as MenuName",
            "m.menu_path as MenuPath",
            "m.menu_icon as MenuIcon",
            "m.sort_order as SortOrder",
          )
          .join("mst_peran_menus as rm", "rm.menu_id", "m.menu_id")
          .join("mst_perans as r", "r.id_peran", "rm.id_peran")
          .join("mst_pengguna_perans as ur", "ur.id_peran", "r.id_peran")
          .join("mst_pengguna as u", "u.nama_pengguna", "ur.nama_pengguna")
          .where("u.nama_pengguna", user.nama_pengguna)
          .where("m.is_active", 1)
          .where("rm.can_view", 1)
          .where("r.status", "active")
          .where("ur.status", "active")
          .orderBy("m.sort_order", "asc"),
      )) || [];
  }

  if (rows.length < 1 && user?.peran) {
    rows =
      (await querySafely(() =>
        DB("mst_menus as m")
          .distinct(
            "m.menu_id as MenuId",
            "m.parent_menu_id as ParentMenuId",
            "m.menu_name as MenuName",
            "m.menu_path as MenuPath",
            "m.menu_icon as MenuIcon",
            "m.sort_order as SortOrder",
          )
          .join("mst_peran_menus as rm", "rm.menu_id", "m.menu_id")
          .join("mst_perans as r", "r.id_peran", "rm.id_peran")
          .where((builder) => {
            builder
              .whereIn("r.kode_peran", peranAliases(user.peran))
              .orWhereIn("r.nama_peran", peranAliases(user.peran));
          })
          .where("m.is_active", 1)
          .where("rm.can_view", 1)
          .where("r.status", "active")
          .orderBy("m.sort_order", "asc"),
      )) || [];
  }

  return rows.length ? buildTree(rows) : [];
};

const getNavigationMenu = async (DB, uniqueId) => {
  const user = await getUser(DB, uniqueId);

  const legacyUserMenu = await getLegacyUserMenu(DB, uniqueId);
  if (legacyUserMenu.length) {
    return {
      menu: ensureArchiveDocumentMenu(legacyUserMenu),
      source: "navigasi_pengguna",
      user,
    };
  }

  const rbacMenu = await getRbacMenu(DB, user);
  if (rbacMenu.length) {
    return {
      menu: ensureArchiveDocumentMenu(rbacMenu),
      source: "mst_peran_menus",
      user,
    };
  }

  const legacyperanMenu = await getLegacyperanMenu(DB, user?.peran);
  if (legacyperanMenu.length) {
    return {
      menu: ensureArchiveDocumentMenu(legacyperanMenu),
      source: "mst_navigasi",
      user,
    };
  }

  return { menu: [], source: null, user };
};

export { getNavigationMenu, normalizeLegacyMenu };
