import { hmac } from "../routes/v1/components/tools/general.js";

const now = () => new Date();

const upsertRows = async (knex, tableName, keyColumn, rows) => {
  if (!(await knex.schema.hasTable(tableName))) return;

  const columns = await knex(tableName).columnInfo();

  for (const row of rows) {
    const payload = Object.fromEntries(
      Object.entries(row).filter(([column]) => columns[column]),
    );

    if (payload[keyColumn] === undefined || payload[keyColumn] === null) {
      throw new Error(
        `Kolom kunci ${tableName}.${keyColumn} tidak ditemukan pada payload seed`,
      );
    }

    await knex(tableName)
      .insert(payload)
      .onConflict(keyColumn)
      .merge(payload);
  }
};

const insertIfMissing = async (knex, tableName, keyColumn, row) => {
  const exists = await knex(tableName)
    .where(keyColumn, row[keyColumn])
    .first();

  if (!exists) await knex(tableName).insert(row);
};

const seedUserRole = async (knex, userId, roleId, dNow) => {
  const existing = await knex("mst_pengguna_peran")
    .where("id_pengguna", userId)
    .first();
  const payload = {
    id_pengguna: userId,
    id_peran: roleId,
    peran_utama: 1,
    status: "active",
    updated_at: dNow,
  };

  if (existing) {
    await knex("mst_pengguna_peran")
      .where("id_peran_pengguna", existing.id_peran_pengguna)
      .update(payload);
  } else {
    await knex("mst_pengguna_peran").insert({
      ...payload,
      created_at: dNow,
    });
  }
};

const hashPassword = (username, password) => {
  const userKey = process.env.USER_KEY || "random";
  const userSecret = process.env.USER_SECRET || "random";
  return hmac(`${userKey}${username}${password}`, userSecret, "sha512");
};

const menu = JSON.stringify([
  {
    label: "HOME",
    items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" }],
  },
  {
    label: "EDMS",
    items: [
      {
        label: "Archive Documents",
        icon: "pi pi-fw pi-folder",
        to: "/edms/archive_document",
      },
      {
        label: "Archive Loans",
        icon: "pi pi-fw pi-book",
        to: "/edms/archive_loan",
      },
    ],
  },
  {
    label: "CORRESPONDENCE",
    items: [
      {
        label: "Mail In",
        icon: "pi pi-fw pi-envelope",
        to: "/correspondence/mail_in",
      },
      {
        label: "Mail Data",
        icon: "pi pi-fw pi-table",
        to: "/correspondence/mail_in/data",
      },
    ],
  },
]);

export async function seed(knex) {
  const dNow = now();

  await upsertRows(knex, "mst_cabang", "kode_cabang", [
    {
      kode_cabang: "BR-PST",
      nama_cabang: "Kantor Pusat Demo",
      alamat: "Jl. Merdeka No. 1",
      telepon: "0215550101",
      surel: "pusat@example.local",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const branch = await knex("mst_cabang")
    .where("kode_cabang", "BR-PST")
    .first();

  await upsertRows(knex, "mst_divisi", "kode_divisi", [
    {
      id_cabang: branch.id_cabang,
      kode_divisi: "DIV-OPS",
      nama_divisi: "Operasional",
      deskripsi: "Operasional kantor",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_cabang: branch.id_cabang,
      kode_divisi: "DIV-DEMO-IT",
      nama_divisi: "Teknologi",
      deskripsi: "Teknologi informasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const division = await knex("mst_divisi")
    .where("kode_divisi", "DIV-OPS")
    .first();

  await upsertRows(knex, "mst_departemen", "kode_departemen", [
    {
      id_divisi: division.id_divisi,
      kode_departemen: "DEP-ARSIP",
      nama_departemen: "Arsip dan Tata Usaha",
      deskripsi: "Unit arsip dan administrasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const department = await knex("mst_departemen")
    .where("kode_departemen", "DEP-ARSIP")
    .first();

  await upsertRows(knex, "mst_positions", "kode_jabatan", [
    {
      kode_jabatan: "POS-STF",
      nama_jabatan: "Staff",
      tingkat_jabatan: 3,
      deskripsi: "Staff operasional",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const position = await knex("mst_positions")
    .where("kode_jabatan", "POS-STF")
    .first();

  await upsertRows(knex, "mst_unit_kerja", "kode_unit_kerja", [
    {
      id_departemen: department.id_departemen,
      kode_unit_kerja: "WU-ARSIP",
      nama_unit_kerja: "Unit Arsip",
      deskripsi: "Pengelolaan arsip",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const workUnit = await knex("mst_unit_kerja")
    .where("kode_unit_kerja", "WU-ARSIP")
    .first();

  await upsertRows(knex, "mst_klasifikasi_arsip", "kode_klasifikasi", [
    {
      kode_klasifikasi: "ADM",
      nama_klasifikasi: "Administrasi",
      deskripsi: "Arsip administrasi",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_klasifikasi: "KEU",
      nama_klasifikasi: "Keuangan",
      deskripsi: "Arsip keuangan",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await upsertRows(knex, "mst_jenis_dokumen", "kode_jenis_dokumen", [
    {
      kode_jenis_dokumen: "SURAT",
      nama_jenis_dokumen: "Surat",
      deskripsi: "Dokumen surat",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_jenis_dokumen: "LAPORAN",
      nama_jenis_dokumen: "Laporan",
      deskripsi: "Dokumen laporan",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await upsertRows(knex, "mst_kategori_dokumen", "kode_kategori_dokumen", [
    {
      kode_kategori_dokumen: "ADM-UMUM",
      nama_kategori_dokumen: "Administrasi Umum",
      kode_klasifikasi: "ADM",
      deskripsi: "Administrasi umum",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_kategori_dokumen: "KEU-LAP",
      nama_kategori_dokumen: "Laporan Keuangan",
      kode_klasifikasi: "KEU",
      deskripsi: "Laporan keuangan",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await upsertRows(
    knex,
    "mst_tingkat_kerahasiaan",
    "kode_tingkat_kerahasiaan",
    [
      {
        kode_tingkat_kerahasiaan: "INT",
        nama_tingkat_kerahasiaan: "Internal",
        tingkat_kerahasiaan: 2,
        deskripsi: "Internal organisasi",
        Status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        kode_tingkat_kerahasiaan: "RHS",
        nama_tingkat_kerahasiaan: "Rahasia",
        tingkat_kerahasiaan: 3,
        deskripsi: "Akses terbatas",
        Status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ],
  );

  await upsertRows(knex, "mst_jadwal_retensi", "kode_retensi", [
    {
      kode_retensi: "RET-ADM-05",
      kode_kategori_dokumen: "ADM-UMUM",
      nama_retensi: "Retensi 5 Tahun",
      tahun_retensi: 5,
      tindakan_retensi: "review",
      deskripsi: "Evaluasi 5 tahun",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_retensi: "RET-KEU-10",
      kode_kategori_dokumen: "KEU-LAP",
      nama_retensi: "Retensi 10 Tahun",
      tahun_retensi: 10,
      tindakan_retensi: "destroy",
      deskripsi: "Musnah 10 tahun",
      Status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await upsertRows(knex, "mst_jenis_surat", "kode_jenis_surat", [
    {
      kode_jenis_surat: "SURAT_MASUK",
      nama_jenis_surat: "Surat Masuk",
      arah_surat: "incoming",
      deskripsi: "Surat masuk umum",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  await upsertRows(knex, "mst_instruksi_disposisi", "kode_instruksi", [
    {
      kode_instruksi: "TINDAK_LANJUT",
      nama_instruksi: "Tindak Lanjut",
      deskripsi: "Menindaklanjuti surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await upsertRows(knex, "mst_tujuan_kunjungan", "kode_tujuan_kunjungan", [
    {
      kode_tujuan_kunjungan: "MEETING",
      nama_tujuan_kunjungan: "Meeting",
      deskripsi: "Pertemuan kerja",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const adminRole = await knex("mst_peran")
    .where("kode_peran", "ADM")
    .first();
  const staffRole = await knex("mst_peran")
    .where("kode_peran", "STF_ARS")
    .first();

  await upsertRows(knex, "mst_pengguna", "nama_pengguna", [
    {
      nama_lengkap: "Superadmin SIAB",
      nama_pengguna: "superadmin@admin.com",
      surel: "superadmin@admin.com",
      telepon: "08100000000",
      kata_sandi: hashPassword("superadmin@admin.com", "Superadmin321!"),
      id_cabang: branch.id_cabang,
      id_divisi: division.id_divisi,
      id_departemen: department.id_departemen,
      id_jabatan: position.id_jabatan,
      id_unit_kerja: workUnit.id_unit_kerja,
      gagal_masuk: 0,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      nama_lengkap: "Staff Arsip Demo",
      nama_pengguna: "staff.arsip@example.local",
      surel: "staff.arsip@example.local",
      telepon: "08100000001",
      kata_sandi: hashPassword("staff.arsip@example.local", "Password123!"),
      id_cabang: branch.id_cabang,
      id_divisi: division.id_divisi,
      id_departemen: department.id_departemen,
      id_jabatan: position.id_jabatan,
      id_unit_kerja: workUnit.id_unit_kerja,
      gagal_masuk: 0,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const superadmin = await knex("mst_pengguna")
    .where("nama_pengguna", "superadmin@admin.com")
    .first();
  const staff = await knex("mst_pengguna")
    .where("nama_pengguna", "staff.arsip@example.local")
    .first();

  await seedUserRole(knex, superadmin.id_pengguna, adminRole.id_peran, dNow);
  await seedUserRole(
    knex,
    staff.id_pengguna,
    staffRole?.id_peran || adminRole.id_peran,
    dNow,
  );

  await insertIfMissing(knex, "mst_navigasi", "peran", {
    peran: "Staff Arsip",
    menu,
    created_at: dNow,
  });
  await insertIfMissing(knex, "user_navigation", "id_pengguna", {
    id_pengguna: staff.id_pengguna,
    menu,
    created_at: dNow,
    updated_at: dNow,
  });

  await upsertRows(knex, "trs_dokumen", "kode_dokumen", [
    {
      tanggal_transaksi: "2026-06-18",
      kode_dokumen: "DOC-ADM-2026-001",
      kode_klasifikasi: "ADM",
      kode_jenis_dokumen: "SURAT",
      kode_kategori_dokumen: "ADM-UMUM",
      kode_tingkat_kerahasiaan: "INT",
      kode_retensi: "RET-ADM-05",
      lokasi_fisik: "Rak A / Box 01",
      qr_code: "DOC-QR-ADM-001",
      tags: "administrasi,internal,surat",
      nama_dokumen: "Surat Keputusan Internal",
      nomor_dokumen: "DOC-ADM-2026-001",
      tanggal: "2026-06-01",
      tanggal_kedaluwarsa: "2031-06-01",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      tanggal_transaksi: "2026-06-18",
      kode_dokumen: "DOC-KEU-2026-001",
      kode_klasifikasi: "KEU",
      kode_jenis_dokumen: "LAPORAN",
      kode_kategori_dokumen: "KEU-LAP",
      kode_tingkat_kerahasiaan: "RHS",
      kode_retensi: "RET-KEU-10",
      lokasi_fisik: "Rak B / Box 02",
      qr_code: "DOC-QR-KEU-001",
      tags: "keuangan,laporan,rahasia",
      nama_dokumen: "Laporan Keuangan Tahunan",
      nomor_dokumen: "DOC-KEU-2026-001",
      tanggal: "2026-06-10",
      tanggal_kedaluwarsa: "2036-06-10",
      nama_pic: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await upsertRows(knex, "trs_versi_dokumen", "id_versi", [
    {
      id_versi: 9001,
      tanggal_transaksi: "2026-06-18",
      kode_dokumen: "DOC-ADM-2026-001",
      nomor_versi: 1,
      catatan_perubahan: "Versi awal dokumen",
      file_path: "demo/documents/DOC-ADM-2026-001-v1.pdf",
      diunggah_oleh: "staff.arsip@example.local",
      status_persetujuan: "approved",
      disetujui_oleh: "superadmin@admin.com",
      disetujui_pada: dNow,
      catatan_persetujuan: "Data demo disetujui",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  await upsertRows(knex, "trs_peminjaman_arsip", "id_peminjaman", [
    {
      id_peminjaman: 9001,
      tanggal_transaksi: "2026-06-18",
      kode_dokumen: "DOC-ADM-2026-001",
      nama_peminjam: "Budi Santoso",
      tanggal_pinjam: "2026-06-18",
      tanggal_pengembalian: "2026-06-25",
      keperluan: "Referensi audit internal",
      disetujui_oleh: "superadmin@admin.com",
      disetujui_pada: dNow,
      catatan_persetujuan: "Disetujui untuk audit",
      terlambat: 0,
      status: "borrowed",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  await upsertRows(knex, "trs_usulan_pemusnahan", "id_usulan", [
    {
      id_usulan: 9001,
      tanggal_transaksi: "2026-06-18",
      kode_dokumen: "DOC-KEU-2026-001",
      alasan_usulan: "Contoh proposal pemusnahan data demo",
      kode_retensi: "RET-KEU-10",
      diusulkan_oleh: "staff.arsip@example.local",
      diusulkan_pada: dNow,
      status: "submitted",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const letterType = await knex("mst_jenis_surat")
    .where("kode_jenis_surat", "SURAT_MASUK")
    .first();
  const documentType = await knex("mst_jenis_dokumen")
    .where("kode_jenis_dokumen", "SURAT")
    .first();
  const classification = await knex("mst_klasifikasi_arsip")
    .where("kode_klasifikasi", "ADM")
    .first();
  const confidentiality = await knex("mst_tingkat_kerahasiaan")
    .where("kode_tingkat_kerahasiaan", "INT")
    .first();
  const instruction = await knex("mst_instruksi_disposisi")
    .where("kode_instruksi", "TINDAK_LANJUT")
    .first();

  await upsertRows(knex, "trs_surat_masuk", "nomor_agenda", [
    {
      nomor_agenda: "AG-2026-001",
      nomor_surat: "EXT/001/VI/2026",
      tanggal_surat: "2026-06-17",
      tanggal_diterima: "2026-06-18",
      nama_pengirim: "PT Contoh Nusantara",
      instansi_pengirim: "PT Contoh Nusantara",
      perihal: "Permohonan kerja sama arsip digital",
      keterangan_lampiran: "1 berkas proposal",
      jenis_surat_id: letterType.jenis_surat_id,
      jenis_dokumen_id: documentType.id_jenis_dokumen,
      klasifikasi_arsip_id: classification.id_klasifikasi,
      tingkat_kerahasiaan_id: confidentiality.id_tingkat_kerahasiaan,
      status: "didisposisi",
      created_by: superadmin.id_pengguna,
      updated_by: superadmin.id_pengguna,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  const incoming = await knex("trs_surat_masuk")
    .where("nomor_agenda", "AG-2026-001")
    .first();

  await upsertRows(knex, "trs_disposisi_surat", "disposisi_surat_id", [
    {
      disposisi_surat_id: 9001,
      surat_masuk_id: incoming.surat_masuk_id,
      dari_pengguna_id: superadmin.id_pengguna,
      kepada_pengguna_id: staff.id_pengguna,
      instruksi_disposisi_id: instruction.instruksi_disposisi_id,
      instruksi: "Tindak lanjuti dan arsipkan dokumen",
      catatan_disposisi: "Data demo disposisi",
      batas_waktu: "2026-06-24",
      status: "baru",
      created_by: superadmin.id_pengguna,
      updated_by: superadmin.id_pengguna,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  await upsertRows(knex, "trs_file_surat_masuk", "file_surat_masuk_id", [
    {
      file_surat_masuk_id: 9001,
      surat_masuk_id: incoming.surat_masuk_id,
      path_file: "demo/incoming/AG-2026-001.pdf",
      nama_file: "AG-2026-001.pdf",
      tipe_mime_file: "application/pdf",
      ukuran_file: 102400,
      tanggal_upload: "2026-06-18",
      uploaded_by: superadmin.id_pengguna,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);
  await upsertRows(
    knex,
    "trs_tracking_surat_masuk",
    "tracking_surat_masuk_id",
    [
      {
        tracking_surat_masuk_id: 9001,
        surat_masuk_id: incoming.surat_masuk_id,
        disposisi_surat_id: 9001,
        nama_aksi: "Disposisi dibuat",
        dari_pengguna_id: superadmin.id_pengguna,
        kepada_pengguna_id: staff.id_pengguna,
        status_sebelumnya: "baru",
        status_saat_ini: "didisposisi",
        catatan: "Tracking demo",
        processed_at: dNow,
        created_by: superadmin.id_pengguna,
        created_at: dNow,
        updated_at: dNow,
      },
    ],
  );

  await upsertRows(knex, "trs_kunjungan", "kode_kunjungan", [
    {
      nama_tamu: "Andi Wijaya",
      nomor_telepon: "081234567890",
      email_tamu: "andi@example.local",
      instansi_tamu: "PT Contoh Nusantara",
      jabatan_tamu: "Manager",
      jenis_identitas: "ktp",
      nomor_identitas: "3200000000000001",
      waktu_masuk: dNow,
      status: "in",
      id_user_host: String(staff.id_pengguna),
      nama_host: "Staff Arsip Demo",
      catatan_kunjungan: "Meeting arsip digital",
      kode_kunjungan: "VIS-2026-001",
      token_qr: "QR-VIS-2026-001",
      status_persetujuan: "approved",
      id_user: staff.id_pengguna,
      id_tujuan_kunjungan: 1,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  console.log("Full demo data berhasil diisi dan aman dijalankan ulang.");
}
