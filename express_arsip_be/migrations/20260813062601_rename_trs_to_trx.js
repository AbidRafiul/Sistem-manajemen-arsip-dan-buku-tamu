/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  await knex.schema.renameTable('trs_alur_tanda_tangan', 'trx_alur_tanda_tangan');
  await knex.schema.renameTable('trs_detail_alur_tanda_tangan', 'trx_detail_alur_tanda_tangan');
  await knex.schema.renameTable('trs_disposisi_surat', 'trx_disposisi_surat');
  await knex.schema.renameTable('trs_dokumen', 'trx_dokumen');
  await knex.schema.renameTable('trs_file_surat_keluar', 'trx_file_surat_keluar');
  await knex.schema.renameTable('trs_file_surat_masuk', 'trx_file_surat_masuk');
  await knex.schema.renameTable('trs_konten_dokumen', 'trx_konten_dokumen');
  await knex.schema.renameTable('trs_kunjungan', 'trx_kunjungan');
  await knex.schema.renameTable('trs_kunjungan_anggota', 'trx_kunjungan_anggota');
  await knex.schema.renameTable('trs_log_tanda_tangan', 'trx_log_tanda_tangan');
  await knex.schema.renameTable('trs_notifikasi', 'trx_notifikasi');
  await knex.schema.renameTable('trs_peminjaman_arsip', 'trx_peminjaman_arsip');
  await knex.schema.renameTable('trs_riwayat_dokumen', 'trx_riwayat_dokumen');
  await knex.schema.renameTable('trs_sequence_penomoran_surat', 'trx_sequence_penomoran_surat');
  await knex.schema.renameTable('trs_surat_keluar', 'trx_surat_keluar');
  await knex.schema.renameTable('trs_surat_masuk', 'trx_surat_masuk');
  await knex.schema.renameTable('trs_tanda_tangan_dokumen', 'trx_tanda_tangan_dokumen');
  await knex.schema.renameTable('trs_tracking_surat_keluar', 'trx_tracking_surat_keluar');
  await knex.schema.renameTable('trs_tracking_surat_masuk', 'trx_tracking_surat_masuk');
  await knex.schema.renameTable('trs_usulan_pemusnahan', 'trx_usulan_pemusnahan');
  await knex.schema.renameTable('trs_verifikasi_dokumen', 'trx_verifikasi_dokumen');
  await knex.schema.renameTable('trs_versi_dokumen', 'trx_versi_dokumen');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.renameTable('trx_alur_tanda_tangan', 'trs_alur_tanda_tangan');
  await knex.schema.renameTable('trx_detail_alur_tanda_tangan', 'trs_detail_alur_tanda_tangan');
  await knex.schema.renameTable('trx_disposisi_surat', 'trs_disposisi_surat');
  await knex.schema.renameTable('trx_dokumen', 'trs_dokumen');
  await knex.schema.renameTable('trx_file_surat_keluar', 'trs_file_surat_keluar');
  await knex.schema.renameTable('trx_file_surat_masuk', 'trs_file_surat_masuk');
  await knex.schema.renameTable('trx_konten_dokumen', 'trs_konten_dokumen');
  await knex.schema.renameTable('trx_kunjungan', 'trs_kunjungan');
  await knex.schema.renameTable('trx_kunjungan_anggota', 'trs_kunjungan_anggota');
  await knex.schema.renameTable('trx_log_tanda_tangan', 'trs_log_tanda_tangan');
  await knex.schema.renameTable('trx_notifikasi', 'trs_notifikasi');
  await knex.schema.renameTable('trx_peminjaman_arsip', 'trs_peminjaman_arsip');
  await knex.schema.renameTable('trx_riwayat_dokumen', 'trs_riwayat_dokumen');
  await knex.schema.renameTable('trx_sequence_penomoran_surat', 'trs_sequence_penomoran_surat');
  await knex.schema.renameTable('trx_surat_keluar', 'trs_surat_keluar');
  await knex.schema.renameTable('trx_surat_masuk', 'trs_surat_masuk');
  await knex.schema.renameTable('trx_tanda_tangan_dokumen', 'trs_tanda_tangan_dokumen');
  await knex.schema.renameTable('trx_tracking_surat_keluar', 'trs_tracking_surat_keluar');
  await knex.schema.renameTable('trx_tracking_surat_masuk', 'trs_tracking_surat_masuk');
  await knex.schema.renameTable('trx_usulan_pemusnahan', 'trs_usulan_pemusnahan');
  await knex.schema.renameTable('trx_verifikasi_dokumen', 'trs_verifikasi_dokumen');
  await knex.schema.renameTable('trx_versi_dokumen', 'trs_versi_dokumen');
};
