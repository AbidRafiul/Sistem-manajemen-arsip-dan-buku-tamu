import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    let qTotal = DB("trs_kunjungan").leftJoin("mst_pengguna", "trs_kunjungan.id_user_host", "mst_pengguna.id_pengguna").whereRaw("DATE(trs_kunjungan.created_at) = CURRENT_DATE()").count("trs_kunjungan.id_kunjungan as total");
    applyMultiTenantFilter(qTotal, req, 'trs_kunjungan');
    const totalTamuHariIni = await qTotal.first();
    let qSedang = DB("trs_kunjungan").leftJoin("mst_pengguna", "trs_kunjungan.id_user_host", "mst_pengguna.id_pengguna").whereRaw("DATE(trs_kunjungan.created_at) = CURRENT_DATE()").andWhere("trs_kunjungan.status", "in").count("trs_kunjungan.id_kunjungan as total");
    applyMultiTenantFilter(qSedang, req, 'trs_kunjungan');
    const sedangBerkunjung = await qSedang.first();
    let qSelesai = DB("trs_kunjungan").leftJoin("mst_pengguna", "trs_kunjungan.id_user_host", "mst_pengguna.id_pengguna").whereRaw("DATE(trs_kunjungan.created_at) = CURRENT_DATE()").andWhere("trs_kunjungan.status", "out").count("trs_kunjungan.id_kunjungan as total");
    applyMultiTenantFilter(qSelesai, req, 'trs_kunjungan');
    const selesaiKunjungan = await qSelesai.first();
    let qRute = DB("trs_kunjungan as t").leftJoin("mst_pengguna", "t.id_user_host", "mst_pengguna.id_pengguna").join("mst_tujuan_kunjungan as m", "t.id_tujuan_kunjungan", "m.id_tujuan_kunjungan").select("m.nama_tujuan_kunjungan").count("t.id_kunjungan as total").whereRaw("DATE(t.created_at) = CURRENT_DATE()").groupBy("m.nama_tujuan_kunjungan");
    applyMultiTenantFilter(qRute, req, 't');
    const ruteTujuan = await qRute;
    const chart_tujuan_labels = ruteTujuan.map(item => item.nama_tujuan_kunjungan);
    const chart_tujuan_data = ruteTujuan.map(item => parseInt(item.total, 10));

    // Hitung tren mingguan (Senin - Minggu)
    const chart_mingguan = [0, 0, 0, 0, 0, 0, 0];
    let qWeekly = DB("trs_kunjungan as t").leftJoin("mst_pengguna", "t.id_user_host", "mst_pengguna.id_pengguna").select(DB.raw("WEEKDAY(t.created_at) as day_index, COUNT(t.id_kunjungan) as total")).whereRaw("YEARWEEK(t.created_at, 1) = YEARWEEK(CURRENT_DATE(), 1)").groupByRaw("WEEKDAY(t.created_at)");
    applyMultiTenantFilter(qWeekly, req, 't');
    const daysInWeek = await qWeekly;
    if (Array.isArray(daysInWeek)) {
      daysInWeek.forEach(row => {
        const idx = parseInt(row.day_index, 10);
        if (idx >= 0 && idx < 7) {
          chart_mingguan[idx] = parseInt(row.total, 10);
        }
      });
    }
    const oDashboardStats = {
      total_tamu_hari_ini: parseInt(totalTamuHariIni?.total || 0, 10),
      sedang_berkunjung: parseInt(sedangBerkunjung?.total || 0, 10),
      selesai_kunjungan: parseInt(selesaiKunjungan?.total || 0, 10),
      chart_mingguan: chart_mingguan,
      chart_tujuan_labels: chart_tujuan_labels,
      chart_tujuan_data: chart_tujuan_data
    };
    return res.status(200).json({
      status: "00",
      message: "Berhasil memuat statistik monitoring buku tamu",
      data: oDashboardStats,
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Sistem error saat memuat data statistik",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_monitoring.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;