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
      urutan: 1,
      status_aktif: 1,
    }
  );

  const roleIds = await getAdminRoleIds(knex);
  await grantMenuAccess(knex, idSuratKeluar, roleIds);
  await grantMenuAccess(knex, idDataSuratKeluar, roleIds);

  for (const id_peran of roleIds) {
    await buildAndCacheMenu(id_peran);
  }

  console.log("Menu Surat Keluar dan Data Surat Keluar berhasil disinkronkan.");
}
