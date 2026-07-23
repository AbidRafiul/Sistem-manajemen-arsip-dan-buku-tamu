/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (await knex.schema.hasTable("mst_riwayat_audit")) {
    const hasUsername = await knex.schema.hasColumn("mst_riwayat_audit", "username");
    const hasNamaPengguna = await knex.schema.hasColumn("mst_riwayat_audit", "nama_pengguna");
    const hasRole = await knex.schema.hasColumn("mst_riwayat_audit", "role");
    const hasPeran = await knex.schema.hasColumn("mst_riwayat_audit", "peran");

    await knex.schema.alterTable("mst_riwayat_audit", (table) => {
      if (hasUsername && !hasNamaPengguna) {
        table.renameColumn("username", "nama_pengguna");
      }
      if (hasRole && !hasPeran) {
        table.renameColumn("role", "peran");
      }
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  if (await knex.schema.hasTable("mst_riwayat_audit")) {
    const hasNamaPengguna = await knex.schema.hasColumn("mst_riwayat_audit", "nama_pengguna");
    const hasUsername = await knex.schema.hasColumn("mst_riwayat_audit", "username");
    const hasPeran = await knex.schema.hasColumn("mst_riwayat_audit", "peran");
    const hasRole = await knex.schema.hasColumn("mst_riwayat_audit", "role");

    await knex.schema.alterTable("mst_riwayat_audit", (table) => {
      if (hasNamaPengguna && !hasUsername) {
        table.renameColumn("nama_pengguna", "username");
      }
      if (hasPeran && !hasRole) {
        table.renameColumn("peran", "role");
      }
    });
  }
}
