/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

export async function seed(knex) {
  await knex("mst_disposition_instructions").del();

  await knex("mst_disposition_instructions").insert([
    {
      InstructionCode: "TINDAK_LANJUT",
      InstructionName: "Tindak Lanjut",
      Description: "Menindaklanjuti surat",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      InstructionCode: "PELAJARI",
      InstructionName: "Pelajari",
      Description: "Mempelajari isi surat",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      InstructionCode: "KOORDINASIKAN",
      InstructionName: "Koordinasikan",
      Description: "Koordinasi dengan pihak terkait",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      InstructionCode: "ARSIPKAN",
      InstructionName: "Arsipkan",
      Description: "Mengarsipkan surat",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      InstructionCode: "BUAT_BALASAN",
      InstructionName: "Buat Balasan",
      Description: "Membuat surat balasan",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);
}
