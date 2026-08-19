export const up = async (knex) => {
  // Alter ENUM column to include 'dihapus'
  await knex.raw("ALTER TABLE trx_surat_masuk MODIFY COLUMN status ENUM('baru','diproses','didisposisi','selesai','dihapus') NOT NULL DEFAULT 'baru'");
};

export const down = async (knex) => {
  // Restore original ENUM without 'dihapus'
  await knex.raw("ALTER TABLE trx_surat_masuk MODIFY COLUMN status ENUM('baru','diproses','didisposisi','selesai') NOT NULL DEFAULT 'baru'");
};
