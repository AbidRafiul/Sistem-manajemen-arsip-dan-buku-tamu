/**
 * Seeder Modul Master Arsip dan Arsip Dokumen
 * Menyediakan data master kearsipan dan transaksi arsip lengkap (dokumen, versi, peminjaman, usulan pemusnahan).
 */
export async function seed(knex) {
  // 1. Matikan pengecekan foreign key agar pembersihan aman
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // 2. Bersihkan tabel-tabel transaksi dan master terkait kearsipan
  await knex("trs_usulan_pemusnahan").truncate();
  await knex("trs_peminjaman_arsip").truncate();
  await knex("trs_versi_dokumen").truncate();
  await knex("trs_dokumen").truncate();
  await knex("mst_jadwal_retensi").truncate();
  await knex("mst_tingkat_kerahasiaan").truncate();
  await knex("mst_kategori_dokumen").truncate();
  await knex("mst_jenis_dokumen").truncate();
  await knex("mst_klasifikasi_arsip").truncate();

  const dNow = new Date();

  // 3. SEED MASTER DATA KEARSIPAN

  // A. Klasifikasi Arsip (mst_klasifikasi_arsip)
  const classifications = [
    { kode_klasifikasi: "ADM", nama_klasifikasi: "Administrasi & Tata Usaha", deskripsi: "Masalah administrasi umum", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_klasifikasi: "KEU", nama_klasifikasi: "Keuangan & Akuntansi", deskripsi: "Neraca pertanggungjawaban", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_klasifikasi: "HRD", nama_klasifikasi: "Kepegawaian / SDM", deskripsi: "Berkas kepegawaian dan CV", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_klasifikasi: "HUK", nama_klasifikasi: "Hukum & Legalitas", deskripsi: "Kontrak kerjasama hukum", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_klasifikasi: "PRD", nama_klasifikasi: "Produksi & Operasional", deskripsi: "Dokumen operasional pabrik", Status: "active", created_at: dNow, updated_at: dNow }
  ];
  await knex("mst_klasifikasi_arsip").insert(classifications);

  // B. Jenis Dokumen (mst_jenis_dokumen)
  const docTypes = [
    { kode_jenis_dokumen: "SURAT", nama_jenis_dokumen: "Surat", deskripsi: "Dokumen surat menyurat", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_jenis_dokumen: "LAPORAN", nama_jenis_dokumen: "Laporan", deskripsi: "Laporan bulanan tahunan", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_jenis_dokumen: "KONTRAK", nama_jenis_dokumen: "Kontrak & Perjanjian", deskripsi: "Kontrak kerjasama vendor", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_jenis_dokumen: "SK", nama_jenis_dokumen: "Surat Keputusan (SK)", deskripsi: "Surat keputusan direksi", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_jenis_dokumen: "SOP", nama_jenis_dokumen: "Standard Operating Procedure (SOP)", deskripsi: "Panduan operasional", Status: "active", created_at: dNow, updated_at: dNow }
  ];
  await knex("mst_jenis_dokumen").insert(docTypes);

  // C. Kategori Dokumen (mst_kategori_dokumen)
  const categories = [
    { kode_kategori_dokumen: "ADM-UMUM", nama_kategori_dokumen: "Surat Menyurat & Umum", kode_klasifikasi: "ADM", deskripsi: "Surat menyurat umum", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_kategori_dokumen: "KEU-LAP", nama_kategori_dokumen: "Laporan Keuangan Tahunan", kode_klasifikasi: "KEU", deskripsi: "Laporan keuangan audit", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_kategori_dokumen: "HRD-CV", nama_kategori_dokumen: "Riwayat Hidup & Lamaran", kode_klasifikasi: "HRD", deskripsi: "CV dan data lamaran", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_kategori_dokumen: "HUK-AGR", nama_kategori_dokumen: "Perjanjian Kerjasama (PKS)", kode_klasifikasi: "HUK", deskripsi: "PKS pihak luar", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_kategori_dokumen: "PRD-SOP", nama_kategori_dokumen: "SOP Produksi Lantai 1", kode_klasifikasi: "PRD", deskripsi: "Panduan mesin produksi", Status: "active", created_at: dNow, updated_at: dNow }
  ];
  await knex("mst_kategori_dokumen").insert(categories);

  // D. Tingkat Kerahasiaan (mst_tingkat_kerahasiaan)
  const confidentialities = [
    { kode_tingkat_kerahasiaan: "PUB", nama_tingkat_kerahasiaan: "Publik / Terbuka", tingkat_kerahasiaan: 1, deskripsi: "Akses terbuka umum", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_tingkat_kerahasiaan: "INT", nama_tingkat_kerahasiaan: "Internal Kantor", tingkat_kerahasiaan: 2, deskripsi: "Internal organisasi", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_tingkat_kerahasiaan: "RHS", nama_tingkat_kerahasiaan: "Rahasia", tingkat_kerahasiaan: 3, deskripsi: "Akses terbatas", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_tingkat_kerahasiaan: "SRHS", nama_tingkat_kerahasiaan: "Sangat Rahasia", tingkat_kerahasiaan: 4, deskripsi: "Dokumen sangat rahasia", Status: "active", created_at: dNow, updated_at: dNow }
  ];
  await knex("mst_tingkat_kerahasiaan").insert(confidentialities);

  // E. Jadwal Retensi (mst_jadwal_retensi)
  const retentions = [
    { kode_retensi: "RET-ADM-05", kode_kategori_dokumen: "ADM-UMUM", nama_retensi: "Retensi ADM 5 Tahun", tahun_retensi: 5, tindakan_retensi: "review", deskripsi: "Review adm 5 tahun", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_retensi: "RET-KEU-10", kode_kategori_dokumen: "KEU-LAP", nama_retensi: "Retensi KEU 10 Tahun", tahun_retensi: 10, tindakan_retensi: "destroy", deskripsi: "Musnah keu 10 tahun", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_retensi: "RET-HRD-03", kode_kategori_dokumen: "HRD-CV", nama_retensi: "Retensi HRD 3 Tahun", tahun_retensi: 3, tindakan_retensi: "destroy", deskripsi: "Musnah hrd 3 tahun", Status: "active", created_at: dNow, updated_at: dNow },
    { kode_retensi: "RET-HUK-20", kode_kategori_dokumen: "HUK-AGR", nama_retensi: "Retensi HUK 20 Tahun", tahun_retensi: 20, tindakan_retensi: "review", deskripsi: "Review hukum 20 tahun", Status: "active", created_at: dNow, updated_at: dNow }
  ];
  await knex("mst_jadwal_retensi").insert(retentions);

  // 4. SEED TRANSAKSI ARSIP DOKUMEN (trs_dokumen) - 10 Data Lengkap & Variatif

  const docs = [
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-ADM-2026-001",
      kode_klasifikasi: "ADM",
      kode_jenis_dokumen: "SURAT",
      kode_kategori_dokumen: "ADM-UMUM",
      kode_tingkat_kerahasiaan: "INT",
      kode_retensi: "RET-ADM-05",
      lokasi_fisik: "Rak A / Baris 1 / Box 101",
      qr_code: "QR-DOC-ADM-001",
      nama_dokumen: "Surat Tugas Monitoring Sistem Informasi Terintegrasi",
      nomor_dokumen: "021/ST-IT/VII/2026",
      tanggal: "2026-07-01",
      tanggal_kedaluwarsa: "2031-07-01",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-KEU-2026-002",
      kode_klasifikasi: "KEU",
      kode_jenis_dokumen: "LAPORAN",
      kode_kategori_dokumen: "KEU-LAP",
      kode_tingkat_kerahasiaan: "RHS",
      kode_retensi: "RET-KEU-10",
      lokasi_fisik: "Rak B / Baris 2 / Box 201",
      qr_code: "QR-DOC-KEU-002",
      nama_dokumen: "Laporan Keuangan Audit Semester I 2026",
      nomor_dokumen: "LAP-KEU/2026/AUD-01",
      tanggal: "2026-06-30",
      tanggal_kedaluwarsa: "2036-06-30",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-HRD-2026-003",
      kode_klasifikasi: "HRD",
      kode_jenis_dokumen: "SK",
      kode_kategori_dokumen: "HRD-CV",
      kode_tingkat_kerahasiaan: "RHS",
      kode_retensi: "RET-HRD-03",
      lokasi_fisik: "Rak C / Baris 1 / Box 301",
      qr_code: "QR-DOC-HRD-003",
      nama_dokumen: "Surat Keputusan Direksi tentang Pengangkatan Karyawan Tetap",
      nomor_dokumen: "SK-DIR/HRD/2026/045",
      tanggal: "2026-07-02",
      tanggal_kedaluwarsa: "2029-07-02",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-HUK-2026-004",
      kode_klasifikasi: "HUK",
      kode_jenis_dokumen: "KONTRAK",
      kode_kategori_dokumen: "HUK-AGR",
      kode_tingkat_kerahasiaan: "RHS",
      kode_retensi: "RET-HUK-20",
      lokasi_fisik: "Bangkas Utama / Slot Legal",
      qr_code: "QR-DOC-HUK-004",
      nama_dokumen: "Perjanjian Kerjasama Penyediaan Layanan Cloud PT Marshtech",
      nomor_dokumen: "049/PKS/LGL/VII/2026",
      tanggal: "2026-07-03",
      tanggal_kedaluwarsa: "2046-07-03",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-PRD-2026-005",
      kode_klasifikasi: "PRD",
      kode_jenis_dokumen: "SOP",
      kode_kategori_dokumen: "PRD-SOP",
      kode_tingkat_kerahasiaan: "INT",
      kode_retensi: "RET-ADM-05",
      lokasi_fisik: "Locker Operasional Produksi",
      qr_code: "QR-DOC-PRD-005",
      nama_dokumen: "SOP Keselamatan Kerja Dan Penggunaan Alat Berat",
      nomor_dokumen: "SOP-OPS/K3/2026/01",
      tanggal: "2026-05-12",
      tanggal_kedaluwarsa: "2031-05-12",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-ADM-2026-006",
      kode_klasifikasi: "ADM",
      kode_jenis_dokumen: "SURAT",
      kode_kategori_dokumen: "ADM-UMUM",
      kode_tingkat_kerahasiaan: "PUB",
      kode_retensi: "RET-ADM-05",
      lokasi_fisik: "Rak A / Baris 2 / Box 102",
      qr_code: "QR-DOC-ADM-006",
      nama_dokumen: "Surat Edaran Libur Nasional Hari Kemerdekaan RI",
      nomor_dokumen: "099/SE/HRD/VIII/2026",
      tanggal: "2020-07-03",
      tanggal_kedaluwarsa: "2025-07-03",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-KEU-2026-007",
      kode_klasifikasi: "KEU",
      kode_jenis_dokumen: "LAPORAN",
      kode_kategori_dokumen: "KEU-LAP",
      kode_tingkat_kerahasiaan: "RHS",
      kode_retensi: "RET-KEU-10",
      lokasi_fisik: "Rak B / Baris 1 / Box 202",
      qr_code: "QR-DOC-KEU-007",
      nama_dokumen: "Kwitansi Dan Invoice Pembelian Server Baru",
      nomor_dokumen: "INV-9801/PRCH/VII/2026",
      tanggal: "2015-07-02",
      tanggal_kedaluwarsa: "2025-07-02",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-HRD-2026-008",
      kode_klasifikasi: "HRD",
      kode_jenis_dokumen: "SK",
      kode_kategori_dokumen: "HRD-CV",
      kode_tingkat_kerahasiaan: "RHS",
      kode_retensi: "RET-HRD-03",
      lokasi_fisik: "Rak C / Baris 2 / Box 302",
      qr_code: "QR-DOC-HRD-008",
      nama_dokumen: "Berkas Seleksi Calon Staff Keuangan Terpilih",
      nomor_dokumen: "BS-KEU/2026/001",
      tanggal: "2022-06-25",
      tanggal_kedaluwarsa: "2025-06-25",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-HUK-2026-009",
      kode_klasifikasi: "HUK",
      kode_jenis_dokumen: "KONTRAK",
      kode_kategori_dokumen: "HUK-AGR",
      kode_tingkat_kerahasiaan: "SRHS",
      kode_retensi: "RET-HUK-20",
      lokasi_fisik: "Bangkas Utama / Slot Rahasia",
      qr_code: "QR-DOC-HUK-009",
      nama_dokumen: "Perjanjian Kerahasiaan (Non-Disclosure Agreement) Project X",
      nomor_dokumen: "NDA-001/PRJ-X/LGL/2026",
      tanggal: "2026-07-01",
      tanggal_kedaluwarsa: "2046-07-01",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    },
    {
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-PRD-2026-010",
      kode_klasifikasi: "PRD",
      kode_jenis_dokumen: "LAPORAN",
      kode_kategori_dokumen: "PRD-SOP",
      kode_tingkat_kerahasiaan: "INT",
      kode_retensi: "RET-ADM-05",
      lokasi_fisik: "Locker Operasional Utama",
      qr_code: "QR-DOC-PRD-010",
      nama_dokumen: "Berita Acara Kerusakan & Perbaikan Mesin Produksi 1",
      nomor_dokumen: "BA-PRD/MAINT/2026/012",
      tanggal: "2020-07-02",
      tanggal_kedaluwarsa: "2025-07-02",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow
    }
  ];
  await knex("trs_dokumen").insert(docs);

  // 5. SEED VERSI DOKUMEN (trs_versi_dokumen) - Setiap dokumen butuh versi awal (v1)

  const versions = [
    { id_versi: 1001, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-ADM-2026-001", nomor_versi: 1, catatan_perubahan: "Versi awal (Draft Masukan)", file_path: "uploads/documents/st_monitoring_v1.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Disetujui untuk digunakan", created_at: dNow, updated_at: dNow },
    { id_versi: 1002, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-ADM-2026-001", nomor_versi: 2, catatan_perubahan: "Versi 2.0 (Revisi Nama PIC & Ttd Direksi)", file_path: "uploads/documents/st_monitoring_v2_final.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Versi final disetujui", created_at: dNow, updated_at: dNow },
    { id_versi: 1003, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-KEU-2026-002", nomor_versi: 1, catatan_perubahan: "Versi awal hasil audit KAP", file_path: "uploads/documents/lap_keu_semester1_v1.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Dokumen sah", created_at: dNow, updated_at: dNow },
    { id_versi: 1004, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-HRD-2026-003", nomor_versi: 1, catatan_perubahan: "SK Pengangkatan (Ttd Direksi)", file_path: "uploads/documents/sk_karyawan_tetap.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Disetujui", created_at: dNow, updated_at: dNow },
    { id_versi: 1005, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-HUK-2026-004", nomor_versi: 1, catatan_perubahan: "MoU & PKS Final Cloud Service", file_path: "uploads/documents/pks_cloud_marshtech.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Disetujui legalitas", created_at: dNow, updated_at: dNow },
    { id_versi: 1006, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-PRD-2026-005", nomor_versi: 1, catatan_perubahan: "SOP K3 Versi 1.0", file_path: "uploads/documents/sop_k3_v1.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Siap disosialisasikan", created_at: dNow, updated_at: dNow },
    { id_versi: 1007, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-ADM-2026-006", nomor_versi: 1, catatan_perubahan: "Surat edaran resmi libur", file_path: "uploads/documents/se_libur_nasional.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Siap siar", created_at: dNow, updated_at: dNow },
    { id_versi: 1008, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-KEU-2026-007", nomor_versi: 1, catatan_perubahan: "Kwitansi dan bukti bayar server", file_path: "uploads/documents/invoice_server_dell.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Bukti terlampir lengkap", created_at: dNow, updated_at: dNow },
    { id_versi: 1009, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-HRD-2026-008", nomor_versi: 1, catatan_perubahan: "Data wawancara seleksi", file_path: "uploads/documents/seleksi_staff_keu.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Dokumen pelamar tersimpan", created_at: dNow, updated_at: dNow },
    { id_versi: 1010, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-HUK-2026-009", nomor_versi: 1, catatan_perubahan: "NDA Project X (Tertanda)", file_path: "uploads/documents/nda_project_x.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Disetujui", created_at: dNow, updated_at: dNow },
    { id_versi: 1011, tanggal_transaksi: "2026-07-03", kode_dokumen: "DOC-PRD-2026-010", nomor_versi: 1, catatan_perubahan: "Berita acara maintenance utama", file_path: "uploads/documents/ba_maintenance_mesin1.pdf", diunggah_oleh: "staff.arsip@example.local", status_persetujuan: "approved", disetujui_oleh: "superadmin@admin.com", disetujui_pada: dNow, catatan_persetujuan: "Valid", created_at: dNow, updated_at: dNow }
  ];
  await knex("trs_versi_dokumen").insert(versions);

  // 6. SEED PEMINJAMAN ARSIP (trs_peminjaman_arsip) - Beberapa data peminjaman dinamis

  const loans = [
    {
      id_peminjaman: 2001,
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-ADM-2026-001",
      nama_peminjam: "Ahmad Dahlan",
      tanggal_pinjam: "2026-07-01",
      tanggal_pengembalian: "2026-07-08",
      keperluan: "Pemeriksaan lampiran instruksi tim monitoring luar",
      disetujui_oleh: "superadmin@admin.com",
      disetujui_pada: "2026-07-01 10:00:00",
      catatan_persetujuan: "Disetujui, jaga kerahasiaan berkas.",
      terlambat: 0,
      status: "borrowed",
      created_at: dNow,
      updated_at: dNow
    },
    {
      id_peminjaman: 2002,
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-KEU-2026-002",
      nama_peminjam: "Siti Badriah",
      tanggal_pinjam: "2026-06-25",
      tanggal_pengembalian: "2026-07-02",
      keperluan: "Referensi perbandingan neraca anggaran",
      disetujui_oleh: "superadmin@admin.com",
      disetujui_pada: "2026-06-25 09:00:00",
      catatan_persetujuan: "Sudah dikembalikan sesuai waktu.",
      terlambat: 0,
      status: "returned",
      created_at: dNow,
      updated_at: dNow
    },
    {
      id_peminjaman: 2003,
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-HUK-2026-004",
      nama_peminjam: "Farhan Hakim",
      tanggal_pinjam: "2026-07-03",
      tanggal_pengembalian: "2026-07-10",
      keperluan: "Penyusunan addendum perjanjian cloud",
      disetujui_oleh: "superadmin@admin.com",
      disetujui_pada: "2026-07-03 13:00:00",
      catatan_persetujuan: "Disetujui untuk perpanjangan legalitas.",
      terlambat: 0,
      status: "approved",
      created_at: dNow,
      updated_at: dNow
    }
  ];
  await knex("trs_peminjaman_arsip").insert(loans);

  // 7. SEED USULAN PEMUSNAHAN (trs_usulan_pemusnahan) - Berkas retensi yang diusulkan musnah

  const destructions = [
    {
      id_usulan: 3001,
      tanggal_transaksi: "2026-07-03",
      kode_dokumen: "DOC-HRD-2026-008",
      alasan_usulan: "Masa berlaku data rekrutmen sudah lewat 3 tahun sesuai JRA kepegawaian",
      kode_retensi: "RET-HRD-03",
      diusulkan_oleh: "staff.arsip@example.local",
      diusulkan_pada: dNow,
      status: "submitted",
      created_at: dNow,
      updated_at: dNow
    }
  ];
  await knex("trs_usulan_pemusnahan").insert(destructions);

  // 8. Hidupkan kembali foreign key checks
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");

  console.log("Seeder Master Arsip dan Transaksi Arsip Dokumen berhasil dijalankan!");
}
