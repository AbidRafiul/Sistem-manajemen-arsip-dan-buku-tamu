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
    items: [{ label: "Config", icon: "pi pi-fw pi-wrench", to: "/setup/config" }],
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

const ROLE_ALIASES = {
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
  }
];

const ensureArchiveDocumentMenu = (menu) => {
  if (!Array.isArray(menu)) return [];

  const hasItem = (items = [], toPath) => {
    return items.some((item) => item.to === toPath || hasItem(item.items || [], toPath));
  };

  const hasAll = archiveDocumentItems.every((reqItem) => hasItem(menu, reqItem.to));
  if (hasAll) return menu;

  const archiveGroup = menu.find((item) => {
    const label = item.label?.toLowerCase();
    return label === "arsip dokumen" || label === "edms" || label === "arsip";
  });

  if (archiveGroup) {
    const existingTos = (archiveGroup.items || []).map(item => item.to);
    const missingItems = archiveDocumentItems.filter(item => !existingTos.includes(item.to)).map(cloneMenu);
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

const roleAliases = (role) => {
  const normalized = String(role || "").trim();
  const key = normalized.toLowerCase();
  return Array.from(new Set([normalized, ...(ROLE_ALIASES[key] || [])].filter(Boolean)));
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
    const grouped = parsed.menus.reduce((acc, code) => {
      const menu = MENU_CATALOG[code];
      if (!menu) return acc;

      if (code === "dashboard") {
        acc.home.push(cloneMenu(menu));
      } else if (code.startsWith("buku_tamu")) {
        acc.guest.push(cloneMenu(menu));
      } else if (code.startsWith("arsip") || code === "report_arsip" || code === "approval") {
        acc.archive.push(cloneMenu(menu));
      } else if (code === "audit_log" || code === "report") {
        acc.report.push(cloneMenu(menu));
      } else {
        acc.setup.push(cloneMenu(menu));
      }

      return acc;
    }, { home: [], setup: [], guest: [], archive: [], report: [] });

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

  const clean = (items) => items
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
  return await querySafely(() => DB("user_credential")
    .select("UniqueId", "Username", "Role")
    .where("UniqueId", uniqueId)
    .first());
};

const getLegacyUserMenu = async (DB, uniqueId) => {
  const navigation = await querySafely(() => DB("user_navigation")
    .select("Menu as menu")
    .where("UniqueId", uniqueId)
    .first());

  return normalizeLegacyMenu(navigation?.menu);
};

const getLegacyRoleMenu = async (DB, role) => {
  const aliases = roleAliases(role);
  const navigation = await querySafely(() => DB("mst_navigation")
    .select("Menu as menu")
    .whereIn("Role", aliases)
    .orderByRaw(`CASE WHEN Role = ? THEN 0 ELSE 1 END`, [role || ""])
    .first());

  return normalizeLegacyMenu(navigation?.menu);
};

const getRbacMenu = async (DB, user) => {
  if (!user?.Username && !user?.Role) return [];

  let rows = [];

  if (user?.Username) {
    rows = await querySafely(() => DB("mst_menus as m")
      .distinct(
        "m.MenuId",
        "m.ParentMenuId",
        "m.MenuName",
        "m.MenuPath",
        "m.MenuIcon",
        "m.SortOrder",
      )
      .join("mst_role_menus as rm", "rm.MenuId", "m.MenuId")
      .join("mst_roles as r", "r.RoleId", "rm.RoleId")
      .join("mst_user_roles as ur", "ur.RoleId", "r.RoleId")
      .join("mst_users as u", "u.UserId", "ur.UserId")
      .where("u.Username", user.Username)
      .where("m.IsActive", 1)
      .where("rm.CanView", 1)
      .where("r.Status", "active")
      .where("ur.Status", "active")
      .orderBy("m.SortOrder", "asc")) || [];
  }

  if (rows.length < 1 && user?.Role) {
    rows = await querySafely(() => DB("mst_menus as m")
      .distinct(
        "m.MenuId",
        "m.ParentMenuId",
        "m.MenuName",
        "m.MenuPath",
        "m.MenuIcon",
        "m.SortOrder",
      )
      .join("mst_role_menus as rm", "rm.MenuId", "m.MenuId")
      .join("mst_roles as r", "r.RoleId", "rm.RoleId")
      .where((builder) => {
        builder
          .whereIn("r.RoleCode", roleAliases(user.Role))
          .orWhereIn("r.RoleName", roleAliases(user.Role));
      })
      .where("m.IsActive", 1)
      .where("rm.CanView", 1)
      .where("r.Status", "active")
      .orderBy("m.SortOrder", "asc")) || [];
  }

  return rows.length ? buildTree(rows) : [];
};

const getNavigationMenu = async (DB, uniqueId) => {
  const user = await getUser(DB, uniqueId);

  const legacyUserMenu = await getLegacyUserMenu(DB, uniqueId);
  if (legacyUserMenu.length) {
    return { menu: ensureArchiveDocumentMenu(legacyUserMenu), source: "user_navigation", user };
  }

  const rbacMenu = await getRbacMenu(DB, user);
  if (rbacMenu.length) {
    return { menu: ensureArchiveDocumentMenu(rbacMenu), source: "mst_role_menus", user };
  }

  const legacyRoleMenu = await getLegacyRoleMenu(DB, user?.Role);
  if (legacyRoleMenu.length) {
    return { menu: ensureArchiveDocumentMenu(legacyRoleMenu), source: "mst_navigation", user };
  }

  return { menu: [], source: null, user };
};

export { getNavigationMenu, normalizeLegacyMenu };
