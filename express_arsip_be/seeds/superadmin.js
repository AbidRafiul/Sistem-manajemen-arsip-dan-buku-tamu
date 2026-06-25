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
  const nama_pengguna = "superadmin@admin.com";
  const nama_lengkap = "Superadmin";
  const telepon = "08100000000";
  const kata_sandi = "Superadmin321!";

  const peranId = 1;

  // 1. CARI USER LAMA (Ubah 'nama_pengguna' menjadi 'nama_pengguna')
  const existingUser = await knex("mst_pengguna")
    .where("nama_pengguna", nama_pengguna)
    .first();

  if (existingUser) {
    // Hapus relasi anak-anaknya dulu (Ubah ke nama_pengguna dan unique_id sesuai migrasi tabel)
    await knex("mst_pengguna_perans")
      .where("nama_pengguna", existingUser.nama_pengguna)
      .del();
    await knex("navigasi_pengguna")
      .where("unique_id", existingUser.nama_pengguna)
      .del();

    // Baru hapus induknya
    await knex("mst_pengguna")
      .where("nama_pengguna", existingUser.nama_pengguna)
      .del();
  }

  // Hashing kata_sandi baru
  const ckata_sandi = process.env.USER_KEY + nama_pengguna + kata_sandi;
  const dDatetime = formatDateSystem();
  const secret = process.env.USER_SECRET;
  const hashedkata_sandi = hmac(ckata_sandi, secret, "sha512");

  // 2. TANAM KE mst_pengguna & TANGKAP nama_pengguna-nya
  const [insertedNamaPengguna] = await knex("mst_pengguna").insert({
    nama_lengkap: nama_lengkap,
    nama_pengguna: nama_pengguna,
    telepon: telepon,
    kata_sandi: hashedkata_sandi,
    status: "active",
    id_cabang: 1,
    id_divisi: 1,
    id_departemen: 1, // Diperbaiki dari departemen_id menjadi id_departemen agar sesuai nama tabel mst_departemens
    id_jabatan: 1,
    mst_unit_kerja: 1,
    created_at: dDatetime,
    updated_at: dDatetime,
  });

  // 3. TANAM KE mst_pengguna_perans
  await knex("mst_pengguna_perans").insert({
    nama_pengguna: insertedNamaPengguna,
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
      nama_pengguna: insertedNamaPengguna, // Sesuai struktur tabel navigasi_pengguna yang menggunakan unique_id
      menu: oNavigation.menu,
      created_at: dDatetime,
      updated_at: dDatetime,
    });
  }
}
