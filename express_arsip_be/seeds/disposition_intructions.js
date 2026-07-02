/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("mst_instruksi_disposisi").insert([
    {
      kode_instruksi: "TINDAK_LANJUT",
      nama_instruksi: "Tindak Lanjut",
      deskripsi: "Menindaklanjuti surat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_instruksi: "PELAJARI",
      nama_instruksi: "Pelajari",
      deskripsi: "Mempelajari isi surat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_instruksi: "KOORDINASIKAN",
      nama_instruksi: "Koordinasikan",
      deskripsi: "Koordinasi dengan pihak terkait",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_instruksi: "ARSIPKAN",
      nama_instruksi: "Arsipkan",
      deskripsi: "Mengarsipkan surat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_instruksi: "BUAT_BALASAN",
      nama_instruksi: "Buat Balasan",
      deskripsi: "Membuat surat balasan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]).onConflict("kode_instruksi").merge();
}
