export async function seed(knex) {
  // 1. MATIKAN Cek Foreign Key (Biar bisa menghapus tanpa dilarang MySQL)
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 2. BERSIHKAN TABEL (Bumi hangus & reset ID kembali ke 1)
  await knex("mst_departments").truncate();
  await knex("mst_divisions").truncate();
  await knex("mst_branches").truncate();
  await knex("mst_positions").truncate();
  await knex("mst_work_units").truncate();
  await knex("mst_users").truncate(); // Kosongin user juga biar bersih total
  await knex("mst_user_roles").truncate();
  await knex("user_navigation").truncate();
  await knex("mst_users").truncate();
  await knex('user_credential').truncate();

  // 3. HIDUPKAN kembali Foreign Key Check
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  // 4. MASUKKAN DATA MASTER DARI NOL (HIERARKI)

  // A. BRANCH (Cabang)
  await knex("mst_branches").insert([
    {
      branch_id: 1,
      branch_code: "BR-001",
      branch_name: "Kantor Pusat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      branch_id: 2,
      branch_code: "BR-002",
      branch_name: "Kantor Cabang",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // B. DIVISION (Divisi)
  await knex("mst_divisions").insert([
    {
      division_id: 1,
      branch_id: 1,
      division_code: "DIV-IT",
      division_name: "Information Technology",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      division_id: 2,
      branch_id: 1,
      division_code: "DIV-HR",
      division_name: "Human Resources",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // C. DEPARTMENT (Departemen)
  await knex("mst_departments").insert([
    {
      department_id: 1,
      division_id: 1,
      department_code: "DEPT-DEV",
      department_name: "Software Development",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      department_id: 2,
      division_id: 2,
      department_code: "DEPT-REC",
      department_name: "Recruitment",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // D. POSITION (Jabatan)
  await knex("mst_positions").insert([
    {
      position_id: 1,
      position_code: "POS-DIR",
      position_name: "Direktur Utama",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      position_id: 2,
      position_code: "POS-MGR",
      position_name: "Manager",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // E. WORK UNIT (Unit Kerja)
  await knex("mst_work_units").insert([
    {
      work_unit_id: 1,
      department_id: 1,
      work_unit_code: "WU-PST",
      work_unit_name: "Unit Pusat Utama",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log("Master Data berhasil di-reset dan diisi ulang!");
}
