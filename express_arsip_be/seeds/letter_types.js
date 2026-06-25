/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("mst_letter_types").del();

  await knex("mst_letter_types").insert([
    {
      letter_type_code: "SURAT_TUGAS",
      letter_type_name: "Surat Tugas",
      direction: "outgoing",
      deskripsi: "Jenis surat tugas",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      letter_type_code: "SURAT_KEPUTUSAN",
      letter_type_name: "Surat Keputusan",
      direction: "outgoing",
      deskripsi: "Jenis surat keputusan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      letter_type_code: "SURAT_UNDANGAN",
      letter_type_name: "Surat Undangan",
      direction: "both",
      deskripsi: "Jenis surat undangan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      letter_type_code: "SURAT_PERJANJIAN",
      letter_type_name: "Surat Perjanjian",
      direction: "both",
      deskripsi: "Jenis surat perjanjian",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      letter_type_code: "SURAT_PEMBERITAHUAN",
      letter_type_name: "Surat Pemberitahuan",
      direction: "both",
      deskripsi: "Jenis surat pemberitahuan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      letter_type_code: "SURAT_PERMOHONAN",
      letter_type_name: "Surat Permohonan",
      direction: "incoming",
      deskripsi: "Jenis surat permohonan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
