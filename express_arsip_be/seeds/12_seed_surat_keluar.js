/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0;");

  // Fetch valid jenis_surat_id from mst_jenis_surat if available
  const oJenisSurat = await knex("mst_jenis_surat").select("jenis_surat_id").first();
  const nJenisSuratId = oJenisSurat?.jenis_surat_id || 1;

  // Create some dates for the last 7 days
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  });

  const dummyData = [
    {
      nomor_surat: `001/SK/${Date.now()}`,
      nomor_agenda: `AG-${Date.now()}-1`,
      tanggal_surat: dates[0].split(' ')[0],
      id_jenis_surat: nJenisSuratId,
      perihal: 'Surat Undangan Rapat',
      tujuan: 'Bapak Budi',
      status: 'terkirim',
      id_cabang: 1,
      created_by: 1,
      created_at: dates[0]
    },
    {
      nomor_surat: `002/SK/${Date.now()}`,
      nomor_agenda: `AG-${Date.now()}-2`,
      tanggal_surat: dates[1].split(' ')[0],
      id_jenis_surat: nJenisSuratId,
      perihal: 'Pengajuan Dana',
      tujuan: 'Direktur Keuangan',
      status: 'menunggu_approval',
      id_cabang: 1,
      created_by: 1,
      created_at: dates[1]
    },
    {
      nomor_surat: `003/SK/${Date.now()}`,
      nomor_agenda: `AG-${Date.now()}-3`,
      tanggal_surat: dates[2].split(' ')[0],
      id_jenis_surat: nJenisSuratId,
      perihal: 'Laporan Bulanan',
      tujuan: 'Manager Operasional',
      status: 'disetujui',
      id_cabang: 1,
      created_by: 1,
      created_at: dates[2]
    },
    {
      nomor_surat: `004/SK/${Date.now()}`,
      nomor_agenda: `AG-${Date.now()}-4`,
      tanggal_surat: dates[3].split(' ')[0],
      id_jenis_surat: nJenisSuratId,
      perihal: 'Surat Peringatan',
      tujuan: 'Karyawan A',
      status: 'ditolak',
      id_cabang: 1,
      created_by: 1,
      created_at: dates[3]
    },
    {
      nomor_surat: `005/SK/${Date.now()}`,
      nomor_agenda: `AG-${Date.now()}-5`,
      tanggal_surat: dates[4].split(' ')[0],
      id_jenis_surat: nJenisSuratId,
      perihal: 'Permohonan Cuti',
      tujuan: 'HRD',
      status: 'selesai',
      id_cabang: 1,
      created_by: 1,
      created_at: dates[4]
    }
  ];

  await knex('trx_surat_keluar').insert(dummyData);

  await knex.raw("SET FOREIGN_KEY_CHECKS = 1;");
}
