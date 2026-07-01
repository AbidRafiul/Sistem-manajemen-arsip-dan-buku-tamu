/**
 * Migration 1: Refactor Skema Relasi EDMS (ID Integer ke Kode String)
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const dropForeignKeysForColumn = async (knex, tableName, columnName) => {
  if (!(await knex.schema.hasTable(tableName))) return;
  const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
  try {
    if (isPostgres) {
      const result = await knex.raw(
        `
          SELECT tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ?
            AND kcu.column_name = ?
        `,
        [tableName, columnName]
      );
      for (const row of result.rows) {
        await knex.raw(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`);
      }
    } else {
      const result = await knex.raw(
        `
          SELECT CONSTRAINT_NAME
          FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND COLUMN_NAME = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `,
        [tableName, columnName]
      );
      if (result[0] && result[0].length > 0) {
        for (const row of result[0]) {
          await knex.raw("ALTER TABLE ?? DROP FOREIGN KEY ??", [tableName, row.CONSTRAINT_NAME]);
        }
      }
    }
  } catch (error) {
    console.warn(`[Migration Warning] Gagal drop FK untuk kolom ${columnName} pada ${tableName}:`, error.message);
  }
};

const ensureCodeColumn = async (knex, tableName, columnName, afterColumn) => {
  const isMySQL = knex.client.config.client === 'mysql' || knex.client.config.client === 'mysql2';
  const hasCol = await knex.schema.hasColumn(tableName, columnName);

  await knex.schema.alterTable(tableName, (table) => {
    let col;
    if (hasCol) {
      col = table.string(columnName, 255).alter();
    } else {
      col = table.string(columnName, 255).nullable();
      if (afterColumn) {
        col = col.after(afterColumn);
      }
    }

  });
};

export async function up(knex) {
  // Hapus data yatim (orphaned records) pada tabel anak sebelum migrasi relasi
  if (await knex.schema.hasTable('trx_archive_loans') && await knex.schema.hasColumn('trx_archive_loans', 'document_id')) {
    await knex.raw(`DELETE FROM trx_archive_loans WHERE document_id NOT IN (SELECT document_id FROM trx_documents)`);
  }
  if (await knex.schema.hasTable('trx_document_versions') && await knex.schema.hasColumn('trx_document_versions', 'document_id')) {
    await knex.raw(`DELETE FROM trx_document_versions WHERE document_id NOT IN (SELECT document_id FROM trx_documents)`);
  }
  if (await knex.schema.hasTable('trx_destruction_proposals') && await knex.schema.hasColumn('trx_destruction_proposals', 'document_id')) {
    await knex.raw(`DELETE FROM trx_destruction_proposals WHERE document_id NOT IN (SELECT document_id FROM trx_documents)`);
  }

  // Cleanup jika kolom document_code sudah ada tetapi tidak sinkron dengan trx_documents (akibat kegagalan run sebelumnya)
  if (await knex.schema.hasTable('trx_archive_loans') && await knex.schema.hasColumn('trx_archive_loans', 'document_code')) {
    await knex.raw(`DELETE FROM trx_archive_loans WHERE document_code IS NOT NULL AND document_code NOT IN (SELECT document_code FROM trx_documents)`);
  }
  if (await knex.schema.hasTable('trx_document_versions') && await knex.schema.hasColumn('trx_document_versions', 'document_code')) {
    await knex.raw(`DELETE FROM trx_document_versions WHERE document_code IS NOT NULL AND document_code NOT IN (SELECT document_code FROM trx_documents)`);
  }
  if (await knex.schema.hasTable('trx_destruction_proposals') && await knex.schema.hasColumn('trx_destruction_proposals', 'document_code')) {
    await knex.raw(`DELETE FROM trx_destruction_proposals WHERE document_code IS NOT NULL AND document_code NOT IN (SELECT document_code FROM trx_documents)`);
  }

  // Drop foreign key baru jika ada (proteksi re-run)
  await dropForeignKeysForColumn(knex, 'mst_document_categories', 'classification_code');
  await dropForeignKeysForColumn(knex, 'mst_retention_schedule', 'document_category_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'classification_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'document_type_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'document_category_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'confidentiality_level_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'retention_code');
  await dropForeignKeysForColumn(knex, 'trx_destruction_proposals', 'retention_code');
  
  await dropForeignKeysForColumn(knex, 'trx_archive_loans', 'document_code');
  await dropForeignKeysForColumn(knex, 'trx_document_versions', 'document_code');
  await dropForeignKeysForColumn(knex, 'trx_destruction_proposals', 'document_code');

  const isMySQL = knex.client.config.client === 'mysql' || knex.client.config.client === 'mysql2';

  // 1. Sesuaikan panjang kolom master ke 255
  await knex.schema.alterTable('mst_archive_classifications', (table) => {
    let col = table.string('classification_code', 255);
    col.alter();
  });
  await knex.schema.alterTable('mst_document_type', (table) => {
    let col = table.string('document_type_code', 255);
    col.alter();
  });
  await knex.schema.alterTable('mst_document_categories', (table) => {
    let col = table.string('document_category_code', 255);
    col.alter();
  });
  await knex.schema.alterTable('mst_confidentiality_levels', (table) => {
    let col = table.string('confidentiality_level_code', 255);
    col.alter();
  });
  await knex.schema.alterTable('mst_retention_schedule', (table) => {
    let col = table.string('retention_code', 255);
    col.alter();
  });

  // 2. Tambah kolom document_code di trx_documents (unique)
  await ensureCodeColumn(knex, 'trx_documents', 'document_code', 'document_id');

  // Paksakan isi ulang seluruh document_code agar keunikannya terjamin (menghindari residu data dari run sebelumnya)
  await knex.raw(`
    UPDATE trx_documents 
    SET document_code = CONCAT(COALESCE(NULLIF(document_number, ''), 'DOC'), '-', document_id)
  `);

  // Tambahkan unique index untuk document_code secara idempotent
  try {
    await knex.schema.alterTable('trx_documents', (table) => {
      table.dropUnique('document_code');
    });
  } catch {
    // Abaikan jika index belum ada
  }

  await knex.schema.alterTable('trx_documents', (table) => {
    table.unique('document_code');
  });

  // 3. Tambah kolom _code baru ke tabel relasi anak
  await ensureCodeColumn(knex, 'mst_document_categories', 'classification_code', 'document_category_name');
  await ensureCodeColumn(knex, 'mst_retention_schedule', 'document_category_code', 'retention_code');
  
  await ensureCodeColumn(knex, 'trx_documents', 'classification_code', 'document_code');
  await ensureCodeColumn(knex, 'trx_documents', 'document_type_code', 'classification_code');
  await ensureCodeColumn(knex, 'trx_documents', 'document_category_code', 'document_type_code');
  await ensureCodeColumn(knex, 'trx_documents', 'confidentiality_level_code', 'document_category_code');
  await ensureCodeColumn(knex, 'trx_documents', 'retention_code', 'confidentiality_level_code');
  
  await ensureCodeColumn(knex, 'trx_destruction_proposals', 'retention_code', 'proposal_reason');

  // Tambah document_code di tabel transaksi anak
  await ensureCodeColumn(knex, 'trx_archive_loans', 'document_code', 'loan_id');
  await ensureCodeColumn(knex, 'trx_document_versions', 'document_code', 'version_id');
  await ensureCodeColumn(knex, 'trx_destruction_proposals', 'document_code', 'proposal_id');

  // 4. Migrasi data relasi bertingkat dan transaksi utama
  if (await knex.schema.hasColumn('mst_document_categories', 'archive_classification_id')) {
    await knex.raw(`
      UPDATE mst_document_categories 
      SET classification_code = (
        SELECT classification_code FROM mst_archive_classifications 
        WHERE mst_archive_classifications.archive_classification_id = mst_document_categories.archive_classification_id
      ) WHERE archive_classification_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('mst_retention_schedule', 'document_category_id')) {
    await knex.raw(`
      UPDATE mst_retention_schedule 
      SET document_category_code = (
        SELECT document_category_code FROM mst_document_categories 
        WHERE mst_document_categories.document_category_id = mst_retention_schedule.document_category_id
      ) WHERE document_category_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_documents', 'archive_classification_id')) {
    await knex.raw(`
      UPDATE trx_documents 
      SET classification_code = (
        SELECT classification_code FROM mst_archive_classifications 
        WHERE mst_archive_classifications.archive_classification_id = trx_documents.archive_classification_id
      ) WHERE archive_classification_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_documents', 'document_type_id')) {
    await knex.raw(`
      UPDATE trx_documents 
      SET document_type_code = (
        SELECT document_type_code FROM mst_document_type 
        WHERE mst_document_type.document_type_id = trx_documents.document_type_id
      ) WHERE document_type_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_documents', 'document_category_id')) {
    await knex.raw(`
      UPDATE trx_documents 
      SET document_category_code = (
        SELECT document_category_code FROM mst_document_categories 
        WHERE mst_document_categories.document_category_id = trx_documents.document_category_id
      ) WHERE document_category_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_documents', 'confidentiality_level_id')) {
    await knex.raw(`
      UPDATE trx_documents 
      SET confidentiality_level_code = (
        SELECT confidentiality_level_code FROM mst_confidentiality_levels 
        WHERE mst_confidentiality_levels.confidentiality_level_id = trx_documents.confidentiality_level_id
      ) WHERE confidentiality_level_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_documents', 'retention_schedule_id')) {
    await knex.raw(`
      UPDATE trx_documents 
      SET retention_code = (
        SELECT retention_code FROM mst_retention_schedule 
        WHERE mst_retention_schedule.retention_schedule_id = trx_documents.retention_schedule_id
      ) WHERE retention_schedule_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'retention_schedule_id')) {
    await knex.raw(`
      UPDATE trx_destruction_proposals 
      SET retention_code = (
        SELECT retention_code FROM mst_retention_schedule 
        WHERE mst_retention_schedule.retention_schedule_id = trx_destruction_proposals.retention_schedule_id
      ) WHERE retention_schedule_id IS NOT NULL
    `);
  }

  // Isi data document_code di tabel anak
  if (await knex.schema.hasColumn('trx_archive_loans', 'document_id')) {
    await knex.raw(`
      UPDATE trx_archive_loans 
      SET document_code = (
        SELECT document_code FROM trx_documents 
        WHERE trx_documents.document_id = trx_archive_loans.document_id
      ) WHERE document_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_document_versions', 'document_id')) {
    await knex.raw(`
      UPDATE trx_document_versions 
      SET document_code = (
        SELECT document_code FROM trx_documents 
        WHERE trx_documents.document_id = trx_document_versions.document_id
      ) WHERE document_id IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'document_id')) {
    await knex.raw(`
      UPDATE trx_destruction_proposals 
      SET document_code = (
        SELECT document_code FROM trx_documents 
        WHERE trx_documents.document_id = trx_destruction_proposals.document_id
      ) WHERE document_id IS NOT NULL
    `);
  }

  // 5. Drop foreign key ID lama
  await dropForeignKeysForColumn(knex, 'mst_document_categories', 'archive_classification_id');
  await dropForeignKeysForColumn(knex, 'mst_retention_schedule', 'document_category_id');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'archive_classification_id');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'document_type_id');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'document_category_id');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'confidentiality_level_id');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'retention_schedule_id');
  await dropForeignKeysForColumn(knex, 'trx_destruction_proposals', 'retention_schedule_id');
  
  await dropForeignKeysForColumn(knex, 'trx_archive_loans', 'document_id');
  await dropForeignKeysForColumn(knex, 'trx_document_versions', 'document_id');
  await dropForeignKeysForColumn(knex, 'trx_destruction_proposals', 'document_id');

  // 6. Drop kolom ID lama
  if (await knex.schema.hasColumn('mst_document_categories', 'archive_classification_id')) {
    await knex.schema.alterTable('mst_document_categories', (t) => { t.dropColumn('archive_classification_id'); });
  }
  if (await knex.schema.hasColumn('mst_retention_schedule', 'document_category_id')) {
    await knex.schema.alterTable('mst_retention_schedule', (t) => { t.dropColumn('document_category_id'); });
  }
  const oldCols = ['archive_classification_id', 'document_type_id', 'document_category_id', 'confidentiality_level_id', 'retention_schedule_id'];
  for (const col of oldCols) {
    if (await knex.schema.hasColumn('trx_documents', col)) {
      await knex.schema.alterTable('trx_documents', (t) => { t.dropColumn(col); });
    }
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'retention_schedule_id')) {
    await knex.schema.alterTable('trx_destruction_proposals', (t) => { t.dropColumn('retention_schedule_id'); });
  }

  // Drop document_id dari tabel anak
  if (await knex.schema.hasColumn('trx_archive_loans', 'document_id')) {
    await knex.schema.alterTable('trx_archive_loans', (t) => { t.dropColumn('document_id'); });
  }
  if (await knex.schema.hasColumn('trx_document_versions', 'document_id')) {
    await knex.schema.alterTable('trx_document_versions', (t) => { t.dropColumn('document_id'); });
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'document_id')) {
    await knex.schema.alterTable('trx_destruction_proposals', (t) => { t.dropColumn('document_id'); });
  }

  // 7. Pasang foreign key _code baru
  await knex.schema.alterTable('mst_document_categories', (t) => {
    t.foreign('classification_code').references('classification_code').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('CASCADE');
  });
  await knex.schema.alterTable('mst_retention_schedule', (t) => {
    t.foreign('document_category_code').references('document_category_code').inTable('mst_document_categories').onDelete('NO ACTION').onUpdate('CASCADE');
  });
  await knex.schema.alterTable('trx_documents', (t) => {
    t.foreign('classification_code').references('classification_code').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('document_type_code').references('document_type_code').inTable('mst_document_type').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('document_category_code').references('document_category_code').inTable('mst_document_categories').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('confidentiality_level_code').references('confidentiality_level_code').inTable('mst_confidentiality_levels').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('retention_code').references('retention_code').inTable('mst_retention_schedule').onDelete('NO ACTION').onUpdate('CASCADE');
  });
  await knex.schema.alterTable('trx_destruction_proposals', (t) => {
    t.foreign('retention_code').references('retention_code').inTable('mst_retention_schedule').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  // FK document_code untuk tabel anak
  await knex.schema.alterTable('trx_archive_loans', (t) => {
    t.foreign('document_code').references('document_code').inTable('trx_documents').onDelete('NO ACTION').onUpdate('CASCADE');
  });
  await knex.schema.alterTable('trx_document_versions', (t) => {
    t.foreign('document_code').references('document_code').inTable('trx_documents').onDelete('NO ACTION').onUpdate('CASCADE');
  });
  await knex.schema.alterTable('trx_destruction_proposals', (t) => {
    t.foreign('document_code').references('document_code').inTable('trx_documents').onDelete('NO ACTION').onUpdate('CASCADE');
  });
}

export async function down(knex) {
  // Drop foreign key _code baru
  await dropForeignKeysForColumn(knex, 'mst_document_categories', 'classification_code');
  await dropForeignKeysForColumn(knex, 'mst_retention_schedule', 'document_category_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'classification_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'document_type_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'document_category_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'confidentiality_level_code');
  await dropForeignKeysForColumn(knex, 'trx_documents', 'retention_code');
  await dropForeignKeysForColumn(knex, 'trx_destruction_proposals', 'retention_code');

  await dropForeignKeysForColumn(knex, 'trx_archive_loans', 'document_code');
  await dropForeignKeysForColumn(knex, 'trx_document_versions', 'document_code');
  await dropForeignKeysForColumn(knex, 'trx_destruction_proposals', 'document_code');

  // Tambahkan kembali kolom ID lama
  if (!(await knex.schema.hasColumn('mst_document_categories', 'archive_classification_id'))) {
    await knex.schema.alterTable('mst_document_categories', (t) => { t.integer('archive_classification_id').unsigned().nullable().after('classification_code'); });
  }
  if (!(await knex.schema.hasColumn('mst_retention_schedule', 'document_category_id'))) {
    await knex.schema.alterTable('mst_retention_schedule', (t) => { t.integer('document_category_id').unsigned().nullable().after('document_category_code'); });
  }
  const oldColsAndAfter = [
    { name: 'archive_classification_id', after: 'classification_code' },
    { name: 'document_type_id', after: 'document_type_code' },
    { name: 'document_category_id', after: 'document_category_code' },
    { name: 'confidentiality_level_id', after: 'confidentiality_level_code' },
    { name: 'retention_schedule_id', after: 'retention_code' }
  ];
  for (const col of oldColsAndAfter) {
    if (!(await knex.schema.hasColumn('trx_documents', col.name))) {
      await knex.schema.alterTable('trx_documents', (t) => { t.integer(col.name).unsigned().nullable().after(col.after); });
    }
  }
  if (!(await knex.schema.hasColumn('trx_destruction_proposals', 'retention_schedule_id'))) {
    await knex.schema.alterTable('trx_destruction_proposals', (t) => { t.integer('retention_schedule_id').unsigned().nullable().after('retention_code'); });
  }

  // Tambah kolom document_id kembali di tabel anak
  if (!(await knex.schema.hasColumn('trx_archive_loans', 'document_id'))) {
    await knex.schema.alterTable('trx_archive_loans', (t) => { t.integer('document_id').unsigned().nullable().after('document_code'); });
  }
  if (!(await knex.schema.hasColumn('trx_document_versions', 'document_id'))) {
    await knex.schema.alterTable('trx_document_versions', (t) => { t.integer('document_id').unsigned().nullable().after('document_code'); });
  }
  if (!(await knex.schema.hasColumn('trx_destruction_proposals', 'document_id'))) {
    await knex.schema.alterTable('trx_destruction_proposals', (t) => { t.integer('document_id').unsigned().nullable().after('document_code'); });
  }

  // Restore data dari _code ke ID lama
  await knex.raw(`
    UPDATE mst_document_categories 
    SET archive_classification_id = (
      SELECT archive_classification_id FROM mst_archive_classifications 
      WHERE mst_archive_classifications.classification_code = mst_document_categories.classification_code
    ) WHERE classification_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE mst_retention_schedule 
    SET document_category_id = (
      SELECT document_category_id FROM mst_document_categories 
      WHERE mst_document_categories.document_category_code = mst_retention_schedule.document_category_code
    ) WHERE document_category_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE trx_documents 
    SET archive_classification_id = (
      SELECT archive_classification_id FROM mst_archive_classifications 
      WHERE mst_archive_classifications.classification_code = trx_documents.classification_code
    ) WHERE classification_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE trx_documents 
    SET document_type_id = (
      SELECT document_type_id FROM mst_document_type 
      WHERE mst_document_type.document_type_code = trx_documents.document_type_code
    ) WHERE document_type_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE trx_documents 
    SET document_category_id = (
      SELECT document_category_id FROM mst_document_categories 
      WHERE mst_document_categories.document_category_code = trx_documents.document_category_code
    ) WHERE document_category_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE trx_documents 
    SET confidentiality_level_id = (
      SELECT confidentiality_level_id FROM mst_confidentiality_levels 
      WHERE mst_confidentiality_levels.confidentiality_level_code = trx_documents.confidentiality_level_code
    ) WHERE confidentiality_level_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE trx_documents 
    SET retention_schedule_id = (
      SELECT retention_schedule_id FROM mst_retention_schedule 
      WHERE mst_retention_schedule.retention_code = trx_documents.retention_code
    ) WHERE retention_code IS NOT NULL
  `);
  await knex.raw(`
    UPDATE trx_destruction_proposals 
    SET retention_schedule_id = (
      SELECT retention_schedule_id FROM mst_retention_schedule 
      WHERE mst_retention_schedule.retention_code = trx_destruction_proposals.retention_code
    ) WHERE retention_code IS NOT NULL
  `);

  // Restore document_id di tabel anak dari document_code
  if (await knex.schema.hasColumn('trx_archive_loans', 'document_code')) {
    await knex.raw(`
      UPDATE trx_archive_loans 
      SET document_id = (
        SELECT document_id FROM trx_documents 
        WHERE trx_documents.document_code = trx_archive_loans.document_code
      ) WHERE document_code IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_document_versions', 'document_code')) {
    await knex.raw(`
      UPDATE trx_document_versions 
      SET document_id = (
        SELECT document_id FROM trx_documents 
        WHERE trx_documents.document_code = trx_document_versions.document_code
      ) WHERE document_code IS NOT NULL
    `);
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'document_code')) {
    await knex.raw(`
      UPDATE trx_destruction_proposals 
      SET document_id = (
        SELECT document_id FROM trx_documents 
        WHERE trx_documents.document_code = trx_destruction_proposals.document_code
      ) WHERE document_code IS NOT NULL
    `);
  }

  // Hapus kolom _code baru
  if (await knex.schema.hasColumn('mst_document_categories', 'classification_code')) {
    await knex.schema.alterTable('mst_document_categories', (t) => { t.dropColumn('classification_code'); });
  }
  if (await knex.schema.hasColumn('mst_retention_schedule', 'document_category_code')) {
    await knex.schema.alterTable('mst_retention_schedule', (t) => { t.dropColumn('document_category_code'); });
  }
  const codeCols = ['classification_code', 'document_type_code', 'document_category_code', 'confidentiality_level_code', 'retention_code'];
  for (const col of codeCols) {
    if (await knex.schema.hasColumn('trx_documents', col)) {
      await knex.schema.alterTable('trx_documents', (t) => { t.dropColumn(col); });
    }
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'retention_code')) {
    await knex.schema.alterTable('trx_destruction_proposals', (t) => { t.dropColumn('retention_code'); });
  }

  // Hapus document_code dari tabel anak
  if (await knex.schema.hasColumn('trx_archive_loans', 'document_code')) {
    await knex.schema.alterTable('trx_archive_loans', (t) => { t.dropColumn('document_code'); });
  }
  if (await knex.schema.hasColumn('trx_document_versions', 'document_code')) {
    await knex.schema.alterTable('trx_document_versions', (t) => { t.dropColumn('document_code'); });
  }
  if (await knex.schema.hasColumn('trx_destruction_proposals', 'document_code')) {
    await knex.schema.alterTable('trx_destruction_proposals', (t) => { t.dropColumn('document_code'); });
  }

  // Hapus unique index & kolom document_code dari trx_documents
  if (await knex.schema.hasColumn('trx_documents', 'document_code')) {
    try {
      await knex.schema.alterTable('trx_documents', (table) => {
        table.dropUnique('document_code');
      });
    } catch {
      // Ignore
    }
    await knex.schema.alterTable('trx_documents', (t) => { t.dropColumn('document_code'); });
  }

  // Pasang kembali foreign key ID lama
  await knex.schema.alterTable('mst_document_categories', (t) => {
    t.foreign('archive_classification_id').references('archive_classification_id').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('NO ACTION');
  });
  await knex.schema.alterTable('mst_retention_schedule', (t) => {
    t.foreign('document_category_id').references('document_category_id').inTable('mst_document_categories').onDelete('NO ACTION').onUpdate('NO ACTION');
  });
  await knex.schema.alterTable('trx_documents', (t) => {
    t.foreign('archive_classification_id').references('archive_classification_id').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('NO ACTION');
    t.foreign('document_type_id').references('document_type_id').inTable('mst_document_type').onDelete('NO ACTION').onUpdate('NO ACTION');
    t.foreign('document_category_id').references('document_category_id').inTable('mst_document_categories').onDelete('NO ACTION').onUpdate('NO ACTION');
    t.foreign('confidentiality_level_id').references('confidentiality_level_id').inTable('mst_confidentiality_levels').onDelete('NO ACTION').onUpdate('NO ACTION');
    t.foreign('retention_schedule_id').references('retention_schedule_id').inTable('mst_retention_schedule').onDelete('NO ACTION').onUpdate('NO ACTION');
  });
  await knex.schema.alterTable('trx_destruction_proposals', (t) => {
    t.foreign('retention_schedule_id').references('retention_schedule_id').inTable('mst_retention_schedule').onDelete('NO ACTION').onUpdate('NO ACTION');
  });

  // Recreate ID constraints untuk versi & usulan (loan tidak ada constraint di awal)
  await knex.schema.alterTable('trx_document_versions', (t) => {
    t.foreign('document_id').references('document_id').inTable('trx_documents').onDelete('CASCADE').onUpdate('NO ACTION');
  });
  await knex.schema.alterTable('trx_destruction_proposals', (t) => {
    t.foreign('document_id').references('document_id').inTable('trx_documents').onDelete('CASCADE').onUpdate('NO ACTION');
  });

  // Kembalikan panjang kolom master ke 45
  await knex.schema.alterTable('mst_archive_classifications', (table) => { table.string('classification_code', 45).alter(); });
  await knex.schema.alterTable('mst_document_type', (table) => { table.string('document_type_code', 45).alter(); });
  await knex.schema.alterTable('mst_document_categories', (table) => { table.string('document_category_code', 45).alter(); });
  await knex.schema.alterTable('mst_confidentiality_levels', (table) => { table.string('confidentiality_level_code', 45).alter(); });
  await knex.schema.alterTable('mst_retention_schedule', (table) => { table.string('retention_code', 45).alter(); });
}
