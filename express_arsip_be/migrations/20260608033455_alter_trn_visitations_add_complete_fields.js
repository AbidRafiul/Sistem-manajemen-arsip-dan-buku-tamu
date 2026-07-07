/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.dropTableIfExists("tr_visitations");

  await knex.schema.createTable("tr_visitations", (table) => {
    table.increments("visitation_id").primary();
    table.string("guest_name", 100).notNullable();
    table.string("phone_number", 45).notNullable();
    table.string("guest_surel", 150).nullable();
    table.string("guest_company", 100).notNullable();
    table.string("guest_position", 20).nullable();
    table.enu("identity_type", ["ktp", "sim", "paspor"]).nullable();
    table.string("identity_number", 50).nullable();

    table.datetime("check_in_time").nullable();
    table.datetime("check_out_time").nullable();
    table.string("photo_face", 255).nullable();
    table.string("photo_identity", 255).nullable();
    table.enu("status", ["Rencana", "in", "out"]).notNullable().defaultTo("in");

    table.string("host_nama_pengguna", 36).nullable();
    table.string("host_name", 100).nullable();
    table.text("visit_notes").nullable();
    table.string("visit_code", 30).nullable();
    table.string("qr_token", 100).nullable();
    table
      .enu("approval_status", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("approved");
    table.text("approval_notes").nullable();

    table.integer("nama_pengguna").unsigned().nullable();
    table.integer("visit_purpose_id").unsigned().nullable();

    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("updated_at").notNullable().defaultTo(knex.fn.now());

    table.unique("qr_token", "uq_visitation_qr");
    table.unique("visit_code", "uq_visitation_code");
    table.index("status", "idx_visit_status");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("tr_visitations");
}
