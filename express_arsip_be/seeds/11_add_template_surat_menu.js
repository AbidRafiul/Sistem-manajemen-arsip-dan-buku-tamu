import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

const now = () => new Date();

const findMasterArsip = async (knex) => {
  const byCode = await knex("mst_menu").where("kode_menu", "MN_MASTER_ARSIP").first();
  if (byCode) return byCode;

  const byName = await knex("mst_menu")
    .where("nama_menu", "like", "%Master Arsip%")
    .orWhere("nama_menu", "like", "%Master%Arsip%")
    .first();
  if (byName) return byName;

  const masterData = await knex("mst_menu").where("kode_menu", "MASTER_DATA").first();
  const idMasterData = masterData ? masterData.id_menu : null;

  const [insertedId] = await knex("mst_menu").insert({
    id_menu_induk: idMasterData,
    kode_menu: "MN_MASTER_ARSIP",
    nama_menu: "Master Arsip",
    ikon_menu: "pi pi-fw pi-folder",
    urutan: 3,
    status_aktif: 1,
    created_at: now(),
    updated_at: now()
  });

  return { id_menu: insertedId };
};

const ensureMenu = async (knex, matcher, payload) => {
  const existing = await knex("mst_menu").where(matcher).first();
  if (existing) {
    await knex("mst_menu").where("id_menu", existing.id_menu).update({ ...payload, updated_at: now() });
    return existing.id_menu;
  }

  const inserted = await knex("mst_menu").insert({ ...payload, created_at: now(), updated_at: now() });
  return Array.isArray(inserted) ? inserted[0] : inserted;
};

const grantMenuAccess = async (knex, id_menu, roleIds) => {
  if (!id_menu || !roleIds || !roleIds.length) return;
  await knex("mst_peran_menu").where("id_menu", id_menu).whereIn("id_peran", roleIds).del();
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
  const parent = await findMasterArsip(knex);
  const idMasterArsip = parent.id_menu;

  const idTemplateMenu = await ensureMenu(
    knex,
    (builder) => {
      builder.where("kode_menu", "MN_TEMPLATE_SURAT").orWhere("jalur_menu", "/master/korespondensi/template_surats");
    },
    {
      id_menu_induk: idMasterArsip,
      kode_menu: "MN_TEMPLATE_SURAT",
      nama_menu: "Master Template Surat",
      jalur_menu: "/master/korespondensi/template_surats",
      ikon_menu: "pi pi-fw pi-file",
      urutan: 6,
      status_aktif: 1,
    }
  );

  const adminRoles = await knex("mst_peran")
    .whereIn("kode_peran", ["SUPERADMIN", "ADM", "ADMIN"])
    .select("id_peran");
  const adminRoleIds = adminRoles.map((r) => r.id_peran).filter(Boolean);

  await grantMenuAccess(knex, idTemplateMenu, adminRoleIds);

  // Rebuild cache for affected roles
  for (const id_peran of adminRoleIds) {
    await buildAndCacheMenu(id_peran);
  }

  // Sync navigasi_pengguna for first admin user if exists
  const admRole = adminRoles[0];
  if (admRole) {
    const menuTree = await buildAndCacheMenu(admRole.id_peran);
    await knex("navigasi_pengguna").insert({
      id_pengguna: 1,
      menu: JSON.stringify(menuTree),
      created_at: now(),
      updated_at: now(),
    }).onConflict("id_pengguna").merge({ menu: JSON.stringify(menuTree), updated_at: now() });
  }

  console.log("Seed: Master Template Surat menu inserted/updated and cache rebuilt.");
}
