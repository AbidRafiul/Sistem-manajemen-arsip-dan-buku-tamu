const renameIfExists = async (knex, oldName, newName) => {
  const oldExists = await knex.schema.hasTable(oldName);
  const newExists = await knex.schema.hasTable(newName);

  if (oldExists && !newExists) {
    await knex.schema.renameTable(oldName, newName);
  }
};

export async function up(knex) {
  await renameIfExists(knex, "trs_incoming_letters", "trx_incoming_letters");
  await renameIfExists(knex, "trs_letter_dispositions", "trx_letter_dispositions");
  await renameIfExists(knex, "trs_incoming_letter_files", "trx_incoming_letter_files");
  await renameIfExists(knex, "trs_incoming_letter_trackings", "trx_incoming_letter_trackings");
}

export async function down(knex) {
  await renameIfExists(knex, "trx_incoming_letter_trackings", "trs_incoming_letter_trackings");
  await renameIfExists(knex, "trx_incoming_letter_files", "trs_incoming_letter_files");
  await renameIfExists(knex, "trx_letter_dispositions", "trs_letter_dispositions");
  await renameIfExists(knex, "trx_incoming_letters", "trs_incoming_letters");
}
