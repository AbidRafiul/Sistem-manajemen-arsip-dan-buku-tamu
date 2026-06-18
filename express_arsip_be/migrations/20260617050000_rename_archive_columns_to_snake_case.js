/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const docTypeTable = (await knex.schema.hasTable('mst_document_types')) ? 'mst_document_types' : 'mst_document_type';
  const retentionTable = (await knex.schema.hasTable('mst_retention_schedules')) ? 'mst_retention_schedules' : 'mst_retention_schedule';

  // 1. COPOT SEMUA FOREIGN KEY SEBELUM RENAME (Biar Knex nggak sok pintar)
  const dropFK = async (table, col) => {
    try {
      await knex.schema.alterTable(table, (t) => { t.dropForeign(col); });
    } catch (e) { /* Abaikan kalau FK sudah tidak ada/terhapus */ }
  };

  await dropFK('trx_document_versions', 'DocumentId');
  await dropFK('trx_archive_loans', 'DocumentId');
  await dropFK('trx_destruction_proposals', 'DocumentId');
  await dropFK('trx_documents', 'DocumentTypeId');
  await dropFK('trx_documents', 'DocumentCategoryId');
  await dropFK('trx_documents', 'ConfidentialityLevelId');
  await dropFK('mst_document_categories', 'ArchiveClassificationId');
  await dropFK(retentionTable, 'DocumentCategoryId');

  // 2. EKSEKUSI RENAME
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');

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
    const tableExists = await knex.schema.hasTable(m.table);
    if (tableExists) {
      for (const col of m.columns) {
        const columnNeedsRename = await knex.schema.hasColumn(m.table, col.old);
        if (columnNeedsRename) {
          try {
            await knex.schema.alterTable(m.table, (table) => { table.renameColumn(col.old, col.new); });
            console.log(`[SUKSES] ${m.table}: ${col.old} -> ${col.new}`);
          } catch(e) {}
        }
      }
    }
  }

  // 3. PASANG KEMBALI FOREIGN KEY YANG BENAR
  const addFK = async (table, col, refCol, refTable, cascade = false) => {
    try {
      await knex.schema.alterTable(table, (t) => { 
        if (cascade) {
          t.foreign(col).references(refCol).inTable(refTable).onDelete('CASCADE');
        } else {
          t.foreign(col).references(refCol).inTable(refTable);
        }
      });
      console.log(`[FK PASANG] ${table}.${col}`);
    } catch (e) { /* Abaikan kalau udah ada */ }
  };

  await addFK('mst_document_categories', 'archive_classification_id', 'archive_classification_id', 'mst_archive_classifications');
  await addFK(retentionTable, 'document_category_id', 'document_category_id', 'mst_document_categories');
  await addFK('trx_documents', 'document_type_id', 'document_type_id', docTypeTable);
  await addFK('trx_documents', 'document_category_id', 'document_category_id', 'mst_document_categories');
  await addFK('trx_documents', 'confidentiality_level_id', 'confidentiality_level_id', 'mst_confidentiality_levels');
  await addFK('trx_document_versions', 'document_id', 'document_id', 'trx_documents', true);
  await addFK('trx_archive_loans', 'document_id', 'document_id', 'trx_documents', true);
  await addFK('trx_destruction_proposals', 'document_id', 'document_id', 'trx_documents', true);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Biarkan kosong untuk rollback, karena struktur script up kita sudah idempotent
}