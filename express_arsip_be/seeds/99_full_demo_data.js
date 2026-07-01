import { hmac } from "../routes/v1/components/tools/general.js";

const now = () => new Date();

const hasTable = (knex, tableName) => knex.schema.hasTable(tableName);

const hasColumn = async (knex, tableName, columnName) => {
  if (!(await hasTable(knex, tableName))) {
    return false;
  }

  return knex.schema.hasColumn(tableName, columnName);
};

const existingColumns = async (knex, tableName, columns) => {
  const checks = await Promise.all(
    columns.map(async (column) => [
      column,
      await hasColumn(knex, tableName, column),
    ]),
  );

  return new Set(
    checks.filter(([, exists]) => exists).map(([column]) => column),
  );
};

const pickExisting = (row, columns) => {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => columns.has(key)),
  );
};

const seedRows = async (knex, tableName, keyColumn, rows) => {
  if (!(await hasTable(knex, tableName))) {
    return;
  }

  const allColumns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const columns = await existingColumns(knex, tableName, allColumns);

  for (const row of rows) {
    const payload = pickExisting(row, columns);
    if (!payload[keyColumn]) {
      continue;
    }

    const exists = await knex(tableName)
      .where(keyColumn, payload[keyColumn])
      .first();
    if (exists) {
      const updatePayload = { ...payload };
      if (columns.has("updated_at")) {
        updatePayload.updated_at = payload.updated_at || now();
      }

      await knex(tableName)
        .where(keyColumn, payload[keyColumn])
        .update(updatePayload);
    } else {
      await knex(tableName).insert(payload);
    }
  }
};

const hashkata_sandi = (nama_pengguna, kata_sandi) => {
  const userKey = process.env.USER_KEY || "random";
  const userSecret = process.env.USER_SECRET || "random";
  return hmac(`${userKey}${nama_pengguna}${kata_sandi}`, userSecret, "sha512");
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
  {
    label: "BUKU TAMU",
    items: [
      {
        label: "Registrasi",
        icon: "pi pi-fw pi-user-plus",
        to: "/buku_tamu/registrasi",
      },
      {
        label: "Monitoring",
        icon: "pi pi-fw pi-desktop",
        to: "/buku_tamu/monitoring",
      },
      {
        label: "Checkout",
        icon: "pi pi-fw pi-sign-out",
        to: "/buku_tamu/checkout",
      },
    ],
  },
  {
    label: "SETUP",
    items: [
      { label: "Users", icon: "pi pi-fw pi-users", to: "/setup/users" },
      { label: "Config", icon: "pi pi-fw pi-wrench", to: "/setup/config" },
    ],
  },
]);

export async function seed(knex) {
  const dNow = now();

  await seedRows(knex, "mst_peran", "kode_peran", [
    {
      kode_peran: "ADM",
      nama_peran: "Administrator",
      deskripsi: "Akses penuh sistem",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "PMN",
      nama_peran: "Pimpinan",
      deskripsi: "Approval dan monitoring",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "SKR",
      nama_peran: "Sekretaris",
      deskripsi: "Kelola surat masuk",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "STF_ARS",
      nama_peran: "Staff Arsip",
      deskripsi: "Kelola arsip digital",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_peran: "RSP",
      nama_peran: "Resepsionis",
      deskripsi: "Kelola buku tamu",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_cabang", "kode_cabang", [
    {
      kode_cabang: "BR-PST",
      nama_cabang: "Kantor Pusat",
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

  await seedRows(knex, "mst_divisi", "kode_divisi", [
    {
      id_cabang: branch?.id_cabang || 1,
      kode_divisi: "DIV-OPS",
      nama_divisi: "Operasional",
      deskripsi: "Operasional kantor",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_cabang: branch?.id_cabang || 1,
      kode_divisi: "DIV-IT",
      nama_divisi: "Teknologi",
      deskripsi: "Teknologi informasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const divOps = await knex("mst_divisi")
    .where("kode_divisi", "DIV-OPS")
    .first();
  const divIt = await knex("mst_divisi").where("kode_divisi", "DIV-IT").first();

  await seedRows(knex, "mst_departemen", "kode_departemen", [
    {
      id_divisi: divOps?.id_divisi || 1,
      kode_departemen: "DEP-ARSIP",
      nama_departemen: "Arsip dan Tata Usaha",
      deskripsi: "Unit arsip dan administrasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_divisi: divIt?.id_divisi || 2,
      kode_departemen: "DEP-IT",
      nama_departemen: "IT Support",
      deskripsi: "Dukungan sistem",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_jabatan", "kode_jabatan", [
    {
      kode_jabatan: "POS-DIR",
      nama_jabatan: "Direktur",
      tingkat_jabatan: 1,
      deskripsi: "Pimpinan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      kode_jabatan: "POS-MGR",
      nama_jabatan: "Manager",
      tingkat_jabatan: 2,
      deskripsi: "Manager unit",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
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

  const depArsip = await knex("mst_departemen")
    .where("kode_departemen", "DEP-ARSIP")
    .first();

  await seedRows(knex, "mst_unit_kerja", "kode_unit_kerja", [
    {
      id_departemen: depArsip?.id_departemen || 1,
      kode_unit_kerja: "WU-ARSIP",
      nama_unit_kerja: "Unit Arsip",
      deskripsi: "Pengelolaan arsip",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_archive_classifications", "classification_code", [
    {
      classification_code: "ADM",
      classification_name: "Administrasi",
      deskripsi: "Arsip administrasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      classification_code: "KEU",
      classification_name: "Keuangan",
      deskripsi: "Arsip keuangan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      classification_code: "HRD",
      classification_name: "SDM",
      deskripsi: "Arsip SDM",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_document_type", "document_type_code", [
    {
      document_type_code: "SURAT",
      document_type_name: "Surat",
      deskripsi: "Dokumen surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      document_type_code: "KONTRAK",
      document_type_name: "Kontrak",
      deskripsi: "Dokumen kontrak",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      document_type_code: "LAPORAN",
      document_type_name: "Laporan",
      deskripsi: "Dokumen laporan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  if (!(await hasTable(knex, 'mst_archive_classifications'))) return;
  const adm = await knex("mst_archive_classifications")
    .where("classification_code", "ADM")
    .first();
  const keu = await knex("mst_archive_classifications")
    .where("classification_code", "KEU")
    .first();

  await seedRows(knex, "mst_document_categories", "document_category_code", [
    {
      archive_classification_id: adm?.archive_classification_id || 1,
      document_category_code: "ADM-UMUM",
      document_category_name: "Administrasi Umum",
      deskripsi: "Dokumen administrasi umum",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      archive_classification_id: keu?.archive_classification_id || 2,
      document_category_code: "KEU-LAP",
      document_category_name: "Laporan Keuangan",
      deskripsi: "Dokumen laporan keuangan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(
    knex,
    "mst_confidentiality_levels",
    "confidentiality_level_code",
    [
      {
        confidentiality_level_code: "PUB",
        confidentiality_level_name: "Publik",
        confidentiality_level: 1,
        deskripsi: "Dapat diakses umum",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        confidentiality_level_code: "INT",
        confidentiality_level_name: "Internal",
        confidentiality_level: 2,
        deskripsi: "Internal organisasi",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        confidentiality_level_code: "RHS",
        confidentiality_level_name: "Rahasia",
        confidentiality_level: 3,
        deskripsi: "Terbatas",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
    ],
  );

  const catAdm = await knex("mst_document_categories")
    .where("document_category_code", "ADM-UMUM")
    .first();
  const catKeu = await knex("mst_document_categories")
    .where("document_category_code", "KEU-LAP")
    .first();

  await seedRows(knex, "mst_retention_schedule", "retention_code", [
    {
      document_category_id: catAdm?.document_category_id || 1,
      retention_code: "RET-ADM-05",
      retention_name: "Retensi 5 Tahun",
      retention_years: 5,
      retention_action: "review",
      deskripsi: "Evaluasi setelah 5 tahun",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      document_category_id: catKeu?.document_category_id || 2,
      retention_code: "RET-KEU-10",
      retention_name: "Retensi 10 Tahun",
      retention_years: 10,
      retention_action: "destroy",
      deskripsi: "Musnah setelah 10 tahun",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_letter_types", "letter_type_code", [
    {
      letter_type_code: "SURAT_MASUK",
      letter_type_name: "Surat Masuk",
      direction: "incoming",
      deskripsi: "Surat masuk umum",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      letter_type_code: "SURAT_UNDANGAN",
      letter_type_name: "Surat Undangan",
      direction: "both",
      deskripsi: "Surat undangan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_disposition_instructions", "instruction_code", [
    {
      instruction_code: "TINDAK_LANJUT",
      instruction_name: "Tindak Lanjut",
      deskripsi: "Menindaklanjuti surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      instruction_code: "ARSIPKAN",
      instruction_name: "Arsipkan",
      deskripsi: "Mengarsipkan surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_visit_purpose", "VisitPurposeCode", [
    {
      VisitPurposeId: 1,
      VisitPurposeCode: "MEETING",
      VisitPurposeName: "Meeting",
      deskripsi: "Pertemuan kerja",
      status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    },
    {
      VisitPurposeId: 2,
      VisitPurposeCode: "DELIVERY",
      VisitPurposeName: "Pengiriman",
      deskripsi: "Pengiriman dokumen/barang",
      status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    },
  ]);

  const position = await knex("mst_jabatan")
    .where("kode_jabatan", "POS-STF")
    .first();
  const workUnit = await knex("mst_unit_kerja")
    .where("kode_unit_kerja", "WU-ARSIP")
    .first();
  const peranAdm = await knex("mst_peran").where("kode_peran", "ADM").first();
  const peranStaff = await knex("mst_peran")
    .where("kode_peran", "STF_ARS")
    .first();

  await seedRows(knex, "mst_pengguna", "nama_pengguna", [
    {
      nama_lengkap: "Superadmin SIAB",
      nama_pengguna: "superadmin@admin.com",
      surel: "superadmin@admin.com",
      telepon: "08100000000",
      kata_sandi: hashkata_sandi("superadmin@admin.com", "Superadmin321!"),
      id_cabang: branch?.id_cabang || 1,
      id_divisi: divOps?.id_divisi || 1,
      id_departemen: depArsip?.id_departemen || 1,
      id_jabatan: position?.id_jabatan || 1,
      id_unit_kerja: workUnit?.id_unit_kerja || 1,
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
      kata_sandi: hashkata_sandi("staff.arsip@example.local", "kata_sandi123!"),
      id_cabang: branch?.id_cabang || 1,
      id_divisi: divOps?.id_divisi || 1,
      id_departemen: depArsip?.id_departemen || 1,
      id_jabatan: position?.id_jabatan || 1,
      id_unit_kerja: workUnit?.id_unit_kerja || 1,
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

  await seedRows(knex, "mst_pengguna_peran", "id_peran_pengguna", [
    {
      id_peran_pengguna: 9001,
      nama_pengguna: superadmin?.nama_pengguna || 1,
      id_peran: peranAdm?.id_peran || 1,
      peran_utama: 1,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      id_peran_pengguna: 9002,
      nama_pengguna: staff?.nama_pengguna || 2,
      id_peran: peranStaff?.id_peran || peranAdm?.id_peran || 1,
      peran_utama: 1,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_navigasi", "peran", [
    { peran: "master", menu, created_at: dNow },
    { peran: "Administrator", menu, created_at: dNow },
    { peran: "Staff Arsip", menu, created_at: dNow },
  ]);

  await seedRows(knex, "navigasi_pengguna", "nama_pengguna", [
    {
      nama_pengguna: superadmin?.nama_pengguna || 1,
      menu,
      created_at: dNow,
      updated_at: dNow,
    },
    {
      nama_pengguna: staff?.nama_pengguna || 2,
      menu,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const surat = await knex("mst_document_type")
    .where("document_type_code", "SURAT")
    .first();
  const laporan = await knex("mst_document_type")
    .where("document_type_code", "LAPORAN")
    .first();
  const internal = await knex("mst_confidentiality_levels")
    .where("confidentiality_level_code", "INT")
    .first();
  const rahasia = await knex("mst_confidentiality_levels")
    .where("confidentiality_level_code", "RHS")
    .first();
  const retAdm = await knex("mst_retention_schedule")
    .where("retention_code", "RET-ADM-05")
    .first();
  const retKeu = await knex("mst_retention_schedule")
    .where("retention_code", "RET-KEU-10")
    .first();

  await seedRows(knex, "trx_documents", "document_number", [
    {
      archive_classification_id: adm?.archive_classification_id || 1,
      document_type_id: surat?.document_type_id || 1,
      document_category_id: catAdm?.document_category_id || 1,
      confidentiality_level_id: internal?.confidentiality_level_id || 2,
      retention_schedule_id: retAdm?.retention_schedule_id || 1,
      physical_location: "Rak A / Box 01",
      qr_code: "DOC-QR-ADM-001",
      tags: "administrasi,internal,surat",
      document_name: "Surat Keputusan Internal",
      document_number: "DOC-ADM-2026-001",
      document_date: "2026-06-01",
      expired_date: "2031-06-01",
      pic_name: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      archive_classification_id: keu?.archive_classification_id || 2,
      document_type_id: laporan?.document_type_id || 3,
      document_category_id: catKeu?.document_category_id || 2,
      confidentiality_level_id: rahasia?.confidentiality_level_id || 3,
      retention_schedule_id: retKeu?.retention_schedule_id || 2,
      physical_location: "Rak B / Box 02",
      qr_code: "DOC-QR-KEU-001",
      tags: "keuangan,laporan,rahasia",
      document_name: "Laporan Keuangan Tahunan",
      document_number: "DOC-KEU-2026-001",
      document_date: "2026-06-10",
      expired_date: "2036-06-10",
      pic_name: "Staff Arsip Demo",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const docAdm = await knex("trx_documents")
    .where("document_number", "DOC-ADM-2026-001")
    .first();
  const docKeu = await knex("trx_documents")
    .where("document_number", "DOC-KEU-2026-001")
    .first();

  await seedRows(knex, "trx_document_versions", "version_id", [
    {
      version_id: 9001,
      document_id: docAdm?.document_id || 1,
      version_number: 1,
      change_notes: "Versi awal dokumen",
      file_path: "demo/documents/DOC-ADM-2026-001-v1.pdf",
      uploaded_by: staff?.nama_pengguna || "staff.arsip@example.local",
      approval_status: "approved",
      approved_by: superadmin?.nama_pengguna || "superadmin@admin.com",
      approved_at: dNow,
      approval_notes: "Data demo disetujui",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      version_id: 9002,
      document_id: docKeu?.document_id || 2,
      version_number: 1,
      change_notes: "Versi awal laporan",
      file_path: "demo/documents/DOC-KEU-2026-001-v1.pdf",
      uploaded_by: staff?.nama_pengguna || "staff.arsip@example.local",
      approval_status: "pending",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "trx_archive_loans", "loan_id", [
    {
      loan_id: 9001,
      document_id: docAdm?.document_id || 1,
      borrower_name: "Budi Santoso",
      loan_date: "2026-06-18",
      expected_return_date: "2026-06-25",
      return_date: null,
      purpose: "Referensi audit internal",
      approved_by: superadmin?.nama_pengguna || "superadmin@admin.com",
      approved_at: dNow,
      approval_notes: "Disetujui untuk audit",
      is_overdue: 0,
      status: "borrowed",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "trx_destruction_proposals", "proposal_id", [
    {
      proposal_id: 9001,
      document_id: docKeu?.document_id || 2,
      retention_schedule_id: retKeu?.retention_schedule_id || 2,
      proposal_reason: "Contoh proposal pemusnahan data demo",
      proposed_by: staff?.nama_pengguna || "staff.arsip@example.local",
      proposed_at: dNow,
      status: "submitted",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const letterType = await knex("mst_letter_types")
    .where("letter_type_code", "SURAT_MASUK")
    .first();
  const tindakLanjut = await knex("mst_disposition_instructions")
    .where("instruction_code", "TINDAK_LANJUT")
    .first();

  await seedRows(knex, "trx_incoming_letters", "agenda_number", [
    {
      agenda_number: "AG-2026-001",
      letter_number: "EXT/001/VI/2026",
      letter_date: "2026-06-17",
      received_date: "2026-06-18",
      sender_name: "PT Contoh Nusantara",
      sender_institution: "PT Contoh Nusantara",
      subject: "Permohonan kerja sama arsip digital",
      attachment_deskripsi: "1 berkas proposal",
      letter_type_id: letterType?.letter_type_id || 1,
      document_type_id: surat?.document_type_id || 1,
      archive_classification_id: adm?.archive_classification_id || 1,
      confidentiality_level_id: internal?.confidentiality_level_id || 2,
      status: "didisposisi",
      created_by: superadmin?.nama_pengguna || 1,
      updated_by: superadmin?.nama_pengguna || 1,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const incoming = await knex("trx_incoming_letters")
    .where("agenda_number", "AG-2026-001")
    .first();

  await seedRows(knex, "trx_letter_dispositions", "disid_jabatan", [
    {
      disid_jabatan: 9001,
      incoming_letter_id: incoming?.incoming_letter_id || 1,
      from_nama_pengguna: superadmin?.nama_pengguna || 1,
      to_nama_pengguna: staff?.nama_pengguna || 2,
      disposition_instruction_id: tindakLanjut?.disposition_instruction_id || 1,
      instruction: "Tindak lanjuti dan arsipkan dokumen",
      disposition_note: "Data demo disposisi",
      due_date: "2026-06-24",
      status: "baru",
      created_by: superadmin?.nama_pengguna || 1,
      updated_by: superadmin?.nama_pengguna || 1,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "trx_incoming_letter_files", "incoming_letter_file_id", [
    {
      incoming_letter_file_id: 9001,
      incoming_letter_id: incoming?.incoming_letter_id || 1,
      file_path: "demo/incoming/AG-2026-001.pdf",
      file_name: "AG-2026-001.pdf",
      file_mime_type: "application/pdf",
      file_size: 102400,
      uploaded_by: superadmin?.nama_pengguna || 1,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(
    knex,
    "trx_incoming_letter_trackings",
    "incoming_letter_tracking_id",
    [
      {
        incoming_letter_tracking_id: 9001,
        incoming_letter_id: incoming?.incoming_letter_id || 1,
        disid_jabatan: 9001,
        action_name: "Disposisi dibuat",
        from_nama_pengguna: superadmin?.nama_pengguna || 1,
        to_nama_pengguna: staff?.nama_pengguna || 2,
        previous_status: "baru",
        current_status: "didisposisi",
        notes: "Tracking demo",
        processed_at: dNow,
        created_by: superadmin?.nama_pengguna || 1,
        created_at: dNow,
        updated_at: dNow,
      },
    ],
  );

  await seedRows(knex, "tr_visitations", "visit_code", [
    {
      guest_name: "Andi Wijaya",
      phone_number: "081234567890",
      guest_surel: "andi@example.local",
      guest_company: "PT Contoh Nusantara",
      guest_position: "Manager",
      identity_type: "ktp",
      identity_number: "3200000000000001",
      check_in_time: dNow,
      check_out_time: null,
      status: "in",
      host_nama_pengguna: String(staff?.nama_pengguna || 2),
      host_name: "Staff Arsip Demo",
      visit_notes: "Meeting arsip digital",
      visit_code: "VIS-2026-001",
      qr_token: "QR-VIS-2026-001",
      approval_status: "approved",
      nama_pengguna: staff?.nama_pengguna || 2,
      visit_purpose_id: 1,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  console.log(
    "Full demo data seeder selesai. Aman dijalankan ulang karena tidak memakai truncate.",
  );
}
