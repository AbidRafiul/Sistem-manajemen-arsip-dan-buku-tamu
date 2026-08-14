import { buildAndCacheMenu } from "../routes/v1/components/tools/menu_builder.js";

const now = () => new Date();

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

const grantMenuAccess = async (knex, id_menu, roleIds, hakSetuju = 0) => {
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
      hak_buat: hakSetuju ? 1 : 0,
      hak_ubah: hakSetuju ? 1 : 0,
      hak_hapus: 0,
      hak_setuju: hakSetuju ? 1 : 0,
      created_at: now(),
      updated_at: now(),
    }))
  );
};

const getRoleIds = async (knex, kodePeranList) => {
  const roles = await knex("mst_peran")
    .whereIn("kode_peran", kodePeranList)
    .select("id_peran");

  return roles.map((role) => role.id_peran).filter(Boolean);
};

export async function seed(knex) {
  const suratKeluar = await knex("mst_menu")
    .whereIn("kode_menu", ["SURAT_KELUAR", "MN_SURAT_KELUAR"])
    .first();

  if (!suratKeluar) {
    throw new Error("Menu Surat Keluar belum ditemukan untuk seed TTE.");
  }

  const idTte = await ensureMenu(
    knex,
    (builder) => {
      builder
        .where("kode_menu", "SK_TTE")
        .orWhere("jalur_menu", "/correspondence/outgoing_letter/tte");
    },
    {
      id_menu_induk: suratKeluar.id_menu,
      kode_menu: "SK_TTE",
      nama_menu: "Tanda Tangan Elektronik",
      jalur_menu: "/correspondence/outgoing_letter/tte",
      ikon_menu: "pi pi-fw pi-sign-in",
      urutan: 4,
      status_aktif: 1,
    }
  );



  const idSigned = await ensureMenu(
    knex,
    (builder) => {
      builder
        .where("kode_menu", "SK_TTE_SIGNED")
        .orWhere("jalur_menu", "/correspondence/outgoing_letter/tte/signed");
    },
    {
      id_menu_induk: idTte,
      kode_menu: "SK_TTE_SIGNED",
      nama_menu: "Dokumen Tertandatangani",
      jalur_menu: "/correspondence/outgoing_letter/tte/signed",
      ikon_menu: "pi pi-fw pi-check-circle",
      urutan: 1,
      status_aktif: 1,
    }
  );



  const adminRoleIds = await getRoleIds(knex, ["SUPERADMIN", "ADM", "ADMIN"]);
  const pmanRoleIds = await getRoleIds(knex, ["PMN"]);
  const skrRoleIds = await getRoleIds(knex, ["SKR"]);

  const operatorRoleIds = Array.from(new Set([...adminRoleIds, ...pmanRoleIds, ...skrRoleIds]));
  const adminOnlyRoleIds = Array.from(new Set([...adminRoleIds]));

  await grantMenuAccess(knex, idTte, operatorRoleIds, 0);
  await grantMenuAccess(knex, idSigned, operatorRoleIds, 0);

  const affectedRoleIds = Array.from(
    new Set([...operatorRoleIds, ...adminOnlyRoleIds]),
  );

  for (const idPeran of affectedRoleIds) {
    await buildAndCacheMenu(idPeran);
  }

  const admRole = await knex("mst_peran").where("kode_peran", "ADM").first();
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
      .merge({
        menu: JSON.stringify(menuTree),
        updated_at: now(),
      });
  }
}
