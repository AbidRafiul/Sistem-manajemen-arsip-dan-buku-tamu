const changeColumn = async (knex, tableName, oldName, newName, definition) => {
  await knex.raw(`ALTER TABLE ?? CHANGE ?? ?? ${definition}`, [
    tableName,
    oldName,
    newName,
  ]);
};

export async function up(knex) {
  const client = knex.client.config.client;

  if (!["mysql", "mysql2"].includes(client)) {
    return;
  }

  await changeColumn(knex, "mst_letter_types", "Direction", "direction", "ENUM('incoming','outgoing','both') NOT NULL DEFAULT 'both'");
  await changeColumn(knex, "mst_letter_types", "Description", "description", "TEXT NULL");
  await changeColumn(knex, "mst_letter_types", "Status", "status", "ENUM('active','nonactive') NOT NULL DEFAULT 'active'");

  await changeColumn(knex, "mst_disposition_instructions", "Description", "description", "TEXT NULL");
  await changeColumn(knex, "mst_disposition_instructions", "Status", "status", "ENUM('active','nonactive') NOT NULL DEFAULT 'active'");

  await changeColumn(knex, "trx_incoming_letters", "Subject", "subject", "VARCHAR(255) NOT NULL");
  await changeColumn(knex, "trx_incoming_letters", "Status", "status", "ENUM('baru','diproses','didisposisi','selesai') NOT NULL DEFAULT 'baru'");

  await changeColumn(knex, "trx_incoming_letter_files", "Status", "status", "ENUM('active','nonactive') NOT NULL DEFAULT 'active'");

  await changeColumn(knex, "trx_letter_dispositions", "Instruction", "instruction", "TEXT NULL");
  await changeColumn(knex, "trx_letter_dispositions", "Status", "status", "ENUM('baru','dibaca','diproses','selesai') NOT NULL DEFAULT 'baru'");

  await changeColumn(knex, "trx_incoming_letter_trackings", "Notes", "notes", "TEXT NULL");
}

export async function down() {}
