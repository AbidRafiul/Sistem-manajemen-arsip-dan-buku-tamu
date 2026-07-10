const now = () => new Date();

const hasColumns = async (knex, tableName, columns) => {
  const result = {};
  for (const column of columns) {
    result[column] = await knex.schema.hasColumn(tableName, column);
  }
  return result;
};

const withExistingColumns = (columns, data) => {
  return Object.entries(data).reduce((payload, [key, value]) => {
    if (columns[key]) payload[key] = value;
    return payload;
  }, {});
};

const findMenu = async (knex, matcher) => {
  return await knex("mst_menu")
    .select("id_menu", "kode_menu", "nama_menu")
    .where(matcher)
    .first();
};

const findParentMenu = async (knex) => {
  const byCode = await findMenu(knex, (builder) => {
    builder
      .where("kode_menu", "master_korespondensi")
      .orWhere("kode_menu", "master_correspondence")
      .orWhere("kode_menu", "master_data");
  });
  if (byCode) return byCode;

  const byLabel = await findMenu(knex, (builder) => {
    builder
      .where("nama_menu", "like", "%MASTER KORESPONDENSI%")
      .orWhere("nama_menu", "like", "%MASTER DATA%")
      .orWhere("nama_menu", "like", "%MASTER ARSIP%");
  });

  return byLabel || null;
};

const getAdminRoleIds = async (knex) => {
  if (!(await knex.schema.hasTable("mst_peran"))) return [];

  const rows = await knex("mst_peran")
    .select("id_peran")
    .where((builder) => {
      builder
        .whereIn("kode_peran", ["ADM", "ADMIN", "MASTER", "SA", "SUPERADMIN"])
        .orWhereIn("nama_peran", ["Administrator", "Admin", "admin", "master", "Superadmin"]);
    });

  return rows.map((row) => row.id_peran).filter(Boolean);
};

const ensureRoleMenu = async (knex, id_menu, roleIds) => {
  if (!(await knex.schema.hasTable("mst_peran_menu")) || !id_menu || !roleIds.length) {
    return;
  }

  const columns = await hasColumns(knex, "mst_peran_menu", [
    "id_menu",
    "id_peran",
    "hak_lihat",
    "hak_buat",
    "hak_ubah",
    "hak_hapus",
    "hak_setuju",
    "created_at",
    "updated_at",
  ]);

  for (const id_peran of roleIds) {
    const exists = await knex("mst_peran_menu")
      .where({ id_menu, id_peran })
      .first();

    if (exists) continue;

    await knex("mst_peran_menu").insert(
      withExistingColumns(columns, {
        id_menu,
        id_peran,
        hak_lihat: 1,
        hak_buat: 1,
        hak_ubah: 1,
        hak_hapus: 1,
        hak_setuju: 0,
        created_at: now(),
        updated_at: now(),
      }),
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (!(await knex.schema.hasTable("mst_menu"))) return;

  const menuColumns = await hasColumns(knex, "mst_menu", [
    "id_menu_induk",
    "kode_menu",
    "nama_menu",
    "jalur_menu",
    "ikon_menu",
    "urutan",
    "status_aktif",
    "created_at",
    "updated_at",
  ]);

  let parent = await findParentMenu(knex);

  if (!parent) {
    const parentPayload = withExistingColumns(menuColumns, {
      id_menu_induk: null,
      kode_menu: "master_korespondensi",
      nama_menu: "MASTER KORESPONDENSI",
      jalur_menu: null,
      ikon_menu: "pi pi-fw pi-envelope",
      urutan: 60,
      status_aktif: 1,
      created_at: now(),
      updated_at: now(),
    });

    const inserted = await knex("mst_menu").insert(parentPayload);
    const parentId = Array.isArray(inserted) ? inserted[0] : inserted;
    parent = { id_menu: parentId };
  }

  let letterTypeMenu = await knex("mst_menu")
    .select("id_menu")
    .where("kode_menu", "master_jenis_surat")
    .orWhere("jalur_menu", "/master/korespondensi/letter_types")
    .first();

  if (!letterTypeMenu) {
    const childPayload = withExistingColumns(menuColumns, {
      id_menu_induk: parent.id_menu,
      kode_menu: "master_jenis_surat",
      nama_menu: "Jenis Surat",
      jalur_menu: "/master/korespondensi/letter_types",
      ikon_menu: "pi pi-fw pi-tags",
      urutan: 10,
      status_aktif: 1,
      created_at: now(),
      updated_at: now(),
    });

    const inserted = await knex("mst_menu").insert(childPayload);
    const childId = Array.isArray(inserted) ? inserted[0] : inserted;
    letterTypeMenu = { id_menu: childId };
  } else {
    await knex("mst_menu")
      .where("id_menu", letterTypeMenu.id_menu)
      .update(
        withExistingColumns(menuColumns, {
          id_menu_induk: parent.id_menu,
          nama_menu: "Jenis Surat",
          jalur_menu: "/master/korespondensi/letter_types",
          ikon_menu: "pi pi-fw pi-tags",
          status_aktif: 1,
          updated_at: now(),
        }),
      );
  }

  const roleIds = await getAdminRoleIds(knex);
  await ensureRoleMenu(knex, parent.id_menu, roleIds);
  await ensureRoleMenu(knex, letterTypeMenu.id_menu, roleIds);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  if (!(await knex.schema.hasTable("mst_menu"))) return;

  const letterTypeMenu = await knex("mst_menu")
    .select("id_menu")
    .where("kode_menu", "master_jenis_surat")
    .orWhere("jalur_menu", "/master/korespondensi/letter_types")
    .first();

  if (!letterTypeMenu) return;

  if (await knex.schema.hasTable("mst_peran_menu")) {
    await knex("mst_peran_menu").where("id_menu", letterTypeMenu.id_menu).del();
  }

  await knex("mst_menu").where("id_menu", letterTypeMenu.id_menu).del();
}
