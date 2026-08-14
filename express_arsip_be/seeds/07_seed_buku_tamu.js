/**
 * Seeder Buku Tamu (Guestbook)
 * Menyediakan 10 data kunjungan yang bervariasi untuk kebutuhan demo dan testing.
 */
export async function seed(knex) {
  // 1. Matikan pengecekan foreign key agar pembersihan tabel berjalan aman
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 2. Bersihkan tabel kunjungan tamu
  await knex("trx_kunjungan").truncate();

  // 3. Pastikan tujuan kunjungan (mst_tujuan_kunjungan) yang umum sudah tersedia
  const purposes = [
    { kode_tujuan_kunjungan: "MEETING", nama_tujuan_kunjungan: "Meeting / Pertemuan Kerja", deskripsi: "Rapat atau diskusi pekerjaan", status: "active" },
    { kode_tujuan_kunjungan: "INTERVIEW", nama_tujuan_kunjungan: "Interview / Wawancara", deskripsi: "Proses seleksi karyawan baru", status: "active" },
    { kode_tujuan_kunjungan: "MAINTENANCE", nama_tujuan_kunjungan: "Perbaikan / Maintenance", deskripsi: "Pemeliharaan gedung atau sistem IT", status: "active" },
    { kode_tujuan_kunjungan: "DELIVERY", nama_tujuan_kunjungan: "Pengantaran / Kurir", deskripsi: "Pengiriman barang atau dokumen", status: "active" },
    { kode_tujuan_kunjungan: "AUDIT", nama_tujuan_kunjungan: "Audit / Pemeriksaan", deskripsi: "Audit internal maupun eksternal", status: "active" },
  ];

  for (const purpose of purposes) {
    const exists = await knex("mst_tujuan_kunjungan")
      .where("kode_tujuan_kunjungan", purpose.kode_tujuan_kunjungan)
      .first();
    if (!exists) {
      await knex("mst_tujuan_kunjungan").insert({
        ...purpose,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  // 4. Ambil host user dari tabel mst_pengguna untuk dihubungkan secara dinamis
  const hostUsers = await knex("mst_pengguna")
    .select("id_pengguna", "nama_lengkap")
    .limit(2);

  const defaultHostId = hostUsers[0]?.id_pengguna || 1;
  const defaultHostName = hostUsers[0]?.nama_lengkap || "Superadmin";
  const altHostId = hostUsers[1]?.id_pengguna || defaultHostId;
  const altHostName = hostUsers[1]?.nama_lengkap || defaultHostName;

  // 5. Petakan ID tujuan kunjungan
  const listPurposes = await knex("mst_tujuan_kunjungan")
    .select("id_tujuan_kunjungan", "kode_tujuan_kunjungan");
    
  const getPurposeId = (code) => {
    const found = listPurposes.find(p => p.kode_tujuan_kunjungan === code);
    return found ? found.id_tujuan_kunjungan : 1;
  };

  // 6. Masukkan 4 data kunjungan (1 per cabang utama) yang bervariasi
  const guests = [
    {
      nama_tamu: "Andika Pratama",
      nomor_telepon: "081234567891",
      email_tamu: "andika.pratama@gmail.com",
      instansi_tamu: "PT Telkom Indonesia",
      jabatan_tamu: "Account Manager",
      jenis_identitas: "ktp",
      nomor_identitas: "3273011234567890",
      id_tujuan_kunjungan: getPurposeId("MEETING"),
      id_user_host: defaultHostId,
      nama_host: defaultHostName,
      catatan_kunjungan: "Diskusi kerjasama jaringan internet kantor pusat",
      kode_kunjungan: "TAMU0001",
      token_qr: "qr-tamu-0001",
      waktu_masuk: "2026-07-03 08:30:00",
      waktu_keluar: "2026-07-03 10:00:00",
      status: "out",
      status_persetujuan: "approved",
      id_cabang: 1, // Pusat Jakarta
      created_at: "2026-07-03 08:00:00",
      updated_at: "2026-07-03 10:00:00"
    },
    {
      nama_tamu: "Bambang Wijaya",
      nomor_telepon: "085712345678",
      email_tamu: "bambang.w@sinarmas.com",
      instansi_tamu: "PT Sinar Mas",
      jabatan_tamu: "HR Specialist",
      jenis_identitas: "sim",
      nomor_identitas: "9807123456",
      id_tujuan_kunjungan: getPurposeId("INTERVIEW"),
      id_user_host: altHostId,
      nama_host: altHostName,
      catatan_kunjungan: "Wawancara kandidat staff kearsipan",
      kode_kunjungan: "TAMU0002",
      token_qr: "qr-tamu-0002",
      waktu_masuk: "2026-07-03 10:00:00",
      waktu_keluar: null,
      status: "in",
      status_persetujuan: "approved",
      id_cabang: 2, // Pusat Surabaya
      created_at: "2026-07-03 09:45:00",
      updated_at: "2026-07-03 10:00:00"
    },
    {
      nama_tamu: "Diana Lestari",
      nomor_telepon: "089612348765",
      email_tamu: "diana.lestari@ojk.go.id",
      instansi_tamu: "Otoritas Jasa Keuangan",
      jabatan_tamu: "Auditor Utama",
      jenis_identitas: "ktp",
      nomor_identitas: "3273024567890001",
      id_tujuan_kunjungan: getPurposeId("AUDIT"),
      id_user_host: defaultHostId,
      nama_host: defaultHostName,
      catatan_kunjungan: "Audit tahunan kepatuhan arsip dokumen keuangan",
      kode_kunjungan: "TAMU0003",
      token_qr: "qr-tamu-0003",
      waktu_masuk: "2026-07-03 13:00:00",
      waktu_keluar: null,
      status: "in",
      status_persetujuan: "approved",
      id_cabang: 3, // Cabang Madiun
      created_at: "2026-07-03 12:30:00",
      updated_at: "2026-07-03 13:00:00"
    },
    {
      nama_tamu: "Eko Prasetyo",
      nomor_telepon: "081122334455",
      email_tamu: "eko.p@cisco.com",
      instansi_tamu: "PT Cisco Systems",
      jabatan_tamu: "Network Engineer",
      jenis_identitas: "sim",
      nomor_identitas: "9511223344",
      id_tujuan_kunjungan: getPurposeId("MAINTENANCE"),
      id_user_host: altHostId,
      nama_host: altHostName,
      catatan_kunjungan: "Pemeliharaan rutin switch core & firewall",
      kode_kunjungan: "TAMU0004",
      token_qr: "qr-tamu-0004",
      waktu_masuk: null,
      waktu_keluar: null,
      status: "Rencana",
      status_persetujuan: "pending",
      id_cabang: 4, // Unit Kecamatan Madiun
      created_at: "2026-07-03 11:30:00",
      updated_at: "2026-07-03 11:30:00"
    }
  ];

  await knex("trx_kunjungan").insert(guests);

  // 7. Hidupkan kembali pengecekan foreign key
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  console.log("Seeder Buku Tamu (4 data per cabang) berhasil dijalankan!");
}

