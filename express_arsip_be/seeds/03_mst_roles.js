/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  await knex("mst_peran")
    .whereIn("kode_peran", [
      "ADM",
      "PMN",
      "SKR",
      "STF_ARS",
      "STF_UMM",
      "RSP",
      "AUD",
    ])
    .del();

  const dNow = new Date();

  await knex("mst_peran").insert([
    {
      kode_peran: "ADM",
      nama_peran: "Administrator",
      deskripsi: "Akses penuh sistem",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "PMN",
      nama_peran: "Pimpinan",
      deskripsi: "Approval dokumen",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "SKR",
      nama_peran: "Sekretaris",
      deskripsi: "Manajemen surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "STF_ARS",
      nama_peran: "Staff Arsip",
      deskripsi: "Digitalisasi arsip",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "STF_UMM",
      nama_peran: "Staff Umum",
      deskripsi: "Melihat buku tamu",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "RSP",
      nama_peran: "Resepsionis",
      deskripsi: "Input buku tamu",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "AUD",
      nama_peran: "Auditor",
      deskripsi: "Akses audit trail",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
};
