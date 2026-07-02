/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("mst_jenis_surat").insert([
    {
      kode_jenis_surat: "SURAT_TUGAS",
      nama_jenis_surat: "Surat Tugas",
      arah_surat: "outgoing",
      deskripsi: "Jenis surat tugas",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_jenis_surat: "SURAT_KEPUTUSAN",
      nama_jenis_surat: "Surat Keputusan",
      arah_surat: "outgoing",
      deskripsi: "Jenis surat keputusan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_jenis_surat: "SURAT_UNDANGAN",
      nama_jenis_surat: "Surat Undangan",
      arah_surat: "both",
      deskripsi: "Jenis surat undangan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_jenis_surat: "SURAT_PERJANJIAN",
      nama_jenis_surat: "Surat Perjanjian",
      arah_surat: "both",
      deskripsi: "Jenis surat perjanjian",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_jenis_surat: "SURAT_PEMBERITAHUAN",
      nama_jenis_surat: "Surat Pemberitahuan",
      arah_surat: "both",
      deskripsi: "Jenis surat pemberitahuan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      kode_jenis_surat: "SURAT_PERMOHONAN",
      nama_jenis_surat: "Surat Permohonan",
      arah_surat: "incoming",
      deskripsi: "Jenis surat permohonan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]).onConflict("kode_jenis_surat").merge();
}
