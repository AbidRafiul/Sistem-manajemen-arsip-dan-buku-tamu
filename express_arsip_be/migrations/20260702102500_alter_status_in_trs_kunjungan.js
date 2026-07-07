/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Alter status column to ENUM('Rencana', 'in', 'out') in MySQL
  await knex.raw(`
    ALTER TABLE trs_kunjungan 
      MODIFY COLUMN status ENUM('Rencana', 'in', 'out') NOT NULL DEFAULT 'Rencana'
  `);

  // Update any existing rows where status is empty string, null, or invalid to 'Rencana'
  // Note: MySQL stores invalid enum entries as '' (index 0)
  await knex("trs_kunjungan")
    .where("status", "")
    .orWhereNull("status")
    .update({ status: "Rencana" });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
    ALTER TABLE trs_kunjungan 
      MODIFY COLUMN status ENUM('in', 'out') NOT NULL DEFAULT 'in'
  `);
}
