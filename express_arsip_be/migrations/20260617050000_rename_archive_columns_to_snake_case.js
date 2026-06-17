/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const docTypeTable = (await knex.schema.hasTable('mst_document_types')) ? 'mst_document_types' : 'mst_document_type';
  const retentionTable = (await knex.schema.hasTable('mst_retention_schedules')) ? 'mst_retention_schedules' : 'mst_retention_schedule';


  /*
  await knex.schema.alterTable('trx_document_versions', (table) => { table.dropForeign('DocumentId'); });
  await knex.schema.alterTable('trx_archive_loans', (table) => { table.dropForeign('DocumentId'); });
  await knex.schema.alterTable('trx_destruction_proposals', (table) => { table.dropForeign('DocumentId'); });
  await knex.schema.alterTable('trx_documents', (table) => {
    table.dropForeign('DocumentTypeId');
    table.dropForeign('DocumentCategoryId');
    table.dropForeign('ConfidentialityLevelId');
  });
  await knex.schema.alterTable('mst_document_categories', (table) => { table.dropForeign('ArchiveClassificationId'); });
  await knex.schema.alterTable(retentionTable, (table) => { table.dropForeign('DocumentCategoryId'); });
  */


  const migrations = [
    { table: 'trx_documents', columns: [{ old: 'DocumentId', new: 'document_id' }, { old: 'ArchiveClassificationId', new: 'archive_classification_id' }, { old: 'DocumentTypeId', new: 'document_type_id' }, { old: 'DocumentCategoryId', new: 'document_category_id' }, { old: 'ConfidentialityLevelId', new: 'confidentiality_level_id' }, { old: 'RetentionScheduleId', new: 'retention_schedule_id' }, { old: 'DocumentName', new: 'document_name' }, { old: 'DocumentNumber', new: 'document_number' }, { old: 'DocumentDate', new: 'document_date' }, { old: 'ExpiredDate', new: 'expired_date' }, { old: 'PicName', new: 'pic_name' }, { old: 'PhysicalLocation', new: 'physical_location' }, { old: 'QRCode', new: 'qr_code' }, { old: 'Tags', new: 'tags' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'trx_document_versions', columns: [{ old: 'VersionId', new: 'version_id' }, { old: 'DocumentId', new: 'document_id' }, { old: 'VersionNumber', new: 'version_number' }, { old: 'ChangeNotes', new: 'change_notes' }, { old: 'FilePath', new: 'file_path' }, { old: 'UploadedBy', new: 'uploaded_by' }, { old: 'ApprovalStatus', new: 'approval_status' }, { old: 'ApprovedBy', new: 'approved_by' }, { old: 'ApprovedAt', new: 'approved_at' }, { old: 'ApprovalNotes', new: 'approval_notes' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'trx_archive_loans', columns: [{ old: 'LoanId', new: 'loan_id' }, { old: 'DocumentId', new: 'document_id' }, { old: 'BorrowerName', new: 'borrower_name' }, { old: 'LoanDate', new: 'loan_date' }, { old: 'ExpectedReturnDate', new: 'expected_return_date' }, { old: 'ReturnDate', new: 'return_date' }, { old: 'Purpose', new: 'purpose' }, { old: 'ApprovedBy', new: 'approved_by' }, { old: 'ApprovedAt', new: 'approved_at' }, { old: 'ApprovalNotes', new: 'approval_notes' }, { old: 'IsOverdue', new: 'is_overdue' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'trx_destruction_proposals', columns: [{ old: 'ProposalId', new: 'proposal_id' }, { old: 'DocumentId', new: 'document_id' }, { old: 'RetentionScheduleId', new: 'retention_schedule_id' }, { old: 'ProposalReason', new: 'proposal_reason' }, { old: 'ProposedBy', new: 'proposed_by' }, { old: 'ProposedAt', new: 'proposed_at' }, { old: 'Status', new: 'status' }, { old: 'ReviewedBy', new: 'reviewed_by' }, { old: 'ReviewedAt', new: 'reviewed_at' }, { old: 'ReviewNotes', new: 'review_notes' }, { old: 'ExecutedBy', new: 'executed_by' }, { old: 'ExecutedAt', new: 'executed_at' }, { old: 'BeritaAcaraPath', new: 'berita_acara_path' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'mst_archive_classifications', columns: [{ old: 'ArchiveClassificationId', new: 'archive_classification_id' }, { old: 'ClassificationCode', new: 'classification_code' }, { old: 'ClassificationName', new: 'classification_name' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: docTypeTable, columns: [{ old: 'DocumentTypeId', new: 'document_type_id' }, { old: 'DocumentTypeCode', new: 'document_type_code' }, { old: 'DocumentTypeName', new: 'document_type_name' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'mst_document_categories', columns: [{ old: 'DocumentCategoryId', new: 'document_category_id' }, { old: 'ArchiveClassificationId', new: 'archive_classification_id' }, { old: 'DocumentCategoryCode', new: 'document_category_code' }, { old: 'DocumentCategoryName', new: 'document_category_name' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'mst_confidentiality_levels', columns: [{ old: 'ConfidentialityLevelId', new: 'confidentiality_level_id' }, { old: 'ConfidentialityLevelCode', new: 'confidentiality_level_code' }, { old: 'ConfidentialityLevelName', new: 'confidentiality_level_name' }, { old: 'ConfidentialityLevel', new: 'confidentiality_level' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: retentionTable, columns: [{ old: 'RetentionScheduleId', new: 'retention_schedule_id' }, { old: 'DocumentCategoryId', new: 'document_category_id' }, { old: 'RetentionCode', new: 'retention_code' }, { old: 'RetentionName', new: 'retention_name' }, { old: 'RetentionYears', new: 'retention_years' }, { old: 'RetentionAction', new: 'retention_action' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] }
  ];

  for (const m of migrations) {
    await knex.schema.alterTable(m.table, (table) => {
      for (const col of m.columns) {
        table.renameColumn(col.old, col.new);
      }
    });
  }


  /*
  await knex.schema.alterTable('mst_document_categories', (table) => { table.foreign('archive_classification_id').references('archive_classification_id').inTable('mst_archive_classifications'); });
  await knex.schema.alterTable(retentionTable, (table) => { table.foreign('document_category_id').references('document_category_id').inTable('mst_document_categories'); });
  await knex.schema.alterTable('trx_documents', (table) => { table.foreign('document_type_id').references('document_type_id').inTable(docTypeTable); table.foreign('document_category_id').references('document_category_id').inTable('mst_document_categories'); table.foreign('confidentiality_level_id').references('confidentiality_level_id').inTable('mst_confidentiality_levels'); });
  await knex.schema.alterTable('trx_document_versions', (table) => { table.foreign('document_id').references('document_id').inTable('trx_documents').onDelete('CASCADE'); });
  await knex.schema.alterTable('trx_archive_loans', (table) => { table.foreign('document_id').references('document_id').inTable('trx_documents').onDelete('CASCADE'); });
  await knex.schema.alterTable('trx_destruction_proposals', (table) => { table.foreign('document_id').references('document_id').inTable('trx_documents').onDelete('CASCADE'); });
  */
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Hanya melakukan rollback untuk proses rename kolom (Tahap 2)
  const docTypeTable = (await knex.schema.hasTable('mst_document_types')) ? 'mst_document_types' : 'mst_document_type';
  const retentionTable = (await knex.schema.hasTable('mst_retention_schedules')) ? 'mst_retention_schedules' : 'mst_retention_schedule';

  const migrations = [
    { table: 'trx_documents', columns: [{ old: 'DocumentId', new: 'document_id' }, { old: 'ArchiveClassificationId', new: 'archive_classification_id' }, { old: 'DocumentTypeId', new: 'document_type_id' }, { old: 'DocumentCategoryId', new: 'document_category_id' }, { old: 'ConfidentialityLevelId', new: 'confidentiality_level_id' }, { old: 'RetentionScheduleId', new: 'retention_schedule_id' }, { old: 'DocumentName', new: 'document_name' }, { old: 'DocumentNumber', new: 'document_number' }, { old: 'DocumentDate', new: 'document_date' }, { old: 'ExpiredDate', new: 'expired_date' }, { old: 'PicName', new: 'pic_name' }, { old: 'PhysicalLocation', new: 'physical_location' }, { old: 'QRCode', new: 'qr_code' }, { old: 'Tags', new: 'tags' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'trx_document_versions', columns: [{ old: 'VersionId', new: 'version_id' }, { old: 'DocumentId', new: 'document_id' }, { old: 'VersionNumber', new: 'version_number' }, { old: 'ChangeNotes', new: 'change_notes' }, { old: 'FilePath', new: 'file_path' }, { old: 'UploadedBy', new: 'uploaded_by' }, { old: 'ApprovalStatus', new: 'approval_status' }, { old: 'ApprovedBy', new: 'approved_by' }, { old: 'ApprovedAt', new: 'approved_at' }, { old: 'ApprovalNotes', new: 'approval_notes' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'trx_archive_loans', columns: [{ old: 'LoanId', new: 'loan_id' }, { old: 'DocumentId', new: 'document_id' }, { old: 'BorrowerName', new: 'borrower_name' }, { old: 'LoanDate', new: 'loan_date' }, { old: 'ExpectedReturnDate', new: 'expected_return_date' }, { old: 'ReturnDate', new: 'return_date' }, { old: 'Purpose', new: 'purpose' }, { old: 'ApprovedBy', new: 'approved_by' }, { old: 'ApprovedAt', new: 'approved_at' }, { old: 'ApprovalNotes', new: 'approval_notes' }, { old: 'IsOverdue', new: 'is_overdue' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'trx_destruction_proposals', columns: [{ old: 'ProposalId', new: 'proposal_id' }, { old: 'DocumentId', new: 'document_id' }, { old: 'RetentionScheduleId', new: 'retention_schedule_id' }, { old: 'ProposalReason', new: 'proposal_reason' }, { old: 'ProposedBy', new: 'proposed_by' }, { old: 'ProposedAt', new: 'proposed_at' }, { old: 'Status', new: 'status' }, { old: 'ReviewedBy', new: 'reviewed_by' }, { old: 'ReviewedAt', new: 'reviewed_at' }, { old: 'ReviewNotes', new: 'review_notes' }, { old: 'ExecutedBy', new: 'executed_by' }, { old: 'ExecutedAt', new: 'executed_at' }, { old: 'BeritaAcaraPath', new: 'berita_acara_path' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'mst_archive_classifications', columns: [{ old: 'ArchiveClassificationId', new: 'archive_classification_id' }, { old: 'ClassificationCode', new: 'classification_code' }, { old: 'ClassificationName', new: 'classification_name' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: docTypeTable, columns: [{ old: 'DocumentTypeId', new: 'document_type_id' }, { old: 'DocumentTypeCode', new: 'document_type_code' }, { old: 'DocumentTypeName', new: 'document_type_name' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'mst_document_categories', columns: [{ old: 'DocumentCategoryId', new: 'document_category_id' }, { old: 'ArchiveClassificationId', new: 'archive_classification_id' }, { old: 'DocumentCategoryCode', new: 'document_category_code' }, { old: 'DocumentCategoryName', new: 'document_category_name' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: 'mst_confidentiality_levels', columns: [{ old: 'ConfidentialityLevelId', new: 'confidentiality_level_id' }, { old: 'ConfidentialityLevelCode', new: 'confidentiality_level_code' }, { old: 'ConfidentialityLevelName', new: 'confidentiality_level_name' }, { old: 'ConfidentialityLevel', new: 'confidentiality_level' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] },
    { table: retentionTable, columns: [{ old: 'RetentionScheduleId', new: 'retention_schedule_id' }, { old: 'DocumentCategoryId', new: 'document_category_id' }, { old: 'RetentionCode', new: 'retention_code' }, { old: 'RetentionName', new: 'retention_name' }, { old: 'RetentionYears', new: 'retention_years' }, { old: 'RetentionAction', new: 'retention_action' }, { old: 'Description', new: 'description' }, { old: 'Status', new: 'status' }, { old: 'CreatedAt', new: 'created_at' }, { old: 'UpdatedAt', new: 'updated_at' }] }
  ];

  for (const m of migrations) {
    await knex.schema.alterTable(m.table, (table) => {
      for (const col of m.columns) {
        table.renameColumn(col.new, col.old);
      }
    });
  }
}