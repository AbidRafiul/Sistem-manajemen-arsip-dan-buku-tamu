export async function seed(knex) {
  // 1. MATIKAN Cek Foreign Key (Biar bisa menghapus tanpa dilarang MySQL)
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 2. BERSIHKAN TABEL (Bumi hangus & reset ID kembali ke 1)
  await knex("mst_departemen").truncate();
  await knex("mst_divisi").truncate();
  await knex("mst_cabang").truncate();
  await knex("mst_jabatan").truncate();
  await knex("mst_unit_kerja").truncate();
  await knex("mst_pengguna").truncate(); // Kosongin user juga biar bersih total
  await knex("mst_pengguna_peran").truncate();
  await knex("navigasi_pengguna").truncate();
  await knex("user_credential").truncate();

  // 3. HIDUPKAN kembali Foreign Key Check
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  // 4. MASUKKAN DATA MASTER DARI NOL (HIERARKI)

  // A. BRANCH (Cabang)
  await knex("mst_cabang").insert([
    {
      id_cabang: 1,
      kode_cabang: "BR-001",
      nama_cabang: "Kantor Pusat",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id_cabang: 2,
      kode_cabang: "BR-002",
      nama_cabang: "Kantor Cabang",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // B. DIVISION (Divisi)
  await knex("mst_divisi").insert([
    {
      id_divisi: 1,
      id_cabang: 1,
      kode_divisi: "DIV-IT",
      nama_divisi: "Information Technology",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id_divisi: 2,
      id_cabang: 1,
      kode_divisi: "DIV-HR",
      nama_divisi: "Human Resources",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // C. DEPARTMENT (Departemen)
  await knex("mst_departemen").insert([
    {
      id_departemen: 1,
      id_divisi: 1,
      kode_departemen: "DEPT-DEV",
      nama_departemen: "Software Development",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id_departemen: 2,
      id_divisi: 2,
      kode_departemen: "DEPT-REC",
      nama_departemen: "Recruitment",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // D. POSITION (Jabatan)
  await knex("mst_jabatan").insert([
    {
      id_jabatan: 1,
      kode_jabatan: "POS-DIR",
      nama_jabatan: "Direktur Utama",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id_jabatan: 2,
      kode_jabatan: "POS-MGR",
      nama_jabatan: "Manager",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // E. WORK UNIT (Unit Kerja)
  await knex("mst_unit_kerja").insert([
    {
      id_unit_kerja: 1,
      id_departemen: 1,
      kode_unit_kerja: "WU-PST",
      nama_unit_kerja: "Unit Pusat Utama",
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log("Master Data berhasil di-reset dan diisi ulang!");
}
