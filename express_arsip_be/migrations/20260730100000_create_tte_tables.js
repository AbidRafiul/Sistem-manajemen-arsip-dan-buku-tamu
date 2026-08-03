/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const createIfMissing = async (tableName, builder) => {
    const exists = await knex.schema.hasTable(tableName);
    if (!exists) {
      await knex.schema.createTable(tableName, builder);
    }
  };

  await createIfMissing("mst_sertifikat_elektronik", (table) => {
    table.bigIncrements("id_sertifikat_elektronik").primary();
    table.integer("id_pengguna").unsigned().nullable();
    table.string("nama_sertifikat", 150).notNullable();
    table.string("alias_sertifikat", 100).nullable();
    table.string("nomor_seri", 150).notNullable();
    table.string("subjek_sertifikat", 255).nullable();
    table.string("penerbit_sertifikat", 255).nullable();
    table.string("algoritma_tanda_tangan", 50).notNullable().defaultTo("RSA-SHA256");
    table.string("algoritma_hash", 50).notNullable().defaultTo("SHA-256");
    table.string("lokasi_keystore", 255).notNullable();
    table.date("berlaku_mulai").nullable();
    table.date("berlaku_sampai").nullable();
    table
      .enu("status_sertifikat", ["aktif", "nonaktif", "kedaluwarsa"])
      .notNullable()
      .defaultTo("aktif");
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_pengguna", "idx_mst_sertifikat_elektronik_id_pengguna");
    table.index("nomor_seri", "idx_mst_sertifikat_elektronik_nomor_seri");
    table.index("status_sertifikat", "idx_mst_sertifikat_elektronik_status");

    table
      .foreign("id_pengguna")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("updated_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  await createIfMissing("mst_posisi_tanda_tangan", (table) => {
    table.bigIncrements("id_posisi_tanda_tangan").primary();
    table.bigInteger("id_template").unsigned().nullable();
    table.string("nama_posisi", 150).nullable();
    table.integer("halaman").notNullable().defaultTo(1);
    table.decimal("posisi_x", 10, 2).notNullable().defaultTo(360);
    table.decimal("posisi_y", 10, 2).notNullable().defaultTo(70);
    table.decimal("lebar", 10, 2).notNullable().defaultTo(200);
    table.decimal("tinggi", 10, 2).notNullable().defaultTo(90);
    table.boolean("is_default").notNullable().defaultTo(false);
    table
      .enu("status", ["aktif", "nonaktif"])
      .notNullable()
      .defaultTo("aktif");
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_template", "idx_mst_posisi_ttd_id_template");
    table.index("is_default", "idx_mst_posisi_ttd_default");

    table
      .foreign("id_template")
      .references("id_template")
      .inTable("mst_template_surat")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("updated_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  await createIfMissing("trs_alur_tanda_tangan", (table) => {
    table.bigIncrements("id_alur_tanda_tangan").primary();
    table.bigInteger("id_surat_keluar").unsigned().notNullable();
    table
      .enu("jenis_alur", ["berurutan", "paralel", "campuran"])
      .notNullable()
      .defaultTo("berurutan");
    table
      .enu("status_alur", ["draft", "aktif", "selesai", "batal"])
      .notNullable()
      .defaultTo("draft");
    table.integer("urutan_aktif").notNullable().defaultTo(1);
    table.dateTime("dimulai_pada").nullable();
    table.dateTime("diselesaikan_pada").nullable();
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_surat_keluar", "idx_trs_alur_ttd_id_surat_keluar");
    table.index("status_alur", "idx_trs_alur_ttd_status");

    table
      .foreign("id_surat_keluar")
      .references("id_surat_keluar")
      .inTable("trs_surat_keluar")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("updated_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  await createIfMissing("trs_detail_alur_tanda_tangan", (table) => {
    table.bigIncrements("id_detail_alur_tanda_tangan").primary();
    table.bigInteger("id_alur_tanda_tangan").unsigned().notNullable();
    table.integer("id_pengguna").unsigned().nullable();
    table.integer("id_peran").nullable();
    table.integer("urutan").notNullable().defaultTo(1);
    table
      .enu("jenis_tindakan", ["persetujuan", "tanda_tangan"])
      .notNullable()
      .defaultTo("tanda_tangan");
    table
      .enu("status_tindakan", ["menunggu", "disetujui", "ditandatangani", "ditolak", "dibatalkan"])
      .notNullable()
      .defaultTo("menunggu");
    table.text("catatan").nullable();
    table.string("hash_dokumen", 128).nullable();
    table.dateTime("waktu_tindakan").nullable();
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_alur_tanda_tangan", "idx_trs_detail_alur_id_alur");
    table.index("id_pengguna", "idx_trs_detail_alur_id_pengguna");
    table.index("status_tindakan", "idx_trs_detail_alur_status");

    table
      .foreign("id_alur_tanda_tangan")
      .references("id_alur_tanda_tangan")
      .inTable("trs_alur_tanda_tangan")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("id_pengguna")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("id_peran")
      .references("id_peran")
      .inTable("mst_peran")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("updated_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  await createIfMissing("trs_tanda_tangan_dokumen", (table) => {
    table.bigIncrements("id_tanda_tangan_dokumen").primary();
    table.bigInteger("id_surat_keluar").unsigned().notNullable();
    table.integer("id_pengguna").unsigned().nullable();
    table.bigInteger("id_sertifikat_elektronik").unsigned().nullable();
    table.integer("id_versi_dokumen").nullable();
    table.integer("urutan_tanda_tangan").notNullable().defaultTo(1);
    table.string("nomor_seri_sertifikat", 150).nullable();
    table.string("subjek_sertifikat", 255).nullable();
    table.string("penerbit_sertifikat", 255).nullable();
    table.string("algoritma_tanda_tangan", 50).notNullable().defaultTo("RSA-SHA256");
    table.string("algoritma_hash", 50).notNullable().defaultTo("SHA-256");
    table.string("lokasi_dokumen", 255).notNullable();
    table.string("hash_dokumen", 128).notNullable();
    table.string("token_verifikasi", 120).nullable();
    table.dateTime("waktu_tanda_tangan").notNullable().defaultTo(knex.fn.now());
    table
      .enu("status_tanda_tangan", ["aktif", "gagal", "dibatalkan"])
      .notNullable()
      .defaultTo("aktif");
    table.integer("created_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_surat_keluar", "idx_trs_tanda_tangan_id_surat_keluar");
    table.index("id_pengguna", "idx_trs_tanda_tangan_id_pengguna");
    table.index("token_verifikasi", "idx_trs_tanda_tangan_token");
    table.index("status_tanda_tangan", "idx_trs_tanda_tangan_status");

    table
      .foreign("id_surat_keluar")
      .references("id_surat_keluar")
      .inTable("trs_surat_keluar")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("id_pengguna")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("id_sertifikat_elektronik")
      .references("id_sertifikat_elektronik")
      .inTable("mst_sertifikat_elektronik")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  await createIfMissing("trs_verifikasi_dokumen", (table) => {
    table.bigIncrements("id_verifikasi_dokumen").primary();
    table.bigInteger("id_surat_keluar").unsigned().notNullable();
    table.bigInteger("id_tanda_tangan_dokumen").unsigned().nullable();
    table.string("token_verifikasi", 120).nullable();
    table.boolean("valid_kriptografis").notNullable().defaultTo(false);
    table.boolean("valid_integritas").notNullable().defaultTo(false);
    table.boolean("valid_sertifikat").notNullable().defaultTo(false);
    table.boolean("sertifikat_dipercaya").notNullable().defaultTo(false);
    table.boolean("sertifikat_dicabut").notNullable().defaultTo(false);
    table.boolean("dokumen_diubah").notNullable().defaultTo(false);
    table.text("pesan_verifikasi").nullable();
    table.dateTime("diverifikasi_pada").notNullable().defaultTo(knex.fn.now());
    table.integer("diverifikasi_oleh").unsigned().nullable();
    table.integer("created_by").unsigned().nullable();
    table.integer("updated_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_surat_keluar", "idx_trs_verifikasi_id_surat_keluar");
    table.index("id_tanda_tangan_dokumen", "idx_trs_verifikasi_id_ttd");
    table.index("token_verifikasi", "idx_trs_verifikasi_token");

    table
      .foreign("id_surat_keluar")
      .references("id_surat_keluar")
      .inTable("trs_surat_keluar")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("id_tanda_tangan_dokumen")
      .references("id_tanda_tangan_dokumen")
      .inTable("trs_tanda_tangan_dokumen")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("diverifikasi_oleh")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("updated_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  await createIfMissing("trs_log_tanda_tangan", (table) => {
    table.bigIncrements("id_log_tanda_tangan").primary();
    table.bigInteger("id_surat_keluar").unsigned().notNullable();
    table.integer("id_pengguna").unsigned().nullable();
    table.string("aksi", 100).notNullable();
    table.string("status_sebelum", 50).nullable();
    table.string("status_sesudah", 50).nullable();
    table.string("alamat_ip", 120).nullable();
    table.text("user_agent").nullable();
    table.text("metadata").nullable();
    table.string("hash_log_sebelumnya", 128).nullable();
    table.string("hash_log", 128).notNullable();
    table.dateTime("dibuat_pada").notNullable().defaultTo(knex.fn.now());
    table.integer("created_by").unsigned().nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("id_surat_keluar", "idx_trs_log_ttd_id_surat_keluar");
    table.index("id_pengguna", "idx_trs_log_ttd_id_pengguna");
    table.index("aksi", "idx_trs_log_ttd_aksi");

    table
      .foreign("id_surat_keluar")
      .references("id_surat_keluar")
      .inTable("trs_surat_keluar")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("id_pengguna")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("created_by")
      .references("id_pengguna")
      .inTable("mst_pengguna")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  const hasIdCabangSuratKeluar = await knex.schema.hasColumn("trs_surat_keluar", "id_cabang");
  if (!hasIdCabangSuratKeluar && (await knex.schema.hasTable("trs_surat_keluar"))) {
    await knex.schema.alterTable("trs_surat_keluar", (table) => {
      table.integer("id_cabang").unsigned().nullable().after("id_surat_keluar");
      table.index("id_cabang", "idx_trs_surat_keluar_id_cabang_tte");
      table
        .foreign("id_cabang", "trs_surat_keluar_id_cabang_tte_foreign")
        .references("id_cabang")
        .inTable("mst_cabang")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const dropIfExists = async (tableName) => {
    if (await knex.schema.hasTable(tableName)) {
      await knex.schema.dropTable(tableName);
    }
  };

  await dropIfExists("trs_log_tanda_tangan");
  await dropIfExists("trs_verifikasi_dokumen");
  await dropIfExists("trs_tanda_tangan_dokumen");
  await dropIfExists("trs_detail_alur_tanda_tangan");
  await dropIfExists("trs_alur_tanda_tangan");
  await dropIfExists("mst_posisi_tanda_tangan");
  await dropIfExists("mst_sertifikat_elektronik");
}
