/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("mst_disposition_instructions").del();

  await knex("mst_disposition_instructions").insert([
    {
      instruction_code: "TINDAK_LANJUT",
      instruction_name: "Tindak Lanjut",
      description: "Menindaklanjuti surat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      instruction_code: "PELAJARI",
      instruction_name: "Pelajari",
      description: "Mempelajari isi surat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      instruction_code: "KOORDINASIKAN",
      instruction_name: "Koordinasikan",
      description: "Koordinasi dengan pihak terkait",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      instruction_code: "ARSIPKAN",
      instruction_name: "Arsipkan",
      description: "Mengarsipkan surat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      instruction_code: "BUAT_BALASAN",
      instruction_name: "Buat Balasan",
      description: "Membuat surat balasan",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
