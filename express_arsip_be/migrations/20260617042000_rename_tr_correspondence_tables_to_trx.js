const renameIfExists = async (knex, oldName, newName) => {
  const oldExists = await knex.schema.hasTable(oldName);
  const newExists = await knex.schema.hasTable(newName);

  if (oldExists && !newExists) {
    await knex.schema.renameTable(oldName, newName);
  }
};

export async function up(knex) {
  await renameIfExists(knex, "tr_incoming_letters", "trx_incoming_letters");
  await renameIfExists(knex, "tr_letter_dispositions", "trx_letter_dispositions");
  await renameIfExists(knex, "tr_incoming_letter_files", "trx_incoming_letter_files");
  await renameIfExists(knex, "tr_incoming_letter_trackings", "trx_incoming_letter_trackings");
}

export async function down(knex) {
  await renameIfExists(knex, "trx_incoming_letter_trackings", "tr_incoming_letter_trackings");
  await renameIfExists(knex, "trx_incoming_letter_files", "tr_incoming_letter_files");
  await renameIfExists(knex, "trx_letter_dispositions", "tr_letter_dispositions");
  await renameIfExists(knex, "trx_incoming_letters", "tr_incoming_letters");
}
