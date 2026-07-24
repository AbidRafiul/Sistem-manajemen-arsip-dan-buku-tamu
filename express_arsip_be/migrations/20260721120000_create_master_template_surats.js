/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const templateTableExists = await knex.schema.hasTable("mst_template_surat");

  if (!templateTableExists) {
    await knex.schema.createTable("mst_template_surat", (table) => {
      table.bigIncrements("id_template").primary();
      table.string("kode_template", 50).notNullable().unique();
      table.string("nama_template", 150).notNullable();
      table.bigInteger("jenis_surat_id").unsigned().nullable();
      table.text("deskripsi").nullable();
      table.text("isi_template").notNullable();
      table.enu("status", ["active", "inactive"]).notNullable().defaultTo("active");
      table.integer("created_by").unsigned().nullable();
      table.integer("updated_by").unsigned().nullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());

      table
        .foreign("jenis_surat_id")
        .references("jenis_surat_id")
        .inTable("mst_jenis_surat")
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
  }

  const suratKeluarTableExists = await knex.schema.hasTable("trs_surat_keluar");
  if (suratKeluarTableExists) {
    const hasTemplateColumn = await knex.schema.hasColumn("trs_surat_keluar", "id_template");

    if (!hasTemplateColumn) {
      await knex.schema.alterTable("trs_surat_keluar", (table) => {
        table.bigInteger("id_template").unsigned().nullable();
      });
    }

    try {
      await knex.raw("SET FOREIGN_KEY_CHECKS=0;");
      await knex.schema.table("trs_surat_keluar", (table) => {
        table
          .foreign("id_template")
          .references("id_template")
          .inTable("mst_template_surat")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");
      });
      await knex.raw("SET FOREIGN_KEY_CHECKS=1;");
    } catch (error) {
      await knex.raw("SET FOREIGN_KEY_CHECKS=1;");
      if (!String(error).includes("already exists") && !String(error).includes("Duplicate entry")) {
        throw error;
      }
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const suratKeluarTableExists = await knex.schema.hasTable("trs_surat_keluar");
  if (suratKeluarTableExists) {
    const hasTemplateColumn = await knex.schema.hasColumn("trs_surat_keluar", "id_template");

    if (hasTemplateColumn) {
      try {
        await knex.schema.table("trs_surat_keluar", (table) => {
          table.dropForeign(["id_template"]);
        });
      } catch (error) {
        // ignore jika foreign key belum ada
      }

      await knex.schema.table("trs_surat_keluar", (table) => {
        table.dropColumn("id_template");
      });
    }
  }

  await knex.schema.dropTableIfExists("mst_template_surat");
}
