const hasTable = (knex, tableName) => knex.schema.hasTable(tableName);

const hasColumn = async (knex, tableName, columnName) => {
  if (!(await hasTable(knex, tableName))) {
    return false;
  }

  return knex.schema.hasColumn(tableName, columnName);
};

const dropForeignIfExists = async (knex, tableName, constraintName) => {
  const result = await knex.raw(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `,
    [tableName, constraintName],
  );

  if (result[0].length > 0) {
    await knex.raw("ALTER TABLE ?? DROP FOREIGN KEY ??", [
      tableName,
      constraintName,
    ]);
  }
};

const changeIfExists = async (
  knex,
  tableName,
  oldName,
  newName,
  definition,
) => {
  if (
    (await hasColumn(knex, tableName, oldName)) &&
    !(await hasColumn(knex, tableName, newName))
  ) {
    await knex.raw(`ALTER TABLE ?? CHANGE ?? ?? ${definition}`, [
      tableName,
      oldName,
      newName,
    ]);
  }
};

const changeColumns = async (knex, tableName, columns) => {
  for (const column of columns) {
    await changeIfExists(
      knex,
      tableName,
      column.old,
      column.new,
      column.definition,
    );
  }
};

const migrationSet = [
  {
    table: "trx_documents",
    columns: [
      {
        old: "DocumentId",
        new: "document_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "ArchiveClassificationId",
        new: "archive_classification_id",
        definition: "INT UNSIGNED NULL",
      },
      {
        old: "DocumentTypeId",
        new: "document_type_id",
        definition: "INT UNSIGNED NULL",
      },
      {
        old: "DocumentCategoryId",
        new: "document_category_id",
        definition: "INT UNSIGNED NULL",
      },
      {
        old: "ConfidentialityLevelId",
        new: "confidentiality_level_id",
        definition: "INT UNSIGNED NULL",
      },
      {
        old: "RetentionScheduleId",
        new: "retention_schedule_id",
        definition: "INT UNSIGNED NULL",
      },
      {
        old: "DocumentName",
        new: "document_name",
        definition: "VARCHAR(255) NULL",
      },
      {
        old: "DocumentNumber",
        new: "document_number",
        definition: "VARCHAR(255) NULL",
      },
      { old: "DocumentDate", new: "document_date", definition: "DATE NULL" },
      { old: "ExpiredDate", new: "expired_date", definition: "DATE NULL" },
      { old: "PicName", new: "pic_name", definition: "VARCHAR(255) NULL" },
      {
        old: "PhysicalLocation",
        new: "physical_location",
        definition: "VARCHAR(200) NULL",
      },
      { old: "QRCode", new: "qr_code", definition: "TEXT NULL" },
      { old: "Tags", new: "tags", definition: "TEXT NULL" },
      {
        old: "Status",
        new: "status",
        definition: "ENUM('active','nonactive') NOT NULL DEFAULT 'active'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "trx_document_versions",
    columns: [
      {
        old: "VersionId",
        new: "version_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "DocumentId",
        new: "document_id",
        definition: "INT UNSIGNED NOT NULL",
      },
      {
        old: "VersionNumber",
        new: "version_number",
        definition: "INT NOT NULL",
      },
      { old: "ChangeNotes", new: "change_notes", definition: "TEXT NULL" },
      {
        old: "FilePath",
        new: "file_path",
        definition: "VARCHAR(255) NOT NULL",
      },
      { old: "UploadedBy", new: "uploaded_by", definition: "VARCHAR(50) NULL" },
      {
        old: "ApprovalStatus",
        new: "approval_status",
        definition:
          "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'",
      },
      { old: "ApprovedBy", new: "approved_by", definition: "VARCHAR(50) NULL" },
      { old: "ApprovedAt", new: "approved_at", definition: "DATETIME NULL" },
      { old: "ApprovalNotes", new: "approval_notes", definition: "TEXT NULL" },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "trx_archive_loans",
    columns: [
      {
        old: "LoanId",
        new: "loan_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "DocumentId",
        new: "document_id",
        definition: "INT UNSIGNED NOT NULL",
      },
      {
        old: "BorrowerName",
        new: "borrower_name",
        definition: "VARCHAR(255) NOT NULL",
      },
      { old: "LoanDate", new: "loan_date", definition: "DATE NOT NULL" },
      {
        old: "ExpectedReturnDate",
        new: "expected_return_date",
        definition: "DATE NULL",
      },
      { old: "ReturnDate", new: "return_date", definition: "DATE NULL" },
      { old: "Purpose", new: "purpose", definition: "TEXT NULL" },
      { old: "ApprovedBy", new: "approved_by", definition: "VARCHAR(50) NULL" },
      { old: "ApprovedAt", new: "approved_at", definition: "DATETIME NULL" },
      { old: "ApprovalNotes", new: "approval_notes", definition: "TEXT NULL" },
      {
        old: "IsOverdue",
        new: "is_overdue",
        definition: "TINYINT NOT NULL DEFAULT 0",
      },
      {
        old: "Status",
        new: "status",
        definition:
          "ENUM('pending','approved','borrowed','returned','rejected') NOT NULL DEFAULT 'pending'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "trx_destruction_proposals",
    columns: [
      {
        old: "ProposalId",
        new: "proposal_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "DocumentId",
        new: "document_id",
        definition: "INT UNSIGNED NOT NULL",
      },
      {
        old: "RetentionScheduleId",
        new: "retention_schedule_id",
        definition: "INT UNSIGNED NULL",
      },
      {
        old: "ProposalReason",
        new: "proposal_reason",
        definition: "TEXT NOT NULL",
      },
      {
        old: "ProposedBy",
        new: "proposed_by",
        definition: "VARCHAR(50) NOT NULL",
      },
      {
        old: "ProposedAt",
        new: "proposed_at",
        definition: "DATETIME NOT NULL",
      },
      {
        old: "Status",
        new: "status",
        definition:
          "ENUM('draft','submitted','approved','rejected','executed') NOT NULL DEFAULT 'submitted'",
      },
      { old: "ReviewedBy", new: "reviewed_by", definition: "VARCHAR(50) NULL" },
      { old: "ReviewedAt", new: "reviewed_at", definition: "DATETIME NULL" },
      { old: "ReviewNotes", new: "review_notes", definition: "TEXT NULL" },
      { old: "ExecutedBy", new: "executed_by", definition: "VARCHAR(50) NULL" },
      { old: "ExecutedAt", new: "executed_at", definition: "DATETIME NULL" },
      {
        old: "BeritaAcaraPath",
        new: "berita_acara_path",
        definition: "TEXT NULL",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "mst_archive_classifications",
    columns: [
      {
        old: "ArchiveClassificationId",
        new: "archive_classification_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "ClassificationCode",
        new: "classification_code",
        definition: "VARCHAR(45) NOT NULL",
      },
      {
        old: "ClassificationName",
        new: "classification_name",
        definition: "VARCHAR(45) NOT NULL",
      },
      { old: "deskripsi", new: "deskripsi", definition: "VARCHAR(45) NULL" },
      {
        old: "Status",
        new: "status",
        definition: "ENUM('active','nonactive') NOT NULL DEFAULT 'active'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "mst_document_type",
    columns: [
      {
        old: "DocumentTypeId",
        new: "document_type_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "DocumentTypeCode",
        new: "document_type_code",
        definition: "VARCHAR(45) NOT NULL",
      },
      {
        old: "DocumentTypeName",
        new: "document_type_name",
        definition: "VARCHAR(45) NOT NULL",
      },
      { old: "deskripsi", new: "deskripsi", definition: "VARCHAR(45) NULL" },
      {
        old: "Status",
        new: "status",
        definition: "ENUM('active','nonactive') NOT NULL DEFAULT 'active'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "mst_document_categories",
    columns: [
      {
        old: "DocumentCategoryId",
        new: "document_category_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "ArchiveClassificationId",
        new: "archive_classification_id",
        definition: "INT UNSIGNED NOT NULL",
      },
      {
        old: "DocumentCategoryCode",
        new: "document_category_code",
        definition: "VARCHAR(45) NOT NULL",
      },
      {
        old: "DocumentCategoryName",
        new: "document_category_name",
        definition: "VARCHAR(45) NOT NULL",
      },
      { old: "deskripsi", new: "deskripsi", definition: "VARCHAR(45) NULL" },
      {
        old: "Status",
        new: "status",
        definition: "ENUM('active','nonactive') NOT NULL DEFAULT 'active'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "mst_confidentiality_levels",
    columns: [
      {
        old: "ConfidentialityLevelId",
        new: "confidentiality_level_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "ConfidentialityLevelCode",
        new: "confidentiality_level_code",
        definition: "VARCHAR(45) NOT NULL",
      },
      {
        old: "ConfidentialityLevelName",
        new: "confidentiality_level_name",
        definition: "VARCHAR(100) NOT NULL",
      },
      {
        old: "ConfidentialityLevel",
        new: "confidentiality_level",
        definition: "INT NOT NULL",
      },
      { old: "deskripsi", new: "deskripsi", definition: "VARCHAR(45) NULL" },
      {
        old: "Status",
        new: "status",
        definition: "ENUM('active','nonactive') NOT NULL DEFAULT 'active'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
  {
    table: "mst_retention_schedule",
    columns: [
      {
        old: "RetentionScheduleId",
        new: "retention_schedule_id",
        definition: "INT UNSIGNED NOT NULL AUTO_INCREMENT",
      },
      {
        old: "DocumentCategoryId",
        new: "document_category_id",
        definition: "INT UNSIGNED NOT NULL",
      },
      {
        old: "RetentionCode",
        new: "retention_code",
        definition: "VARCHAR(45) NOT NULL",
      },
      {
        old: "RetentionName",
        new: "retention_name",
        definition: "VARCHAR(45) NOT NULL",
      },
      {
        old: "RetentionYears",
        new: "retention_years",
        definition: "INT NOT NULL",
      },
      {
        old: "RetentionAction",
        new: "retention_action",
        definition: "VARCHAR(45) NOT NULL",
      },
      { old: "deskripsi", new: "deskripsi", definition: "VARCHAR(45) NULL" },
      {
        old: "Status",
        new: "status",
        definition: "ENUM('active','nonactive') NOT NULL DEFAULT 'active'",
      },
      { old: "CreatedAt", new: "created_at", definition: "DATETIME NOT NULL" },
      { old: "UpdatedAt", new: "updated_at", definition: "DATETIME NOT NULL" },
    ],
  },
];

const foreignKeysToDrop = [
  ["trx_documents", "trx_documents_documenttypeid_foreign"],
  ["trx_documents", "trx_documents_documentcategoryid_foreign"],
  ["trx_documents", "trx_documents_confidentialitylevelid_foreign"],
  ["trx_documents", "trx_documents_retentionscheduleid_foreign"],
  ["trx_document_versions", "trx_document_versions_documentid_foreign"],
  ["trx_destruction_proposals", "trx_destruction_proposals_documentid_foreign"],
  [
    "trx_destruction_proposals",
    "trx_destruction_proposals_retentionscheduleid_foreign",
  ],
  [
    "mst_document_categories",
    "mst_document_categories_archiveclassificationid_foreign",
  ],
  [
    "mst_retention_schedule",
    "mst_retention_schedule_documentcategoryid_foreign",
  ],
];

export async function up(knex) {
  for (const [tableName, constraintName] of foreignKeysToDrop) {
    await dropForeignIfExists(knex, tableName, constraintName);
  }

  for (const migration of migrationSet) {
    await changeColumns(knex, migration.table, migration.columns);
  }
}

export async function down() {}
