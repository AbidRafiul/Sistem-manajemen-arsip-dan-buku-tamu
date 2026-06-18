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
      BranchId: 1,
      BranchCode: "BR-001",
      BranchName: "Kantor Pusat",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      BranchId: 2,
      BranchCode: "BR-002",
      BranchName: "Kantor Cabang",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);

  // B. DIVISION (Divisi)
  await knex("mst_divisions").insert([
    {
      DivisionId: 1,
      BranchId: 1,
      DivisionCode: "DIV-IT",
      DivisionName: "Information Technology",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      DivisionId: 2,
      BranchId: 1,
      DivisionCode: "DIV-HR",
      DivisionName: "Human Resources",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);

  // C. DEPARTMENT (Departemen)
  await knex("mst_departments").insert([
    {
      DepartmentId: 1,
      DivisionId: 1,
      DepartmentCode: "DEPT-DEV",
      DepartmentName: "Software Development",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      DepartmentId: 2,
      DivisionId: 2,
      DepartmentCode: "DEPT-REC",
      DepartmentName: "Recruitment",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);

  // D. POSITION (Jabatan)
  await knex("mst_positions").insert([
    {
      PositionId: 1,
      PositionCode: "POS-DIR",
      PositionName: "Direktur Utama",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      PositionId: 2,
      PositionCode: "POS-MGR",
      PositionName: "Manager",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);

  // E. WORK UNIT (Unit Kerja)
  await knex("mst_work_units").insert([
    {
      WorkUnitId: 1,
      DepartmentId: 1,
      WorkUnitCode: "WU-PST",
      WorkUnitName: "Unit Pusat Utama",
      Status: "active",
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);

  console.log("Master Data berhasil di-reset dan diisi ulang!");
}
