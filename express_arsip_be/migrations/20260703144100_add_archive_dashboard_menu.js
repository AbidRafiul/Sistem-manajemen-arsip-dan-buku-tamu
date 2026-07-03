/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Tambah menu Dashboard Arsip (id_menu: 35) under ARSIP DOKUMEN (id_menu_induk: 10)
  const menuExists = await knex("mst_menu").where("id_menu", 35).first();
  if (!menuExists) {
    await knex("mst_menu").insert({
      id_menu: 35,
      id_menu_induk: 10,
      kode_menu: "EDMS_DASHBOARD",
      nama_menu: "Dashboard Arsip",
      jalur_menu: "/edms/dashboard",
      ikon_menu: "pi pi-fw pi-chart-bar",
      urutan: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // 2. Beri hak akses (hak_lihat, hak_buat, hak_ubah, hak_hapus, hak_setuju)
  // ke peran Superadmin (id_peran: 1) dan Staff Arsip (id_peran: 130)
  const rolesToGrant = [1, 130];
  for (const roleId of rolesToGrant) {
    const permExists = await knex("mst_peran_menu")
      .where({ id_peran: roleId, id_menu: 35 })
      .first();
    if (!permExists) {
      await knex("mst_peran_menu").insert({
        id_peran: roleId,
        id_menu: 35,
        hak_lihat: 1,
        hak_buat: 1,
        hak_ubah: 1,
        hak_hapus: 1,
        hak_setuju: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
  }

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // Hapus hak akses
  await knex("mst_peran_menu").where("id_menu", 35).del();

  // Hapus menu
  await knex("mst_menu").where("id_menu", 35).del();

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
