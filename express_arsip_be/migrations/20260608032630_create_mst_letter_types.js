/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Cek dulu apakah tabel sudah eksis di database
  const exists = await knex.schema.hasTable("mst_letter_types");

  // 2. Kalau belum ada, baru kita eksekusi pembuatan tabelnya
  if (!exists) {
    await knex.schema.createTable("mst_letter_types", (table) => {
      table.bigIncrements("letter_type_id").primary();

      table.string("letter_type_code", 50).notNullable().unique();
      table.string("letter_type_name", 150).notNullable();
      table.enu("direction", ["incoming", "outgoing", "both"]).notNullable().defaultTo("both");
      table.text("description").nullable();

      table.enu("status", ["active", "nonactive"]).notNullable().defaultTo("active");
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());
    });
    console.log("Tabel 'mst_letter_types' berhasil dibuat.");
  } else {
    console.log("Tabel 'mst_letter_types' sudah ada, aman di-skip!");
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("mst_letter_types");
}