/**
 * Seeder Buku Tamu (Guestbook)
 * Menyediakan 10 data kunjungan yang bervariasi untuk kebutuhan demo dan testing.
 */
export async function seed(knex) {
  // 1. Matikan pengecekan foreign key agar pembersihan tabel berjalan aman
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 2. Bersihkan tabel kunjungan tamu
  await knex("trs_kunjungan").truncate();

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

  // 6. Masukkan 10 data kunjungan yang berbeda-beda
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
      created_at: "2026-07-03 08:00:00",
      updated_at: "2026-07-03 10:00:00"
    },
    {
      nama_tamu: "Siti Rahmawati",
      nomor_telepon: "082198765432",
      email_tamu: "siti.rahma@yahoo.com",
      instansi_tamu: "Universitas Indonesia",
      jabatan_tamu: "Dosen Peneliti",
      jenis_identitas: "ktp",
      nomor_identitas: "3174029876543210",
      id_tujuan_kunjungan: getPurposeId("MEETING"),
      id_user_host: altHostId,
      nama_host: altHostName,
      catatan_kunjungan: "Wawancara penelitian manajemen arsip daerah",
      kode_kunjungan: "TAMU0002",
      token_qr: "qr-tamu-0002",
      waktu_masuk: "2026-07-03 09:15:00",
      waktu_keluar: "2026-07-03 11:30:00",
      status: "out",
      status_persetujuan: "approved",
      created_at: "2026-07-03 09:00:00",
      updated_at: "2026-07-03 11:30:00"
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
      id_user_host: defaultHostId,
      nama_host: defaultHostName,
      catatan_kunjungan: "Wawancara kandidat staff kearsipan tingkat lanjut",
      kode_kunjungan: "TAMU0003",
      token_qr: "qr-tamu-0003",
      waktu_masuk: "2026-07-03 10:00:00",
      waktu_keluar: null,
      status: "in",
      status_persetujuan: "approved",
      created_at: "2026-07-03 09:45:00",
      updated_at: "2026-07-03 10:00:00"
    },
    {
      nama_tamu: "Rian Hidayat",
      nomor_telepon: "081399887766",
      email_tamu: "rian.h@dhl.com",
      instansi_tamu: "DHL Express",
      jabatan_tamu: "Kurir",
      jenis_identitas: "sim",
      nomor_identitas: "8912345678",
      id_tujuan_kunjungan: getPurposeId("DELIVERY"),
      id_user_host: altHostId,
      nama_host: altHostName,
      catatan_kunjungan: "Pengantaran dokumen penting dari PT Marshtech",
      kode_kunjungan: "TAMU0004",
      token_qr: "qr-tamu-0004",
      waktu_masuk: "2026-07-03 11:00:00",
      waktu_keluar: "2026-07-03 11:15:00",
      status: "out",
      status_persetujuan: "approved",
      created_at: "2026-07-03 11:00:00",
      updated_at: "2026-07-03 11:15:00"
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
      kode_kunjungan: "TAMU0005",
      token_qr: "qr-tamu-0005",
      waktu_masuk: "2026-07-03 13:00:00",
      waktu_keluar: null,
      status: "in",
      status_persetujuan: "approved",
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
      catatan_kunjungan: "Pemeliharaan rutin switch core & firewall lantai 2",
      kode_kunjungan: "TAMU0006",
      token_qr: "qr-tamu-0006",
      waktu_masuk: "2026-07-03 14:00:00",
      waktu_keluar: null,
      status: "Rencana",
      status_persetujuan: "pending",
      created_at: "2026-07-03 11:30:00",
      updated_at: "2026-07-03 11:30:00"
    },
    {
      nama_tamu: "Fanny Amelia",
      nomor_telepon: "087811223344",
      email_tamu: "fanny.amelia@gmail.com",
      instansi_tamu: "Pelamar Mandiri",
      jabatan_tamu: "Kandidat Magang",
      jenis_identitas: "ktp",
      nomor_identitas: "3172021122334455",
      id_tujuan_kunjungan: getPurposeId("INTERVIEW"),
      id_user_host: defaultHostId,
      nama_host: defaultHostName,
      catatan_kunjungan: "Wawancara magang divisi administrasi & kearsipan",
      kode_kunjungan: "TAMU0007",
      token_qr: "qr-tamu-0007",
      waktu_masuk: "2026-07-03 14:30:00",
      waktu_keluar: null,
      status: "Rencana",
      status_persetujuan: "approved",
      created_at: "2026-07-03 10:15:00",
      updated_at: "2026-07-03 10:15:00"
    },
    {
      nama_tamu: "George Harrison",
      nomor_telepon: "081299998888",
      email_tamu: "george@beatles.com",
      instansi_tamu: "Apple Corps Ltd",
      jabatan_tamu: "Director",
      jenis_identitas: "paspor",
      nomor_identitas: "A1234567B",
      id_tujuan_kunjungan: getPurposeId("MEETING"),
      id_user_host: defaultHostId,
      nama_host: defaultHostName,
      catatan_kunjungan: "Penandatanganan kontrak lisensi sistem kearsipan audio digital",
      kode_kunjungan: "TAMU0008",
      token_qr: "qr-tamu-0008",
      waktu_masuk: "2026-07-03 15:00:00",
      waktu_keluar: null,
      status: "Rencana",
      status_persetujuan: "rejected",
      catatan_persetujuan: "Jadwal host penuh, silakan reschedule ke hari senin.",
      created_at: "2026-07-03 09:30:00",
      updated_at: "2026-07-03 12:00:00"
    },
    {
      nama_tamu: "Hendra Wijaya",
      nomor_telepon: "085212341234",
      email_tamu: "hendra.w@secures.co.id",
      instansi_tamu: "PT Secure Indotama",
      jabatan_tamu: "Sales Executive",
      jenis_identitas: "ktp",
      nomor_identitas: "3273031206890002",
      id_tujuan_kunjungan: getPurposeId("MEETING"),
      id_user_host: altHostId,
      nama_host: altHostName,
      catatan_kunjungan: "Presentasi sistem keamanan CCTV termal ruang server utama",
      kode_kunjungan: "TAMU0009",
      token_qr: "qr-tamu-0009",
      waktu_masuk: "2026-07-03 15:30:00",
      waktu_keluar: null,
      status: "Rencana",
      status_persetujuan: "pending",
      created_at: "2026-07-03 13:00:00",
      updated_at: "2026-07-03 13:00:00"
    },
    {
      nama_tamu: "Iwan Fals",
      nomor_telepon: "081345674567",
      email_tamu: "iwan.fals@musisi.org",
      instansi_tamu: "Yayasan Orang Indonesia",
      jabatan_tamu: "Ketua Yayasan",
      jenis_identitas: "ktp",
      nomor_identitas: "3204121212120003",
      id_tujuan_kunjungan: getPurposeId("DELIVERY"),
      id_user_host: defaultHostId,
      nama_host: defaultHostName,
      catatan_kunjungan: "Pengambilan dokumen hibah aset secara fisik oleh ketua yayasan",
      kode_kunjungan: "TAMU0010",
      token_qr: "qr-tamu-0010",
      waktu_masuk: "2026-07-03 16:00:00",
      waktu_keluar: null,
      status: "Rencana",
      status_persetujuan: "approved",
      created_at: "2026-07-03 13:30:00",
      updated_at: "2026-07-03 13:30:00"
    }
  ];

  await knex("trs_kunjungan").insert(guests);

  // 7. Hidupkan kembali pengecekan foreign key
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  console.log("Seeder Buku Tamu (10 data variatif) berhasil dijalankan!");
}
