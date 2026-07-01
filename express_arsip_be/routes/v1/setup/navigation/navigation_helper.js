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
    if (node.parentId && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId).items.push(node);
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

const getExistingTable = async (DB, tableNames) => {
  for (const tableName of tableNames) {
    const exists = await querySafely(() => DB.schema.hasTable(tableName));
    if (exists) return tableName;
  }

  return null;
};

const getColumns = async (DB, tableName) => {
  const columns = await querySafely(async () => {
    const [rows] = await DB.raw("SHOW COLUMNS FROM ??", [tableName]);
    return rows.map((column) => column.Field);
  });

  return columns || [];
};

const pickColumn = (columns, candidates) => {
  return candidates.find((candidate) => columns.includes(candidate));
};

const uniqueValues = (values) => {
  return Array.from(
    new Set(values.filter((value) => value !== undefined && value !== null)),
  );
};

const getPrimaryRole = async (DB, user) => {
  if (!user?.id_pengguna && !user?.nama_pengguna) return null;

  const userRoleTable = await getExistingTable(DB, [
    "mst_pengguna_peran",
    "mst_pengguna_perans",
    "mst_user_roles",
  ]);
  const roleTable = await getExistingTable(DB, [
    "mst_peran",
    "mst_perans",
    "mst_roles",
  ]);

  if (!userRoleTable || !roleTable) return null;

  const userRoleColumns = await getColumns(DB, userRoleTable);
  const roleColumns = await getColumns(DB, roleTable);
  const userColumn = pickColumn(userRoleColumns, [
    "id_pengguna",
    "id_pengguna",
    "nama_pengguna",
    "UserId",
  ]);
  const userRoleRoleColumn = pickColumn(userRoleColumns, [
    "id_peran",
    "role_id",
    "RoleId",
  ]);
  const roleRoleColumn = pickColumn(roleColumns, [
    "id_peran",
    "role_id",
    "RoleId",
  ]);
  const roleCodeColumn = pickColumn(roleColumns, [
    "kode_peran",
    "role_code",
    "RoleCode",
  ]);
  const roleNameColumn = pickColumn(roleColumns, [
    "nama_peran",
    "role_name",
    "RoleName",
  ]);
  const primaryColumn = pickColumn(userRoleColumns, [
    "peran_utama",
    "is_primary",
    "IsPrimary",
  ]);
  const statusColumn = pickColumn(userRoleColumns, ["status", "Status"]);

  if (!userColumn || !userRoleRoleColumn || !roleRoleColumn) return null;

  const userValue = ["nama_pengguna", "username", "Username"].includes(
    userColumn,
  )
    ? user.nama_pengguna
    : user.id_pengguna;

  const query = DB(`${userRoleTable} as ur`)
    .leftJoin(
      `${roleTable} as r`,
      `ur.${userRoleRoleColumn}`,
      `r.${roleRoleColumn}`,
    )
    .select(
      roleCodeColumn
        ? `r.${roleCodeColumn} as kode_peran`
        : DB.raw("NULL as kode_peran"),
      roleNameColumn
        ? `r.${roleNameColumn} as nama_peran`
        : DB.raw("NULL as nama_peran"),
    )
    .where(`ur.${userColumn}`, userValue);

  if (statusColumn) {
    query.where((builder) => {
      builder
        .where(`ur.${statusColumn}`, "active")
        .orWhereNull(`ur.${statusColumn}`);
    });
  }

  if (primaryColumn) {
    query.orderBy(`ur.${primaryColumn}`, "desc");
  }

  return await querySafely(() => query.first());
};

const getUser = async (DB, uniqueId) => {
  const userTable = await getExistingTable(DB, ["mst_pengguna", "mst_users"]);
  if (!userTable) return null;

  const columns = await getColumns(DB, userTable);
  const idColumn = pickColumn(columns, [
    "id_pengguna",
    "id_pengguna",
    "UserId",
    "nama_pengguna",
  ]);
  const usernameColumn = pickColumn(columns, [
    "nama_pengguna",
    "username",
    "Username",
  ]);
  const fullnameColumn = pickColumn(columns, [
    "nama_lengkap",
    "fullname",
    "Fullname",
  ]);
  const statusColumn = pickColumn(columns, ["status", "Status"]);

  if (!idColumn && !usernameColumn) return null;

  const query = DB(userTable).select(
    idColumn ? `${idColumn} as id_pengguna` : DB.raw("NULL as id_pengguna"),
    usernameColumn
      ? `${usernameColumn} as nama_pengguna`
      : DB.raw("NULL as nama_pengguna"),
    fullnameColumn
      ? `${fullnameColumn} as nama_lengkap`
      : DB.raw("NULL as nama_lengkap"),
    statusColumn ? `${statusColumn} as status` : DB.raw("'active' as status"),
  );

  query.where((builder) => {
    if (usernameColumn) builder.where(usernameColumn, uniqueId);

    if (
      idColumn &&
      uniqueId !== undefined &&
      uniqueId !== null &&
      uniqueId !== ""
    ) {
      const numericId = Number(uniqueId);
      if (Number.isFinite(numericId)) {
        builder.orWhere(idColumn, numericId);
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

const getLegacyUserMenu = async (DB, user, uniqueId) => {
  const navigationTable = await getExistingTable(DB, [
    "user_navigation",
    "navigasi_pengguna",
  ]);

  if (!navigationTable) return [];

  const columns = await getColumns(DB, navigationTable);
  const menuColumn = pickColumn(columns, ["menu", "Menu"]);
  const userColumn = pickColumn(columns, [
    "id_pengguna",
    "id_pengguna",
    "nama_pengguna",
    "UserId",
    "UniqueId",
    "unique_id",
  ]);

  if (!menuColumn || !userColumn) return [];

  const lookupValues =
    userColumn === "nama_pengguna"
      ? uniqueValues([user?.id_pengguna, user?.nama_pengguna, uniqueId])
      : uniqueValues([user?.id_pengguna, uniqueId]);

  for (const lookupValue of lookupValues) {
    const navigation = await querySafely(() =>
      DB(navigationTable)
        .select(`${menuColumn} as menu`)
        .where(userColumn, lookupValue)
        .first(),
    );

    const menu = normalizeLegacyMenu(navigation?.menu);
    if (menu.length) return menu;
  }

  return [];
};

const getLegacyperanMenu = async (DB, peran) => {
  const aliases = peranAliases(peran);
  const navigationTable = await getExistingTable(DB, [
    "mst_navigasi",
    "mst_navigation",
  ]);

  if (!navigationTable || !aliases.length) return [];

  const columns = await getColumns(DB, navigationTable);
  const menuColumn = pickColumn(columns, ["menu", "Menu"]);
  const roleColumn = pickColumn(columns, ["peran", "role", "Role"]);

  if (!menuColumn || !roleColumn) return [];

  const navigation = await querySafely(() =>
    DB(navigationTable)
      .select(`${menuColumn} as menu`)
      .whereIn(roleColumn, aliases)
      .orderByRaw(`CASE WHEN ?? = ? THEN 0 ELSE 1 END`, [
        roleColumn,
        peran || "",
      ])
      .first(),
  );

  return normalizeLegacyMenu(navigation?.menu);
};

const getRbacMenu = async (DB, user) => {
  if (!user?.id_pengguna && !user?.nama_pengguna && !user?.peran) return [];

  const menuTable = await getExistingTable(DB, ["mst_menu", "mst_menus"]);
  const roleMenuTable = await getExistingTable(DB, [
    "mst_peran_menu",
    "mst_peran_menus",
    "mst_role_menus",
  ]);
  const roleTable = await getExistingTable(DB, [
    "mst_peran",
    "mst_perans",
    "mst_roles",
  ]);
  const userRoleTable = await getExistingTable(DB, [
    "mst_pengguna_peran",
    "mst_pengguna_perans",
    "mst_user_roles",
  ]);

  if (!menuTable || !roleMenuTable || !roleTable) return [];

  const menuColumns = await getColumns(DB, menuTable);
  const roleMenuColumns = await getColumns(DB, roleMenuTable);
  const roleColumns = await getColumns(DB, roleTable);
  const userRoleColumns = userRoleTable
    ? await getColumns(DB, userRoleTable)
    : [];
  const menuIdColumn = pickColumn(menuColumns, [
    "id_menu",
    "menu_id",
    "MenuId",
  ]);
  const parentMenuColumn = pickColumn(menuColumns, [
    "id_menu_induk",
    "parent_menu_id",
    "ParentMenuId",
  ]);
  const menuNameColumn = pickColumn(menuColumns, [
    "nama_menu",
    "menu_name",
    "MenuName",
  ]);
  const menuPathColumn = pickColumn(menuColumns, [
    "jalur_menu",
    "menu_path",
    "MenuPath",
  ]);
  const menuIconColumn = pickColumn(menuColumns, [
    "ikon_menu",
    "menu_icon",
    "MenuIcon",
  ]);
  const sortColumn = pickColumn(menuColumns, [
    "urutan",
    "sort_order",
    "SortOrder",
  ]);
  const activeColumn = pickColumn(menuColumns, [
    "status_aktif",
    "is_active",
    "IsActive",
  ]);
  const roleMenuRoleColumn = pickColumn(roleMenuColumns, [
    "id_peran",
    "role_id",
    "RoleId",
  ]);
  const roleMenuMenuColumn = pickColumn(roleMenuColumns, [
    "id_menu",
    "menu_id",
    "MenuId",
  ]);
  const viewColumn = pickColumn(roleMenuColumns, [
    "hak_lihat",
    "can_view",
    "CanView",
  ]);
  const roleIdColumn = pickColumn(roleColumns, [
    "id_peran",
    "role_id",
    "RoleId",
  ]);
  const roleCodeColumn = pickColumn(roleColumns, [
    "kode_peran",
    "role_code",
    "RoleCode",
  ]);
  const roleNameColumn = pickColumn(roleColumns, [
    "nama_peran",
    "role_name",
    "RoleName",
  ]);
  const roleStatusColumn = pickColumn(roleColumns, ["status", "Status"]);

  if (
    !menuIdColumn ||
    !menuNameColumn ||
    !roleMenuRoleColumn ||
    !roleMenuMenuColumn ||
    !roleIdColumn
  ) {
    return [];
  }

  let rows = [];

  if (userRoleTable && user?.id_pengguna) {
    const userColumn = pickColumn(userRoleColumns, [
      "id_pengguna",
      "id_pengguna",
      "nama_pengguna",
      "UserId",
    ]);
    const userRoleRoleColumn = pickColumn(userRoleColumns, [
      "id_peran",
      "role_id",
      "RoleId",
    ]);
    const userRoleStatusColumn = pickColumn(userRoleColumns, [
      "status",
      "Status",
    ]);

    rows =
      (await querySafely(() =>
        DB(`${menuTable} as m`)
          .distinct(
            `m.${menuIdColumn} as MenuId`,
            parentMenuColumn
              ? `m.${parentMenuColumn} as ParentMenuId`
              : DB.raw("NULL as ParentMenuId"),
            `m.${menuNameColumn} as MenuName`,
            menuPathColumn
              ? `m.${menuPathColumn} as MenuPath`
              : DB.raw("NULL as MenuPath"),
            menuIconColumn
              ? `m.${menuIconColumn} as MenuIcon`
              : DB.raw("NULL as MenuIcon"),
            sortColumn
              ? `m.${sortColumn} as SortOrder`
              : DB.raw("0 as SortOrder"),
          )
          .join(
            `${roleMenuTable} as rm`,
            `rm.${roleMenuMenuColumn}`,
            `m.${menuIdColumn}`,
          )
          .join(
            `${roleTable} as r`,
            `r.${roleIdColumn}`,
            `rm.${roleMenuRoleColumn}`,
          )
          .join(
            `${userRoleTable} as ur`,
            `ur.${userRoleRoleColumn}`,
            `r.${roleIdColumn}`,
          )
          .where(
            `ur.${userColumn}`,
            ["nama_pengguna", "username", "Username"].includes(userColumn)
              ? user.nama_pengguna
              : user.id_pengguna,
          )
          .modify((query) => {
            if (activeColumn) query.where(`m.${activeColumn}`, 1);
            if (viewColumn) query.where(`rm.${viewColumn}`, 1);
            if (roleStatusColumn)
              query.where(`r.${roleStatusColumn}`, "active");
            if (userRoleStatusColumn)
              query.where(`ur.${userRoleStatusColumn}`, "active");
          })
          .orderBy(sortColumn ? `m.${sortColumn}` : `m.${menuIdColumn}`, "asc"),
      )) || [];
  }

  if (rows.length < 1 && user?.peran) {
    rows =
      (await querySafely(() =>
        DB(`${menuTable} as m`)
          .distinct(
            `m.${menuIdColumn} as MenuId`,
            parentMenuColumn
              ? `m.${parentMenuColumn} as ParentMenuId`
              : DB.raw("NULL as ParentMenuId"),
            `m.${menuNameColumn} as MenuName`,
            menuPathColumn
              ? `m.${menuPathColumn} as MenuPath`
              : DB.raw("NULL as MenuPath"),
            menuIconColumn
              ? `m.${menuIconColumn} as MenuIcon`
              : DB.raw("NULL as MenuIcon"),
            sortColumn
              ? `m.${sortColumn} as SortOrder`
              : DB.raw("0 as SortOrder"),
          )
          .join(
            `${roleMenuTable} as rm`,
            `rm.${roleMenuMenuColumn}`,
            `m.${menuIdColumn}`,
          )
          .join(
            `${roleTable} as r`,
            `r.${roleIdColumn}`,
            `rm.${roleMenuRoleColumn}`,
          )
          .where((builder) => {
            if (roleCodeColumn)
              builder.whereIn(`r.${roleCodeColumn}`, peranAliases(user.peran));
            if (roleNameColumn)
              builder.orWhereIn(
                `r.${roleNameColumn}`,
                peranAliases(user.peran),
              );
          })
          .modify((query) => {
            if (activeColumn) query.where(`m.${activeColumn}`, 1);
            if (viewColumn) query.where(`rm.${viewColumn}`, 1);
            if (roleStatusColumn)
              query.where(`r.${roleStatusColumn}`, "active");
          })
          .orderBy(sortColumn ? `m.${sortColumn}` : `m.${menuIdColumn}`, "asc"),
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

    return {
      menu: removeEmptyItems(ensureArchiveDocumentMenu(vaCombinedMenu)),
      source: "merged",
      user: oUser,
    };
  }

  return { menu: [], source: null, user: oUser };
};

export { getNavigationMenu, normalizeLegacyMenu, roleAliases };
