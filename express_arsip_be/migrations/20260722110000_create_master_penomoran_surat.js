/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const hasMasterTable = await knex.schema.hasTable("mst_penomoran_surat");
  if (!hasMasterTable) {
    await knex.schema.createTable("mst_penomoran_surat", (table) => {
      table.bigIncrements("id_penomoran_surat").primary();
      table.string("nama_penomoran", 150).notNullable();
      table.bigInteger("jenis_surat_id").unsigned().notNullable();
      table.string("format_nomor", 255).notNullable();
      table.integer("jumlah_digit").unsigned().notNullable().defaultTo(3);
      table.integer("nomor_awal").unsigned().notNullable().defaultTo(1);
      table
        .enu("periode_reset", ["tidak_pernah", "tahunan", "bulanan"])
        .notNullable()
        .defaultTo("tahunan");
      table
        .enu("cakupan_sequence", [
          "global",
          "per_jenis_surat",
          "per_unit_kerja",
          "per_jenis_surat_unit_kerja",
        ])
        .notNullable()
        .defaultTo("per_jenis_surat");
      table
        .enu("tahap_penerbitan_nomor", [
          "saat_draft_dibuat",
          "setelah_approval_final",
          "saat_diterbitkan",
        ])
        .notNullable()
        .defaultTo("saat_draft_dibuat");
      table.tinyint("status_aktif").notNullable().defaultTo(1);
      table.integer("created_by").unsigned().nullable();
      table.integer("updated_by").unsigned().nullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

      table
        .foreign("jenis_surat_id")
        .references("jenis_surat_id")
        .inTable("mst_jenis_surat")
        .onDelete("RESTRICT")
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

      table.index(["jenis_surat_id", "status_aktif"], "idx_penomoran_jenis_status");
    });
  }

  const hasSequenceTable = await knex.schema.hasTable("trs_sequence_penomoran_surat");
  if (!hasSequenceTable) {
    await knex.schema.createTable("trs_sequence_penomoran_surat", (table) => {
      table.bigIncrements("id_sequence_penomoran_surat").primary();
      table.bigInteger("id_penomoran_surat").unsigned().notNullable();
      table.bigInteger("jenis_surat_id").unsigned().nullable();
      table.integer("id_unit_kerja").unsigned().nullable();
      table.integer("bulan").unsigned().nullable();
      table.integer("tahun").unsigned().nullable();
      table.string("periode_key", 20).notNullable().defaultTo("global");
      table.string("cakupan_key", 100).notNullable().defaultTo("global");
      table.integer("nomor_terakhir").unsigned().notNullable().defaultTo(0);
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

      table
        .foreign("id_penomoran_surat")
        .references("id_penomoran_surat")
        .inTable("mst_penomoran_surat")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table
        .foreign("jenis_surat_id")
        .references("jenis_surat_id")
        .inTable("mst_jenis_surat")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      table
        .foreign("id_unit_kerja")
        .references("id_unit_kerja")
        .inTable("mst_unit_kerja")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");

      table.unique(
        ["id_penomoran_surat", "periode_key", "cakupan_key"],
        "uq_sequence_penomoran_scope"
      );
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("trs_sequence_penomoran_surat");
  await knex.schema.dropTableIfExists("mst_penomoran_surat");
}
