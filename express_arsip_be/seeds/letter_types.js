/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  await knex("mst_letter_types").del();

  await knex("mst_letter_types").insert([
    {
      LetterTypeCode: "SURAT_TUGAS",
      LetterTypeName: "Surat Tugas",
      Direction: "outgoing",
      Description: "Jenis surat tugas",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      LetterTypeCode: "SURAT_KEPUTUSAN",
      LetterTypeName: "Surat Keputusan",
      Direction: "outgoing",
      Description: "Jenis surat keputusan",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      LetterTypeCode: "SURAT_UNDANGAN",
      LetterTypeName: "Surat Undangan",
      Direction: "both",
      Description: "Jenis surat undangan",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      LetterTypeCode: "SURAT_PERJANJIAN",
      LetterTypeName: "Surat Perjanjian",
      Direction: "both",
      Description: "Jenis surat perjanjian",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      LetterTypeCode: "SURAT_PEMBERITAHUAN",
      LetterTypeName: "Surat Pemberitahuan",
      Direction: "both",
      Description: "Jenis surat pemberitahuan",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      LetterTypeCode: "SURAT_PERMOHONAN",
      LetterTypeName: "Surat Permohonan",
      Direction: "incoming",
      Description: "Jenis surat permohonan",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);
}
