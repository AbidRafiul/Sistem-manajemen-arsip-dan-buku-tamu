import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

const now = () => new Date();

const findPersuratanMenu = async (knex) => {
  const byCode = await knex("mst_menu")
    .whereIn("kode_menu", ["PERSURATAN", "MN_PERSURATAN"])
    .first();

  if (byCode) return byCode;

  return await knex("mst_menu")
    .whereIn("nama_menu", ["PERSURATAN", "KORESPONDENSI"])
    .orWhere("nama_menu", "like", "%PERSURATAN%")
    .orWhere("nama_menu", "like", "%KORESPONDENSI%")
    .first();
};

const ensureMenu = async (knex, matcher, payload) => {
  const existing = await knex("mst_menu").where(matcher).first();

  if (existing) {
    await knex("mst_menu")
      .where("id_menu", existing.id_menu)
      .update({
        ...payload,
        updated_at: now(),
      });

    return existing.id_menu;
  }

  const inserted = await knex("mst_menu").insert({
    ...payload,
    created_at: now(),
    updated_at: now(),
  });

  return Array.isArray(inserted) ? inserted[0] : inserted;
};

const getAdminRoleIds = async (knex) => {
  const roles = await knex("mst_peran")
    .whereIn("kode_peran", ["SUPERADMIN", "ADM", "ADMIN"])
    .orWhereIn("nama_peran", ["Superadmin", "Administrator", "Admin"])
    .select("id_peran");

  return roles.map((role) => role.id_peran).filter(Boolean);
};

const grantMenuAccess = async (knex, id_menu, roleIds) => {
  await knex("mst_peran_menu")
    .where("id_menu", id_menu)
    .whereIn("id_peran", roleIds)
    .del();

  if (!roleIds.length) return;

  await knex("mst_peran_menu").insert(
    roleIds.map((id_peran) => ({
      id_peran,
      id_menu,
      hak_lihat: 1,
      hak_buat: 1,
      hak_ubah: 1,
      hak_hapus: 1,
      hak_setuju: 0,
      created_at: now(),
      updated_at: now(),
    }))
  );
};

export async function seed(knex) {
  const persuratan = await findPersuratanMenu(knex);

  if (!persuratan) {
    throw new Error("Menu PERSURATAN/KORESPONDENSI belum ditemukan.");
  }

  const idSuratKeluar = await ensureMenu(
    knex,
    (builder) => {
      builder
        .where("kode_menu", "SURAT_KELUAR")
        .orWhere("kode_menu", "MN_SURAT_KELUAR");
    },
    {
      id_menu_induk: persuratan.id_menu,
      kode_menu: "SURAT_KELUAR",
      nama_menu: "Surat Keluar",
      jalur_menu: "",
      ikon_menu: "pi pi-fw pi-send",
      urutan: 2,
      status_aktif: 1,
    }
  );

  const idDashboardSuratKeluar = await ensureMenu(
    knex,
    (builder) => {
      builder
        .where("kode_menu", "SK_DASHBOARD")
        .orWhere("kode_menu", "DASHBOARD_SURAT_KELUAR")
        .orWhere("jalur_menu", "/correspondence/outgoing_letter/dashboard");
    },
    {
      id_menu_induk: idSuratKeluar,
      kode_menu: "SK_DASHBOARD",
      nama_menu: "Dashboard Outgoing Letter", // let's translate or use "Dashboard Surat Keluar" as request
      nama_menu: "Dashboard Surat Keluar",
      jalur_menu: "/correspondence/outgoing_letter/dashboard",
      ikon_menu: "pi pi-fw pi-chart-bar",
      urutan: 1,
      status_aktif: 1,
    }
  );

  const idDataSuratKeluar = await ensureMenu(
    knex,
    (builder) => {
      builder
        .where("kode_menu", "SK_DATA")
        .orWhere("kode_menu", "DATA_SURAT_KELUAR")
        .orWhere("jalur_menu", "/correspondence/outgoing_letter")
        .orWhere("jalur_menu", "/correspondence/outgoing-letter");
    },
    {
      id_menu_induk: idSuratKeluar,
      kode_menu: "SK_DATA",
      nama_menu: "Data Surat Keluar",
      jalur_menu: "/correspondence/outgoing_letter",
      ikon_menu: "pi pi-fw pi-table",
      urutan: 2,
      status_aktif: 1,
    }
  );

  const idApprovalSuratKeluar = await ensureMenu(
    knex,
    (builder) => {
      builder
        .where("kode_menu", "SK_APPROVAL")
        .orWhere("kode_menu", "APPROVAL_SURAT_KELUAR")
        .orWhere("jalur_menu", "/correspondence/outgoing_letter/approval");
    },
    {
      id_menu_induk: idSuratKeluar,
      kode_menu: "SK_APPROVAL",
      nama_menu: "Approval Surat Keluar",
      jalur_menu: "/correspondence/outgoing_letter/approval",
      ikon_menu: "pi pi-fw pi-check-square",
      urutan: 3,
      status_aktif: 1,
    }
  );

  // Get Role IDs
  const adminRoles = await knex("mst_peran")
    .whereIn("kode_peran", ["SUPERADMIN", "ADM", "ADMIN"])
    .select("id_peran");
  const pmnRoles = await knex("mst_peran")
    .whereIn("kode_peran", ["PMN"])
    .select("id_peran");
  const skrRoles = await knex("mst_peran")
    .whereIn("kode_peran", ["SKR"])
    .select("id_peran");

  const adminRoleIds = adminRoles.map((r) => r.id_peran).filter(Boolean);
  const pmnRoleIds = pmnRoles.map((r) => r.id_peran).filter(Boolean);
  const skrRoleIds = skrRoles.map((r) => r.id_peran).filter(Boolean);

  // Grant Access:
  // - Parent (Surat Keluar): Admins, PMN, SKR
  // - Dashboard Surat Keluar: Admins, PMN, SKR
  // - Data Surat Keluar: Admins, SKR
  // - Approval Surat Keluar: Admins, PMN, SKR
  const parentMenuRoles = [...adminRoleIds, ...pmnRoleIds, ...skrRoleIds];
  const dashboardMenuRoles = [...adminRoleIds, ...pmnRoleIds, ...skrRoleIds];
  const dataMenuRoles = [...adminRoleIds, ...skrRoleIds];
  const approvalMenuRoles = [...adminRoleIds, ...pmnRoleIds, ...skrRoleIds];

  await grantMenuAccess(knex, idSuratKeluar, parentMenuRoles);
  await grantMenuAccess(knex, idDashboardSuratKeluar, dashboardMenuRoles);
  await grantMenuAccess(knex, idDataSuratKeluar, dataMenuRoles);
  
  // For approval menu, we can grant hak_setuju as 1 for PMN and SKR
  await knex("mst_peran_menu")
    .where("id_menu", idApprovalSuratKeluar)
    .whereIn("id_peran", approvalMenuRoles)
    .del();

  if (approvalMenuRoles.length > 0) {
    await knex("mst_peran_menu").insert(
      approvalMenuRoles.map((id_peran) => {
        const isApprover = pmnRoleIds.includes(id_peran) || skrRoleIds.includes(id_peran) || adminRoleIds.includes(id_peran);
        return {
          id_peran,
          id_menu: idApprovalSuratKeluar,
          hak_lihat: 1,
          hak_buat: 0,
          hak_ubah: isApprover ? 1 : 0,
          hak_hapus: 0,
          hak_setuju: isApprover ? 1 : 0,
          created_at: now(),
          updated_at: now(),
        };
      })
    );
  }

  // Rebuild and Cache menu for all affected roles
  const allAffectedRoles = Array.from(new Set([...parentMenuRoles, ...dashboardMenuRoles, ...dataMenuRoles, ...approvalMenuRoles]));
  for (const id_peran of allAffectedRoles) {
    await buildAndCacheMenu(id_peran);
  }

  // Also sync navigasi_pengguna for superadmin user (id_pengguna: 1)
  const admRole = adminRoles.find(r => r.kode_peran === "ADM");
  if (admRole) {
    const menuTree = await buildAndCacheMenu(admRole.id_peran);
    await knex("navigasi_pengguna")
      .insert({
        id_pengguna: 1,
        menu: JSON.stringify(menuTree),
        created_at: now(),
        updated_at: now()
      })
      .onConflict("id_pengguna")
      .merge({
        menu: JSON.stringify(menuTree),
        updated_at: now()
      });
  }

  console.log("Menu Surat Keluar, Dashboard, Data Surat Keluar, dan Approval Surat Keluar berhasil disinkronkan.");
}
