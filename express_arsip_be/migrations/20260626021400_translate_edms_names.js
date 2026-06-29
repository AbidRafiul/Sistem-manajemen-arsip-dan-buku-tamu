/**
 * Migration 3: Translasi Skema EDMS ke Bahasa Indonesia & Ganti trx_* ke trs_*
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const dropAllForeignKeysOnTable = async (knex, tableName) => {
  if (!(await knex.schema.hasTable(tableName))) return;
  const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
  try {
    if (isPostgres) {
      const result = await knex.raw(
        `
          SELECT tc.constraint_name
          FROM information_schema.table_constraints tc
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ?
        `,
        [tableName]
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
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `,
        [tableName]
      );
      if (result[0] && result[0].length > 0) {
        for (const row of result[0]) {
          await knex.raw("ALTER TABLE ?? DROP FOREIGN KEY ??", [tableName, row.CONSTRAINT_NAME]);
        }
      }
    }
  } catch (error) {
    console.warn(`[Migration Warning] Gagal drop FK untuk tabel ${tableName}:`, error.message);
  }
};

const dropForeignKeysReferencingTable = async (knex, referencedTableName) => {
  if (!(await knex.schema.hasTable(referencedTableName))) return;
  const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
  try {
    if (isPostgres) {
      const result = await knex.raw(
        `
          SELECT tc.table_name, tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = ?
        `,
        [referencedTableName]
      );
      for (const row of result.rows) {
        await knex.raw(`ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`);
      }
    } else {
      const result = await knex.raw(
        `
          SELECT TABLE_NAME, CONSTRAINT_NAME
          FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME = ?
        `,
        [referencedTableName]
      );
      if (result[0] && result[0].length > 0) {
        for (const row of result[0]) {
          await knex.raw("ALTER TABLE ?? DROP FOREIGN KEY ??", [row.TABLE_NAME, row.CONSTRAINT_NAME]);
        }
      }
    }
  } catch (error) {
    console.warn(`[Migration Warning] Gagal drop FK referencing ${referencedTableName}:`, error.message);
  }
};

const renameTableIfExists = async (knex, oldTable, newTable) => {
  const hasOld = await knex.schema.hasTable(oldTable);
  const hasNew = await knex.schema.hasTable(newTable);
  if (hasOld && !hasNew) {
    await knex.schema.renameTable(oldTable, newTable);
  }
};

const renameColumnIfExists = async (knex, oldTable, newTable, oldCol, newCol) => {
  let activeTable = null;
  if (await knex.schema.hasTable(newTable)) {
    activeTable = newTable;
  } else if (await knex.schema.hasTable(oldTable)) {
    activeTable = oldTable;
  }

  if (activeTable) {
    if (await knex.schema.hasColumn(activeTable, oldCol)) {
      await knex.schema.alterTable(activeTable, (table) => {
        table.renameColumn(oldCol, newCol);
      });
    }
  }
};

export async function up(knex) {
  // 1. Drop semua foreign key yang ada (baik nama lama maupun baru untuk idempotensi)
  const allTables = [
    'trx_documents', 'trs_dokumen',
    'trx_archive_loans', 'trs_peminjaman_arsip',
    'trx_document_versions', 'trs_versi_dokumen',
    'trx_destruction_proposals', 'trs_usulan_pemusnahan',
    'mst_document_categories', 'mst_kategori_dokumen',
    'mst_retention_schedule', 'mst_jadwal_retensi',
    'trx_incoming_letters', 'trs_surat_masuk'
  ];

  for (const t of allTables) {
    await dropAllForeignKeysOnTable(knex, t);
  }

  const allMasterTables = [
    'mst_archive_classifications', 'mst_klasifikasi_arsip',
    'mst_document_type', 'mst_jenis_dokumen',
    'mst_document_categories', 'mst_kategori_dokumen',
    'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan',
    'mst_retention_schedule', 'mst_jadwal_retensi',
    'trx_documents', 'trs_dokumen'
  ];

  for (const mt of allMasterTables) {
    await dropForeignKeysReferencingTable(knex, mt);
  }

  // 2. Rename Columns (dari nama Inggris ke Indonesia)
  // mst_archive_classifications
  await renameColumnIfExists(knex, 'mst_archive_classifications', 'mst_klasifikasi_arsip', 'archive_classification_id', 'id_klasifikasi');
  await renameColumnIfExists(knex, 'mst_archive_classifications', 'mst_klasifikasi_arsip', 'classification_code', 'kode_klasifikasi');
  await renameColumnIfExists(knex, 'mst_archive_classifications', 'mst_klasifikasi_arsip', 'classification_name', 'nama_klasifikasi');
  await renameColumnIfExists(knex, 'mst_archive_classifications', 'mst_klasifikasi_arsip', 'description', 'deskripsi');


  // mst_document_type
  await renameColumnIfExists(knex, 'mst_document_type', 'mst_jenis_dokumen', 'document_type_id', 'id_jenis_dokumen');
  await renameColumnIfExists(knex, 'mst_document_type', 'mst_jenis_dokumen', 'document_type_code', 'kode_jenis_dokumen');
  await renameColumnIfExists(knex, 'mst_document_type', 'mst_jenis_dokumen', 'document_type_name', 'nama_jenis_dokumen');
  await renameColumnIfExists(knex, 'mst_document_type', 'mst_jenis_dokumen', 'description', 'deskripsi');


  // mst_document_categories
  await renameColumnIfExists(knex, 'mst_document_categories', 'mst_kategori_dokumen', 'document_category_id', 'id_kategori_dokumen');
  await renameColumnIfExists(knex, 'mst_document_categories', 'mst_kategori_dokumen', 'classification_code', 'kode_klasifikasi');
  await renameColumnIfExists(knex, 'mst_document_categories', 'mst_kategori_dokumen', 'document_category_code', 'kode_kategori_dokumen');
  await renameColumnIfExists(knex, 'mst_document_categories', 'mst_kategori_dokumen', 'document_category_name', 'nama_kategori_dokumen');
  await renameColumnIfExists(knex, 'mst_document_categories', 'mst_kategori_dokumen', 'description', 'deskripsi');


  // mst_confidentiality_levels
  await renameColumnIfExists(knex, 'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan', 'confidentiality_level_id', 'id_tingkat_kerahasiaan');
  await renameColumnIfExists(knex, 'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan', 'confidentiality_level_code', 'kode_tingkat_kerahasiaan');
  await renameColumnIfExists(knex, 'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan', 'confidentiality_level_name', 'nama_tingkat_kerahasiaan');
  await renameColumnIfExists(knex, 'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan', 'confidentiality_level', 'tingkat_kerahasiaan');
  await renameColumnIfExists(knex, 'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan', 'description', 'deskripsi');


  // mst_retention_schedule
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'retention_schedule_id', 'id_jadwal_retensi');
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'document_category_code', 'kode_kategori_dokumen');
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'retention_code', 'kode_retensi');
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'retention_name', 'nama_retensi');
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'retention_years', 'tahun_retensi');
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'retention_action', 'tindakan_retensi');
  await renameColumnIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi', 'description', 'deskripsi');


  // trx_documents
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_id', 'id_dokumen');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_code', 'kode_dokumen');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_name', 'nama_dokumen');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_number', 'nomor_dokumen');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_date', 'tanggal');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'expired_date', 'tanggal_kedaluwarsa');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'pic_name', 'nama_pic');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'physical_location', 'lokasi_fisik');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'qr_code', 'qr_code');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'tags', 'tags');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'status', 'status');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'classification_code', 'kode_klasifikasi');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_type_code', 'kode_jenis_dokumen');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'document_category_code', 'kode_kategori_dokumen');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'confidentiality_level_code', 'kode_tingkat_kerahasiaan');
  await renameColumnIfExists(knex, 'trx_documents', 'trs_dokumen', 'retention_code', 'kode_retensi');


  // trx_archive_loans
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'loan_id', 'id_peminjaman');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'document_code', 'kode_dokumen');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'borrower_name', 'nama_peminjam');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'loan_date', 'tanggal_pinjam');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'expected_return_date', 'tanggal_pengembalian');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'return_date', 'tanggal_kembali');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'purpose', 'keperluan');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'approved_by', 'disetujui_oleh');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'approved_at', 'disetujui_pada');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'approval_notes', 'catatan_persetujuan');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'is_overdue', 'terlambat');
  await renameColumnIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip', 'status', 'status');


  // trx_document_versions
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'version_id', 'id_versi');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'document_code', 'kode_dokumen');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'version_number', 'nomor_versi');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'change_notes', 'catatan_perubahan');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'file_path', 'file_path');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'uploaded_by', 'diunggah_oleh');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'approval_status', 'status_persetujuan');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'approved_by', 'disetujui_oleh');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'approved_at', 'disetujui_pada');
  await renameColumnIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen', 'approval_notes', 'catatan_persetujuan');


  // trx_destruction_proposals
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'proposal_id', 'id_usulan');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'document_code', 'kode_dokumen');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'proposal_reason', 'alasan_usulan');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'proposed_by', 'diusulkan_oleh');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'proposed_at', 'diusulkan_pada');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'status', 'status');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'reviewed_by', 'ditinjau_oleh');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'reviewed_at', 'ditinjau_pada');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'review_notes', 'catatan_tinjauan');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'executed_by', 'dieksekusi_oleh');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'executed_at', 'dieksekusi_pada');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'berita_acara_path', 'file_berita_acara');
  await renameColumnIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan', 'retention_code', 'kode_retensi');


  // 3. Rename Tables
  await renameTableIfExists(knex, 'mst_archive_classifications', 'mst_klasifikasi_arsip');
  await renameTableIfExists(knex, 'mst_document_type', 'mst_jenis_dokumen');
  await renameTableIfExists(knex, 'mst_document_categories', 'mst_kategori_dokumen');
  await renameTableIfExists(knex, 'mst_confidentiality_levels', 'mst_tingkat_kerahasiaan');
  await renameTableIfExists(knex, 'mst_retention_schedule', 'mst_jadwal_retensi');
  await renameTableIfExists(knex, 'trx_documents', 'trs_dokumen');
  await renameTableIfExists(knex, 'trx_archive_loans', 'trs_peminjaman_arsip');
  await renameTableIfExists(knex, 'trx_document_versions', 'trs_versi_dokumen');
  await renameTableIfExists(knex, 'trx_destruction_proposals', 'trs_usulan_pemusnahan');

  // 4. CLEANUP DATA ORPHAN UNTUK MEMASTIKAN FOREIGN KEY BISA DIBUAT
  if (await knex.schema.hasColumn('mst_kategori_dokumen', 'kode_klasifikasi')) {
    await knex.raw(`
      UPDATE mst_kategori_dokumen
      SET kode_klasifikasi = NULL
      WHERE kode_klasifikasi IS NOT NULL
        AND kode_klasifikasi NOT IN (SELECT kode_klasifikasi FROM mst_klasifikasi_arsip)
    `);
  }

  if (await knex.schema.hasColumn('mst_jadwal_retensi', 'kode_kategori_dokumen')) {
    await knex.raw(`
      UPDATE mst_jadwal_retensi
      SET kode_kategori_dokumen = NULL
      WHERE kode_kategori_dokumen IS NOT NULL
        AND kode_kategori_dokumen NOT IN (SELECT kode_kategori_dokumen FROM mst_kategori_dokumen)
    `);
  }

  if (await knex.schema.hasColumn('trs_dokumen', 'kode_klasifikasi')) {
    await knex.raw(`
      UPDATE trs_dokumen
      SET kode_klasifikasi = NULL
      WHERE kode_klasifikasi IS NOT NULL
        AND kode_klasifikasi NOT IN (SELECT kode_klasifikasi FROM mst_klasifikasi_arsip)
    `);
  }

  if (await knex.schema.hasColumn('trs_dokumen', 'kode_jenis_dokumen')) {
    await knex.raw(`
      UPDATE trs_dokumen
      SET kode_jenis_dokumen = NULL
      WHERE kode_jenis_dokumen IS NOT NULL
        AND kode_jenis_dokumen NOT IN (SELECT kode_jenis_dokumen FROM mst_jenis_dokumen)
    `);
  }

  if (await knex.schema.hasColumn('trs_dokumen', 'kode_kategori_dokumen')) {
    await knex.raw(`
      UPDATE trs_dokumen
      SET kode_kategori_dokumen = NULL
      WHERE kode_kategori_dokumen IS NOT NULL
        AND kode_kategori_dokumen NOT IN (SELECT kode_kategori_dokumen FROM mst_kategori_dokumen)
    `);
  }

  if (await knex.schema.hasColumn('trs_dokumen', 'kode_tingkat_kerahasiaan')) {
    await knex.raw(`
      UPDATE trs_dokumen
      SET kode_tingkat_kerahasiaan = NULL
      WHERE kode_tingkat_kerahasiaan IS NOT NULL
        AND kode_tingkat_kerahasiaan NOT IN (SELECT kode_tingkat_kerahasiaan FROM mst_tingkat_kerahasiaan)
    `);
  }

  if (await knex.schema.hasColumn('trs_dokumen', 'kode_retensi')) {
    await knex.raw(`
      UPDATE trs_dokumen
      SET kode_retensi = NULL
      WHERE kode_retensi IS NOT NULL
        AND kode_retensi NOT IN (SELECT kode_retensi FROM mst_jadwal_retensi)
    `);
  }

  // Hapus baris peminjaman, versi, usulan yang merujuk ke dokumen non-existent berdasarkan kode_dokumen
  if (await knex.schema.hasColumn('trs_peminjaman_arsip', 'kode_dokumen')) {
    await knex.raw(`
      DELETE FROM trs_peminjaman_arsip
      WHERE kode_dokumen NOT IN (SELECT kode_dokumen FROM trs_dokumen)
    `);
  }

  if (await knex.schema.hasColumn('trs_versi_dokumen', 'kode_dokumen')) {
    await knex.raw(`
      DELETE FROM trs_versi_dokumen
      WHERE kode_dokumen NOT IN (SELECT kode_dokumen FROM trs_dokumen)
    `);
  }

  if (await knex.schema.hasColumn('trs_usulan_pemusnahan', 'kode_dokumen')) {
    await knex.raw(`
      DELETE FROM trs_usulan_pemusnahan
      WHERE kode_dokumen NOT IN (SELECT kode_dokumen FROM trs_dokumen)
    `);
  }

  if (await knex.schema.hasColumn('trs_usulan_pemusnahan', 'kode_retensi')) {
    await knex.raw(`
      UPDATE trs_usulan_pemusnahan
      SET kode_retensi = NULL
      WHERE kode_retensi IS NOT NULL
        AND kode_retensi NOT IN (SELECT kode_retensi FROM mst_jadwal_retensi)
    `);
  }

  if (await knex.schema.hasTable('trs_surat_masuk')) {
    if (await knex.schema.hasColumn('trs_surat_masuk', 'jenis_dokumen_id')) {
      await knex.raw(`
        UPDATE trs_surat_masuk
        SET jenis_dokumen_id = NULL
        WHERE jenis_dokumen_id IS NOT NULL
          AND jenis_dokumen_id NOT IN (SELECT id_jenis_dokumen FROM mst_jenis_dokumen)
      `);
    }
    if (await knex.schema.hasColumn('trs_surat_masuk', 'klasifikasi_arsip_id')) {
      await knex.raw(`
        UPDATE trs_surat_masuk
        SET klasifikasi_arsip_id = NULL
        WHERE klasifikasi_arsip_id IS NOT NULL
          AND klasifikasi_arsip_id NOT IN (SELECT id_klasifikasi FROM mst_klasifikasi_arsip)
      `);
    }
    if (await knex.schema.hasColumn('trs_surat_masuk', 'tingkat_kerahasiaan_id')) {
      await knex.raw(`
        UPDATE trs_surat_masuk
        SET tingkat_kerahasiaan_id = NULL
        WHERE tingkat_kerahasiaan_id IS NOT NULL
          AND tingkat_kerahasiaan_id NOT IN (SELECT id_tingkat_kerahasiaan FROM mst_tingkat_kerahasiaan)
      `);
    }
  } else if (await knex.schema.hasTable('trx_incoming_letters')) {
    if (await knex.schema.hasColumn('trx_incoming_letters', 'document_type_id')) {
      await knex.raw(`
        UPDATE trx_incoming_letters
        SET document_type_id = NULL
        WHERE document_type_id IS NOT NULL
          AND document_type_id NOT IN (SELECT id_jenis_dokumen FROM mst_jenis_dokumen)
      `);
    }
    if (await knex.schema.hasColumn('trx_incoming_letters', 'archive_classification_id')) {
      await knex.raw(`
        UPDATE trx_incoming_letters
        SET archive_classification_id = NULL
        WHERE archive_classification_id IS NOT NULL
          AND archive_classification_id NOT IN (SELECT id_klasifikasi FROM mst_klasifikasi_arsip)
      `);
    }
    if (await knex.schema.hasColumn('trx_incoming_letters', 'confidentiality_level_id')) {
      await knex.raw(`
        UPDATE trx_incoming_letters
        SET confidentiality_level_id = NULL
        WHERE confidentiality_level_id IS NOT NULL
          AND confidentiality_level_id NOT IN (SELECT id_tingkat_kerahasiaan FROM mst_tingkat_kerahasiaan)
      `);
    }
  }

  // 5. Recreate Foreign Key Constraints pointing to new tables & columns
  await knex.schema.alterTable('mst_kategori_dokumen', (t) => {
    t.foreign('kode_klasifikasi').references('kode_klasifikasi').inTable('mst_klasifikasi_arsip').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('mst_jadwal_retensi', (t) => {
    t.foreign('kode_kategori_dokumen').references('kode_kategori_dokumen').inTable('mst_kategori_dokumen').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('trs_dokumen', (t) => {
    t.foreign('kode_klasifikasi').references('kode_klasifikasi').inTable('mst_klasifikasi_arsip').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('kode_jenis_dokumen').references('kode_jenis_dokumen').inTable('mst_jenis_dokumen').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('kode_kategori_dokumen').references('kode_kategori_dokumen').inTable('mst_kategori_dokumen').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('kode_tingkat_kerahasiaan').references('kode_tingkat_kerahasiaan').inTable('mst_tingkat_kerahasiaan').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('kode_retensi').references('kode_retensi').inTable('mst_jadwal_retensi').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('trs_peminjaman_arsip', (t) => {
    t.foreign('kode_dokumen').references('kode_dokumen').inTable('trs_dokumen').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('trs_versi_dokumen', (t) => {
    t.foreign('kode_dokumen').references('kode_dokumen').inTable('trs_dokumen').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('trs_usulan_pemusnahan', (t) => {
    t.foreign('kode_dokumen').references('kode_dokumen').inTable('trs_dokumen').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('kode_retensi').references('kode_retensi').inTable('mst_jadwal_retensi').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  // Untuk incoming letters, pasang FK menunjuk ke PK master table baru
  if (await knex.schema.hasTable('trs_surat_masuk')) {
    await knex.schema.alterTable('trs_surat_masuk', (t) => {
      t.foreign('jenis_dokumen_id').references('id_jenis_dokumen').inTable('mst_jenis_dokumen').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('klasifikasi_arsip_id').references('id_klasifikasi').inTable('mst_klasifikasi_arsip').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('tingkat_kerahasiaan_id').references('id_tingkat_kerahasiaan').inTable('mst_tingkat_kerahasiaan').onDelete('NO ACTION').onUpdate('NO ACTION');
    });
  } else if (await knex.schema.hasTable('trx_incoming_letters')) {
    await knex.schema.alterTable('trx_incoming_letters', (t) => {
      t.foreign('document_type_id').references('id_jenis_dokumen').inTable('mst_jenis_dokumen').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('archive_classification_id').references('id_klasifikasi').inTable('mst_klasifikasi_arsip').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('confidentiality_level_id').references('id_tingkat_kerahasiaan').inTable('mst_tingkat_kerahasiaan').onDelete('NO ACTION').onUpdate('NO ACTION');
    });
  }
}

export async function down(knex) {
  // 1. Drop semua foreign key baru
  const newTables = [
    'trs_dokumen', 'trx_documents',
    'trs_peminjaman_arsip', 'trx_archive_loans',
    'trs_versi_dokumen', 'trx_document_versions',
    'trs_usulan_pemusnahan', 'trx_destruction_proposals',
    'mst_kategori_dokumen', 'mst_document_categories',
    'mst_jadwal_retensi', 'mst_retention_schedule',
    'trx_incoming_letters', 'trs_surat_masuk'
  ];

  for (const t of newTables) {
    await dropAllForeignKeysOnTable(knex, t);
  }

  const allTranslatedMasterTables = [
    'mst_klasifikasi_arsip', 'mst_archive_classifications',
    'mst_jenis_dokumen', 'mst_document_type',
    'mst_kategori_dokumen', 'mst_document_categories',
    'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels',
    'mst_jadwal_retensi', 'mst_retention_schedule',
    'trs_dokumen', 'trx_documents'
  ];

  for (const mt of allTranslatedMasterTables) {
    await dropForeignKeysReferencingTable(knex, mt);
  }

  // 2. Rename Columns (dari Indonesia kembali ke Inggris)
  // mst_klasifikasi_arsip / mst_archive_classifications
  await renameColumnIfExists(knex, 'mst_klasifikasi_arsip', 'mst_archive_classifications', 'id_klasifikasi', 'archive_classification_id');
  await renameColumnIfExists(knex, 'mst_klasifikasi_arsip', 'mst_archive_classifications', 'kode_klasifikasi', 'classification_code');
  await renameColumnIfExists(knex, 'mst_klasifikasi_arsip', 'mst_archive_classifications', 'nama_klasifikasi', 'classification_name');
  await renameColumnIfExists(knex, 'mst_klasifikasi_arsip', 'mst_archive_classifications', 'deskripsi', 'description');


  // mst_jenis_dokumen / mst_document_type
  await renameColumnIfExists(knex, 'mst_jenis_dokumen', 'mst_document_type', 'id_jenis_dokumen', 'document_type_id');
  await renameColumnIfExists(knex, 'mst_jenis_dokumen', 'mst_document_type', 'kode_jenis_dokumen', 'document_type_code');
  await renameColumnIfExists(knex, 'mst_jenis_dokumen', 'mst_document_type', 'nama_jenis_dokumen', 'document_type_name');
  await renameColumnIfExists(knex, 'mst_jenis_dokumen', 'mst_document_type', 'deskripsi', 'description');


  // mst_kategori_dokumen / mst_document_categories
  await renameColumnIfExists(knex, 'mst_kategori_dokumen', 'mst_document_categories', 'id_kategori_dokumen', 'document_category_id');
  await renameColumnIfExists(knex, 'mst_kategori_dokumen', 'mst_document_categories', 'kode_klasifikasi', 'classification_code');
  await renameColumnIfExists(knex, 'mst_kategori_dokumen', 'mst_document_categories', 'kode_kategori_dokumen', 'document_category_code');
  await renameColumnIfExists(knex, 'mst_kategori_dokumen', 'mst_document_categories', 'nama_kategori_dokumen', 'document_category_name');
  await renameColumnIfExists(knex, 'mst_kategori_dokumen', 'mst_document_categories', 'deskripsi', 'description');


  // mst_tingkat_kerahasiaan / mst_confidentiality_levels
  await renameColumnIfExists(knex, 'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels', 'id_tingkat_kerahasiaan', 'confidentiality_level_id');
  await renameColumnIfExists(knex, 'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels', 'kode_tingkat_kerahasiaan', 'confidentiality_level_code');
  await renameColumnIfExists(knex, 'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels', 'nama_tingkat_kerahasiaan', 'confidentiality_level_name');
  await renameColumnIfExists(knex, 'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels', 'tingkat_kerahasiaan', 'confidentiality_level');
  await renameColumnIfExists(knex, 'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels', 'deskripsi', 'description');


  // mst_jadwal_retensi / mst_retention_schedule
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'id_jadwal_retensi', 'retention_schedule_id');
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'kode_kategori_dokumen', 'document_category_code');
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'kode_retensi', 'retention_code');
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'nama_retensi', 'retention_name');
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'tahun_retensi', 'retention_years');
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'tindakan_retensi', 'retention_action');
  await renameColumnIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule', 'deskripsi', 'description');


  // trs_dokumen / trx_documents
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'id_dokumen', 'document_id');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'kode_dokumen', 'document_code');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'nama_dokumen', 'document_name');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'nomor_dokumen', 'document_number');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'tanggal', 'document_date');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'tanggal_kedaluwarsa', 'expired_date');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'nama_pic', 'pic_name');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'lokasi_fisik', 'physical_location');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'qr_code', 'qr_code');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'tags', 'tags');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'status', 'status');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'kode_klasifikasi', 'classification_code');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'kode_jenis_dokumen', 'document_type_code');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'kode_kategori_dokumen', 'document_category_code');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'kode_tingkat_kerahasiaan', 'confidentiality_level_code');
  await renameColumnIfExists(knex, 'trs_dokumen', 'trx_documents', 'kode_retensi', 'retention_code');


  // trs_peminjaman_arsip / trx_archive_loans
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'id_peminjaman', 'loan_id');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'kode_dokumen', 'document_code');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'nama_peminjam', 'borrower_name');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'tanggal_pinjam', 'loan_date');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'tanggal_pengembalian', 'expected_return_date');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'tanggal_kembali', 'return_date');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'keperluan', 'purpose');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'disetujui_oleh', 'approved_by');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'disetujui_pada', 'approved_at');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'catatan_persetujuan', 'approval_notes');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'terlambat', 'is_overdue');
  await renameColumnIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans', 'status', 'status');


  // trs_versi_dokumen / trx_document_versions
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'id_versi', 'version_id');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'kode_dokumen', 'document_code');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'nomor_versi', 'version_number');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'catatan_perubahan', 'change_notes');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'file_path', 'file_path');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'diunggah_oleh', 'uploaded_by');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'status_persetujuan', 'approval_status');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'disetujui_oleh', 'approved_by');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'disetujui_pada', 'approved_at');
  await renameColumnIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions', 'catatan_persetujuan', 'approval_notes');


  // trs_usulan_pemusnahan / trx_destruction_proposals
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'id_usulan', 'proposal_id');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'kode_dokumen', 'document_code');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'alasan_usulan', 'proposal_reason');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'diusulkan_oleh', 'proposed_by');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'diusulkan_pada', 'proposed_at');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'status', 'status');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'ditinjau_oleh', 'reviewed_by');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'ditinjau_pada', 'reviewed_at');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'catatan_tinjauan', 'review_notes');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'dieksekusi_oleh', 'executed_by');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'dieksekusi_pada', 'executed_at');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'file_berita_acara', 'berita_acara_path');
  await renameColumnIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals', 'kode_retensi', 'retention_code');


  // 3. Rename Tables back to English
  await renameTableIfExists(knex, 'mst_klasifikasi_arsip', 'mst_archive_classifications');
  await renameTableIfExists(knex, 'mst_jenis_dokumen', 'mst_document_type');
  await renameTableIfExists(knex, 'mst_kategori_dokumen', 'mst_document_categories');
  await renameTableIfExists(knex, 'mst_tingkat_kerahasiaan', 'mst_confidentiality_levels');
  await renameTableIfExists(knex, 'mst_jadwal_retensi', 'mst_retention_schedule');
  await renameTableIfExists(knex, 'trs_dokumen', 'trx_documents');
  await renameTableIfExists(knex, 'trs_peminjaman_arsip', 'trx_archive_loans');
  await renameTableIfExists(knex, 'trs_versi_dokumen', 'trx_document_versions');
  await renameTableIfExists(knex, 'trs_usulan_pemusnahan', 'trx_destruction_proposals');

  // 4. CLEANUP DATA ORPHAN UNTUK ROLLBACK
  if (await knex.schema.hasColumn('mst_document_categories', 'archive_classification_id')) {
    await knex.raw(`
      UPDATE mst_document_categories
      SET archive_classification_id = NULL
      WHERE archive_classification_id IS NOT NULL
        AND archive_classification_id NOT IN (SELECT archive_classification_id FROM mst_archive_classifications)
    `);
  }

  if (await knex.schema.hasColumn('mst_retention_schedule', 'document_category_id')) {
    await knex.raw(`
      UPDATE mst_retention_schedule
      SET document_category_id = NULL
      WHERE document_category_id IS NOT NULL
        AND document_category_id NOT IN (SELECT document_category_id FROM mst_document_categories)
    `);
  }

  if (await knex.schema.hasColumn('trx_documents', 'archive_classification_id')) {
    await knex.raw(`
      UPDATE trx_documents
      SET archive_classification_id = NULL
      WHERE archive_classification_id IS NOT NULL
        AND archive_classification_id NOT IN (SELECT archive_classification_id FROM mst_archive_classifications)
    `);
  }

  if (await knex.schema.hasColumn('trx_documents', 'document_type_id')) {
    await knex.raw(`
      UPDATE trx_documents
      SET document_type_id = NULL
      WHERE document_type_id IS NOT NULL
        AND document_type_id NOT IN (SELECT document_type_id FROM mst_document_type)
    `);
  }

  if (await knex.schema.hasColumn('trx_documents', 'document_category_id')) {
    await knex.raw(`
      UPDATE trx_documents
      SET document_category_id = NULL
      WHERE document_category_id IS NOT NULL
        AND document_category_id NOT IN (SELECT document_category_id FROM mst_document_categories)
    `);
  }

  if (await knex.schema.hasColumn('trx_documents', 'confidentiality_level_id')) {
    await knex.raw(`
      UPDATE trx_documents
      SET confidentiality_level_id = NULL
      WHERE confidentiality_level_id IS NOT NULL
        AND confidentiality_level_id NOT IN (SELECT confidentiality_level_id FROM mst_confidentiality_levels)
    `);
  }

  if (await knex.schema.hasColumn('trx_documents', 'retention_schedule_id')) {
    await knex.raw(`
      UPDATE trx_documents
      SET retention_schedule_id = NULL
      WHERE retention_schedule_id IS NOT NULL
        AND retention_schedule_id NOT IN (SELECT retention_schedule_id FROM mst_retention_schedule)
    `);
  }

  // Hapus data yatim berdasarkan document_code sebelum membuat foreign key kembali ke trx_documents
  if (await knex.schema.hasColumn('trx_archive_loans', 'document_code')) {
    await knex.raw(`
      DELETE FROM trx_archive_loans
      WHERE document_code NOT IN (SELECT document_code FROM trx_documents)
    `);
  }

  if (await knex.schema.hasColumn('trx_document_versions', 'document_code')) {
    await knex.raw(`
      DELETE FROM trx_document_versions
      WHERE document_code NOT IN (SELECT document_code FROM trx_documents)
    `);
  }

  if (await knex.schema.hasColumn('trx_destruction_proposals', 'document_code')) {
    await knex.raw(`
      DELETE FROM trx_destruction_proposals
      WHERE document_code NOT IN (SELECT document_code FROM trx_documents)
    `);
  }

  if (await knex.schema.hasColumn('trx_destruction_proposals', 'retention_schedule_id')) {
    await knex.raw(`
      UPDATE trx_destruction_proposals
      SET retention_schedule_id = NULL
      WHERE retention_schedule_id IS NOT NULL
        AND retention_schedule_id NOT IN (SELECT retention_schedule_id FROM mst_retention_schedule)
    `);
  }

  if (await knex.schema.hasTable('trx_incoming_letters')) {
    if (await knex.schema.hasColumn('trx_incoming_letters', 'document_type_id')) {
      await knex.raw(`
        UPDATE trx_incoming_letters
        SET document_type_id = NULL
        WHERE document_type_id IS NOT NULL
          AND document_type_id NOT IN (SELECT document_type_id FROM mst_document_type)
      `);
    }
    if (await knex.schema.hasColumn('trx_incoming_letters', 'archive_classification_id')) {
      await knex.raw(`
        UPDATE trx_incoming_letters
        SET archive_classification_id = NULL
        WHERE archive_classification_id IS NOT NULL
          AND archive_classification_id NOT IN (SELECT archive_classification_id FROM mst_archive_classifications)
      `);
    }
    if (await knex.schema.hasColumn('trx_incoming_letters', 'confidentiality_level_id')) {
      await knex.raw(`
        UPDATE trx_incoming_letters
        SET confidentiality_level_id = NULL
        WHERE confidentiality_level_id IS NOT NULL
          AND confidentiality_level_id NOT IN (SELECT confidentiality_level_id FROM mst_confidentiality_levels)
      `);
    }
  }

  // 5. Recreate English Foreign Key Constraints
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

  await knex.schema.alterTable('trx_archive_loans', (t) => {
    t.foreign('document_code').references('document_code').inTable('trx_documents').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('trx_document_versions', (t) => {
    t.foreign('document_code').references('document_code').inTable('trx_documents').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  await knex.schema.alterTable('trx_destruction_proposals', (t) => {
    t.foreign('document_code').references('document_code').inTable('trx_documents').onDelete('NO ACTION').onUpdate('CASCADE');
    t.foreign('retention_code').references('retention_code').inTable('mst_retention_schedule').onDelete('NO ACTION').onUpdate('CASCADE');
  });

  if (await knex.schema.hasTable('trs_surat_masuk')) {
    await knex.schema.alterTable('trs_surat_masuk', (t) => {
      t.foreign('jenis_dokumen_id').references('document_type_id').inTable('mst_document_type').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('klasifikasi_arsip_id').references('archive_classification_id').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('tingkat_kerahasiaan_id').references('confidentiality_level_id').inTable('mst_confidentiality_levels').onDelete('NO ACTION').onUpdate('NO ACTION');
    });
  } else if (await knex.schema.hasTable('trx_incoming_letters')) {
    await knex.schema.alterTable('trx_incoming_letters', (t) => {
      t.foreign('document_type_id').references('document_type_id').inTable('mst_document_type').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('archive_classification_id').references('archive_classification_id').inTable('mst_archive_classifications').onDelete('NO ACTION').onUpdate('NO ACTION');
      t.foreign('confidentiality_level_id').references('confidentiality_level_id').inTable('mst_confidentiality_levels').onDelete('NO ACTION').onUpdate('NO ACTION');
    });
  }
}
