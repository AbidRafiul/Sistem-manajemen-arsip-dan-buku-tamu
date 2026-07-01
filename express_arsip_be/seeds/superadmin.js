import crypto from "crypto";

// 1. Definisikan fungsi hmac agar tidak error "not defined"
function hmac(data, key, algorithm = "sha512") {
  return crypto.createHmac(algorithm, key).update(data).digest("hex");
}

// 2. Definisikan fungsi formatDateSystem untuk format tanggal MariaDB
function formatDateSystem() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export async function seed(knex) {
  const id_pengguna = "1";
  const nama_lengkap = "Superadmin";
  const telepon = "08100000000";
  const kata_sandi = "Superadmin321!";

  const peranId = 1;

  // 1. CARI USER LAMA (Ubah 'id_pengguna' menjadi 'id_pengguna')
  const existingUser = await knex("mst_pengguna")
    .where("id_pengguna", id_pengguna)
    .first();

  if (existingUser) {
    // Hapus relasi anak-anaknya dulu (Ubah ke id_pengguna dan id_pengguna sesuai migrasi tabel)
    await knex("mst_pengguna_peran")
      .where("id_pengguna", existingUser.id_pengguna)
      .del();
    await knex("navigasi_pengguna")
      .where("id_pengguna", existingUser.id_pengguna)
      .del();

    // Baru hapus induknya
    await knex("mst_pengguna")
      .where("id_pengguna", existingUser.id_pengguna)
      .del();
  }

  // Hashing kata_sandi baru
  const ckata_sandi = process.env.USER_KEY + "superadmin@admin.com" + kata_sandi;
  const dDatetime = formatDateSystem();
  const secret = process.env.USER_SECRET;
  const hashedkata_sandi = hmac(ckata_sandi, secret, "sha512");

  // 2. TANAM KE mst_pengguna & TANGKAP id_pengguna-nya
  const [insertedNamaPengguna] = await knex("mst_pengguna").insert({
    nama_lengkap: nama_lengkap,
    nama_pengguna: 'superadmin@admin.com',
    surel: 'superadmin@admin.com',
    id_pengguna: id_pengguna,
    telepon: telepon,
    kata_sandi: hashedkata_sandi,
    status: "active",
    id_cabang: 1,
    id_divisi: 1,
    id_departemen: 1, // Diperbaiki dari departemen_id menjadi id_departemen agar sesuai nama tabel mst_departemen
    id_jabatan: 1,
    id_unit_kerja: 1,
    created_at: dDatetime,
    updated_at: dDatetime,
  });

  // 3. TANAM KE mst_pengguna_peran
  await knex("mst_pengguna_peran").insert({
    id_pengguna: insertedNamaPengguna,
    id_peran: peranId,
    peran_utama: 1,
    status: "active",
    created_at: dDatetime,
    updated_at: dDatetime,
  });

  // 4. TANAM KE navigasi_pengguna (Ubah 'peran' menjadi 'peran' & 'Menu' menjadi 'menu')
  const oNavigation = await knex("mst_navigasi")
    .where("peran", "Master")
    .first();

  if (oNavigation) {
    await knex("navigasi_pengguna").insert({
      id_pengguna: insertedNamaPengguna, // Sesuai struktur tabel navigasi_pengguna yang menggunakan id_pengguna
      menu: oNavigation.menu,
      created_at: dDatetime,
      updated_at: dDatetime,
    });
  }
}
