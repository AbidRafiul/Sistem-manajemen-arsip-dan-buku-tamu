import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

const now = () => new Date();

const findMasterArsip = async (knex) => {
  const byCode = await knex("mst_menu").where("kode_menu", "MN_MASTER_ARSIP").first();
  if (byCode) return byCode;

  return knex("mst_menu")
    .where("nama_menu", "like", "%Master Arsip%")
    .orWhere("nama_menu", "like", "%Master%Arsip%")
    .first();
};

const ensureMenu = async (knex, matcher, payload) => {
  const existing = await knex("mst_menu").where(matcher).first();
  if (existing) {
    await knex("mst_menu")
      .where("id_menu", existing.id_menu)
      .update({ ...payload, updated_at: now() });
    return existing.id_menu;
  }

  const inserted = await knex("mst_menu").insert({
    ...payload,
    created_at: now(),
    updated_at: now(),
  });

  return Array.isArray(inserted) ? inserted[0] : inserted;
};

const grantMenuAccess = async (knex, id_menu, roleIds) => {
  if (!id_menu || !roleIds?.length) return;

  await knex("mst_peran_menu")
    .where("id_menu", id_menu)
    .whereIn("id_peran", roleIds)
    .del();

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

export async function up(knex) {
  const parent = await findMasterArsip(knex);
  if (!parent) {
    console.warn("Parent 'Master Arsip' not found - skipping Master Penomoran Surat menu migration.");
    return;
  }

  const idMasterArsip = parent.id_menu;
  const idPenomoranMenu = await ensureMenu(
    knex,
    (builder) => {
      builder.where("kode_menu", "MN_PENOMORAN_SURAT").orWhere("jalur_menu", "/master/korespondensi/letter_numbering");
    },
    {
      id_menu_induk: idMasterArsip,
      kode_menu: "MN_PENOMORAN_SURAT",
      nama_menu: "Master Penomoran Surat",
      jalur_menu: "/master/korespondensi/letter_numbering",
      ikon_menu: "pi pi-fw pi-sort-numeric-up",
      urutan: 7,
      status_aktif: 1,
    }
  );

  const roles = await knex("mst_peran")
    .whereIn("kode_peran", ["SUPERADMIN", "ADM", "ADMIN"])
    .select("id_peran");

  await grantMenuAccess(
    knex,
    idPenomoranMenu,
    roles.map((role) => role.id_peran).filter(Boolean)
  );

  for (const role of roles) {
    await buildAndCacheMenu(role.id_peran);
  }

  const admRole = roles[0];
  if (admRole) {
    const menuTree = await buildAndCacheMenu(admRole.id_peran);
    await knex("navigasi_pengguna")
      .insert({
        id_pengguna: 1,
        menu: JSON.stringify(menuTree),
        created_at: now(),
        updated_at: now(),
      })
      .onConflict("id_pengguna")
      .merge({ menu: JSON.stringify(menuTree), updated_at: now() });
  }
}

export async function down(knex) {
  const menu = await knex("mst_menu").where("kode_menu", "MN_PENOMORAN_SURAT").first();
  if (!menu) return;

  await knex("mst_peran_menu").where("id_menu", menu.id_menu).del();
  await knex("mst_menu").where("id_menu", menu.id_menu).del();
}
