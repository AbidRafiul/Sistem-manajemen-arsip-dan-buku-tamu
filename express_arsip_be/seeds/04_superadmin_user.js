import {
  hmac,
  formatDateSystem,
} from "../routes/v1/components/tools/general.js";

export async function seed(knex) {
  // 1. Matikan Foreign Key check
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  const dNow = new Date();
  const cDatetime = formatDateSystem();

  // 2. Pastikan Master Data Organisasi Lengkap (Department, Position, WorkUnit)
  // Branch & Division sudah diisi di 01_master_data.js (id_cabang: 1, id_divisi: 1)

  await knex("mst_departemens")
    .insert([
      {
        id_departemen: 1,
        id_divisi: 1,
        department_code: "DEPT-IT",
        department_name: "IT Department",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ])
    .onConflict("id_departemen")
    .ignore();

  await knex("mst_jabatan")
    .insert([
      {
        id_jabatan: 1,
        kode_jabatan: "POS-DIR",
        nama_jabatan: "Direktur Utama",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ])
    .onConflict("id_jabatan")
    .ignore();

  await knex("mst_unit_kerja")
    .insert([
      {
        mst_unit_kerja: 1,
        id_departemen: 1,
        kode_unit_kerja: "WU-DIR",
        work_unit_name: "Direktorat Utama",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ])
    .onConflict("mst_unit_kerja")
    .ignore();

  // 3. Hapus data superadmin lama jika ada
  await knex("mst_pengguna_perans").where("nama_pengguna", 1).del();
  await knex("mst_pengguna")
    .where("nama_pengguna", "superadmin@admin.com")
    .del();

  const nama_pengguna = "superadmin@admin.com";
  const kata_sandiClear = "Superadmin321!";

  const ckata_sandi = process.env.USER_KEY + nama_pengguna + kata_sandiClear;
  const secret = process.env.USER_SECRET;
  const hashedkata_sandi = hmac(ckata_sandi, secret, "sha512");

  // 4. Masukkan Superadmin ke `mst_pengguna` (Sistem Baru SIAB)
  const [NamaPengguna] = await knex("mst_pengguna").insert([
    {
      nama_pengguna: 1,
      nama_lengkap: "Superadmin SIAB",
      nama_pengguna: nama_pengguna,
      surel: nama_pengguna,
      telepon: "08100000000",
      kata_sandi: hashedkata_sandi,
      id_cabang: 1,
      id_divisi: 1,
      id_departemen: 1,
      id_jabatan: 1,
      mst_unit_kerja: 1,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  // 5. Masukkan peran Superadmin ke `mst_pengguna_perans`
  // Asumsi peranId 1 adalah ADM dari 03_mst_perans.js
  const peranAdmin = await knex("mst_perans")
    .where("kode_peran", "ADM")
    .first();
  if (peranAdmin) {
    await knex("mst_pengguna_perans").insert([
      {
        nama_pengguna: 1,
        id_peran: peranAdmin.id_peran,
        peran_utama: 1,
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ]);
  }

  // 6. Masukkan Superadmin ke `navigasi_pengguna`
  const oNavigation = await knex("mst_navigasi")
    .where("peran", "master")
    .first();
  if (oNavigation) {
    await knex("navigasi_pengguna")
      .insert({
        nama_pengguna: 1,
        menu: oNavigation.menu,
        created_at: dNow,
        updated_at: dNow,
      })
      .onConflict("nama_pengguna")
      .merge({
        menu: oNavigation.menu,
        updated_at: dNow,
      });
  }

  // 7. Hidupkan Foreign Key check
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
