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

  await seedRows(knex, "mst_roles", "role_code", [
    {
      role_code: "ADM",
      role_name: "Administrator",
      description: "Akses penuh sistem",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      role_code: "PMN",
      role_name: "Pimpinan",
      description: "Approval dan monitoring",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      role_code: "SKR",
      role_name: "Sekretaris",
      description: "Kelola surat masuk",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      role_code: "STF_ARS",
      role_name: "Staff Arsip",
      description: "Kelola arsip digital",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      role_code: "RSP",
      role_name: "Resepsionis",
      description: "Kelola buku tamu",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_branches", "branch_code", [
    {
      branch_code: "BR-PST",
      branch_name: "Kantor Pusat",
      address: "Jl. Merdeka No. 1",
      telp: "0215550101",
      email: "pusat@example.local",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const branch = await knex("mst_branches")
    .where("branch_code", "BR-PST")
    .first();

  await seedRows(knex, "mst_divisions", "division_code", [
    {
      branch_id: branch?.branch_id || 1,
      division_code: "DIV-OPS",
      division_name: "Operasional",
      description: "Operasional kantor",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      branch_id: branch?.branch_id || 1,
      division_code: "DIV-IT",
      division_name: "Teknologi",
      description: "Teknologi informasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const divOps = await knex("mst_divisions")
    .where("division_code", "DIV-OPS")
    .first();
  const divIt = await knex("mst_divisions")
    .where("division_code", "DIV-IT")
    .first();

  await seedRows(knex, "mst_departments", "department_code", [
    {
      division_id: divOps?.division_id || 1,
      department_code: "DEP-ARSIP",
      department_name: "Arsip dan Tata Usaha",
      description: "Unit arsip dan administrasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      division_id: divIt?.division_id || 2,
      department_code: "DEP-IT",
      department_name: "IT Support",
      description: "Dukungan sistem",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_positions", "position_code", [
    {
      position_code: "POS-DIR",
      position_name: "Direktur",
      position_level: 1,
      description: "Pimpinan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      position_code: "POS-MGR",
      position_name: "Manager",
      position_level: 2,
      description: "Manager unit",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      position_code: "POS-STF",
      position_name: "Staff",
      position_level: 3,
      description: "Staff operasional",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const depArsip = await knex("mst_departments")
    .where("department_code", "DEP-ARSIP")
    .first();

  await seedRows(knex, "mst_work_units", "work_unit_code", [
    {
      department_id: depArsip?.department_id || 1,
      work_unit_code: "WU-ARSIP",
      work_unit_name: "Unit Arsip",
      description: "Pengelolaan arsip",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_archive_classifications", "classification_code", [
    {
      classification_code: "ADM",
      classification_name: "Administrasi",
      description: "Arsip administrasi",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      classification_code: "KEU",
      classification_name: "Keuangan",
      description: "Arsip keuangan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      classification_code: "HRD",
      classification_name: "SDM",
      description: "Arsip SDM",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_document_type", "document_type_code", [
    {
      document_type_code: "SURAT",
      document_type_name: "Surat",
      description: "Dokumen surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      document_type_code: "KONTRAK",
      document_type_name: "Kontrak",
      description: "Dokumen kontrak",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      document_type_code: "LAPORAN",
      document_type_name: "Laporan",
      description: "Dokumen laporan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

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
      description: "Dokumen administrasi umum",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      archive_classification_id: keu?.archive_classification_id || 2,
      document_category_code: "KEU-LAP",
      document_category_name: "Laporan Keuangan",
      description: "Dokumen laporan keuangan",
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
        description: "Dapat diakses umum",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        confidentiality_level_code: "INT",
        confidentiality_level_name: "Internal",
        confidentiality_level: 2,
        description: "Internal organisasi",
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      },
      {
        confidentiality_level_code: "RHS",
        confidentiality_level_name: "Rahasia",
        confidentiality_level: 3,
        description: "Terbatas",
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
      description: "Evaluasi setelah 5 tahun",
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
      description: "Musnah setelah 10 tahun",
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
      description: "Surat masuk umum",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      letter_type_code: "SURAT_UNDANGAN",
      letter_type_name: "Surat Undangan",
      direction: "both",
      description: "Surat undangan",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_disposition_instructions", "instruction_code", [
    {
      instruction_code: "TINDAK_LANJUT",
      instruction_name: "Tindak Lanjut",
      description: "Menindaklanjuti surat",
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      instruction_code: "ARSIPKAN",
      instruction_name: "Arsipkan",
      description: "Mengarsipkan surat",
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
      description: "Pertemuan kerja",
      status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    },
    {
      VisitPurposeId: 2,
      VisitPurposeCode: "DELIVERY",
      VisitPurposeName: "Pengiriman",
      description: "Pengiriman dokumen/barang",
      status: "active",
      CreatedAt: dNow,
      UpdatedAt: dNow,
    },
  ]);

  const position = await knex("mst_positions")
    .where("position_code", "POS-STF")
    .first();
  const workUnit = await knex("mst_work_units")
    .where("work_unit_code", "WU-ARSIP")
    .first();
  const roleAdm = await knex("mst_roles").where("role_code", "ADM").first();
  const roleStaff = await knex("mst_roles")
    .where("role_code", "STF_ARS")
    .first();

  await seedRows(knex, "mst_users", "username", [
    {
      fullname: "Superadmin SIAB",
      username: "superadmin@admin.com",
      email: "superadmin@admin.com",
      telp: "08100000000",
      password: hashPassword("superadmin@admin.com", "Superadmin321!"),
      branch_id: branch?.branch_id || 1,
      division_id: divOps?.division_id || 1,
      department_id: depArsip?.department_id || 1,
      position_id: position?.position_id || 1,
      work_unit_id: workUnit?.work_unit_id || 1,
      failed_login_attempts: 0,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      fullname: "Staff Arsip Demo",
      username: "staff.arsip@example.local",
      email: "staff.arsip@example.local",
      telp: "08100000001",
      password: hashPassword("staff.arsip@example.local", "Password123!"),
      branch_id: branch?.branch_id || 1,
      division_id: divOps?.division_id || 1,
      department_id: depArsip?.department_id || 1,
      position_id: position?.position_id || 1,
      work_unit_id: workUnit?.work_unit_id || 1,
      failed_login_attempts: 0,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const superadmin = await knex("mst_users")
    .where("username", "superadmin@admin.com")
    .first();
  const staff = await knex("mst_users")
    .where("username", "staff.arsip@example.local")
    .first();

  await seedRows(knex, "mst_user_roles", "user_role_id", [
    {
      user_role_id: 9001,
      user_id: superadmin?.user_id || 1,
      role_id: roleAdm?.role_id || 1,
      is_primary: 1,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
    {
      user_role_id: 9002,
      user_id: staff?.user_id || 2,
      role_id: roleStaff?.role_id || roleAdm?.role_id || 1,
      is_primary: 1,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  await seedRows(knex, "mst_navigation", "role", [
    { role: "master", menu, created_at: dNow },
    { role: "Administrator", menu, created_at: dNow },
    { role: "Staff Arsip", menu, created_at: dNow },
  ]);

  await seedRows(knex, "user_navigation", "user_id", [
    {
      user_id: superadmin?.user_id || 1,
      menu,
      created_at: dNow,
      updated_at: dNow,
    },
    { user_id: staff?.user_id || 2, menu, created_at: dNow, updated_at: dNow },
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
      uploaded_by: staff?.username || "staff.arsip@example.local",
      approval_status: "approved",
      approved_by: superadmin?.username || "superadmin@admin.com",
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
      uploaded_by: staff?.username || "staff.arsip@example.local",
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
      approved_by: superadmin?.username || "superadmin@admin.com",
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
      proposed_by: staff?.username || "staff.arsip@example.local",
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
      attachment_description: "1 berkas proposal",
      letter_type_id: letterType?.letter_type_id || 1,
      document_type_id: surat?.document_type_id || 1,
      archive_classification_id: adm?.archive_classification_id || 1,
      confidentiality_level_id: internal?.confidentiality_level_id || 2,
      status: "didisposisi",
      created_by: superadmin?.user_id || 1,
      updated_by: superadmin?.user_id || 1,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  const incoming = await knex("trx_incoming_letters")
    .where("agenda_number", "AG-2026-001")
    .first();

  await seedRows(knex, "trx_letter_dispositions", "disposition_id", [
    {
      disposition_id: 9001,
      incoming_letter_id: incoming?.incoming_letter_id || 1,
      from_user_id: superadmin?.user_id || 1,
      to_user_id: staff?.user_id || 2,
      disposition_instruction_id: tindakLanjut?.disposition_instruction_id || 1,
      instruction: "Tindak lanjuti dan arsipkan dokumen",
      disposition_note: "Data demo disposisi",
      due_date: "2026-06-24",
      status: "baru",
      created_by: superadmin?.user_id || 1,
      updated_by: superadmin?.user_id || 1,
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
      uploaded_by: superadmin?.user_id || 1,
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
        disposition_id: 9001,
        action_name: "Disposisi dibuat",
        from_user_id: superadmin?.user_id || 1,
        to_user_id: staff?.user_id || 2,
        previous_status: "baru",
        current_status: "didisposisi",
        notes: "Tracking demo",
        processed_at: dNow,
        created_by: superadmin?.user_id || 1,
        created_at: dNow,
        updated_at: dNow,
      },
    ],
  );

  await seedRows(knex, "tr_visitations", "visit_code", [
    {
      guest_name: "Andi Wijaya",
      phone_number: "081234567890",
      guest_email: "andi@example.local",
      guest_company: "PT Contoh Nusantara",
      guest_position: "Manager",
      identity_type: "ktp",
      identity_number: "3200000000000001",
      check_in_time: dNow,
      check_out_time: null,
      status: "in",
      host_user_id: String(staff?.user_id || 2),
      host_name: "Staff Arsip Demo",
      visit_notes: "Meeting arsip digital",
      visit_code: "VIS-2026-001",
      qr_token: "QR-VIS-2026-001",
      approval_status: "approved",
      user_id: staff?.user_id || 2,
      visit_purpose_id: 1,
      created_at: dNow,
      updated_at: dNow,
    },
  ]);

  console.log(
    "Full demo data seeder selesai. Aman dijalankan ulang karena tidak memakai truncate.",
  );
}
