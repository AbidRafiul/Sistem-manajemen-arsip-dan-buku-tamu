import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const totalTamuHariIni = await DB("trs_kunjungan")
      .whereRaw("DATE(created_at) = CURRENT_DATE()")
      .count("id_kunjungan as total")
      .first();

    const sedangBerkunjung = await DB("trs_kunjungan")
      .whereRaw("DATE(created_at) = CURRENT_DATE()")
      .andWhere("status", "in")
      .count("id_kunjungan as total")
      .first();

    const selesaiKunjungan = await DB("trs_kunjungan")
      .whereRaw("DATE(created_at) = CURRENT_DATE()")
      .andWhere("status", "out")
      .count("id_kunjungan as total")
      .first();

    const ruteTujuan = await DB("trs_kunjungan as t")
      .join("mst_tujuan_kunjungan as m", "t.id_tujuan_kunjungan", "m.id_tujuan_kunjungan")
      .select("m.nama_tujuan_kunjungan")
      .count("t.id_kunjungan as total")
      .whereRaw("DATE(t.created_at) = CURRENT_DATE()")
      .groupBy("m.nama_tujuan_kunjungan");

    const chart_tujuan_labels = ruteTujuan.map(item => item.nama_tujuan_kunjungan);
    const chart_tujuan_data = ruteTujuan.map(item => parseInt(item.total, 10));

    const oDashboardStats = {
      total_tamu_hari_ini: parseInt(totalTamuHariIni?.total || 0, 10),
      sedang_berkunjung: parseInt(sedangBerkunjung?.total || 0, 10),
      selesai_kunjungan: parseInt(selesaiKunjungan?.total || 0, 10),
      chart_mingguan: [5, 12, 18, 10, parseInt(totalTamuHariIni?.total || 0, 10)], // Dinamis hari jumat, sisa hari dummy kuliah
      chart_tujuan_labels: chart_tujuan_labels.length > 0 ? chart_tujuan_labels : ['Belum Ada Kunjungan'],
      chart_tujuan_data: chart_tujuan_data.length > 0 ? chart_tujuan_data : [0]
    };

    return res.status(200).json({
      status: "00",
      message: "Berhasil memuat statistik monitoring buku tamu",
      data: oDashboardStats,
      datetime: formatDateSystem()
    });

  } catch (error) {
    console.error("❌ [Error visit_monitoring.js]:", error);
    return res.status(500).json({
      status: "01",
      message: "Sistem error saat memuat data statistik",
      datetime: formatDateSystem()
    });
  }
});

export default router;