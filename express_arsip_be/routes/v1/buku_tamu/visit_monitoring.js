import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const today = formatDateSystem(new Date(), "yyyy-MM-dd");

    const rawTotal = await DB.raw("SELECT COUNT(*) as count FROM trx_visitations WHERE DATE(check_in_time) = ?", [today]);
    const today_total = rawTotal[0][0]?.count || 0;

    const rawIn = await DB.raw("SELECT COUNT(*) as count FROM trx_visitations WHERE DATE(check_in_time) = ? AND status = 'Sedang Berkunjung'", [today]);
    const today_in = rawIn[0][0]?.count || 0;

    const rawOut = await DB.raw("SELECT COUNT(*) as count FROM trx_visitations WHERE DATE(check_in_time) = ? AND status = 'Selesai'", [today]);
    const today_out = rawOut[0][0]?.count || 0;

    const rawPending = await DB.raw("SELECT COUNT(*) as count FROM trx_visitations WHERE approval_status = 'pending'");
    const pending_approval = rawPending[0][0]?.count || 0;

    const rawWeekly = await DB.raw(
      "SELECT DAYNAME(check_in_time) as day, COUNT(*) as count FROM trx_visitations WHERE check_in_time >= DATE_SUB(NOW(), INTERVAL 5 DAY) GROUP BY DAYNAME(check_in_time) ORDER BY MIN(check_in_time)"
    );
    const chart_mingguan = (rawWeekly[0] || []).map(r => r.count);
    while (chart_mingguan.length < 5) chart_mingguan.push(0);

    const rawPurpose = await DB.raw(
      "SELECT COALESCE(mp.visit_purpose_name, 'Lainnya') as purpose, COUNT(*) as count FROM trx_visitations t LEFT JOIN mst_visit_purpose mp ON t.visit_purpose_id = mp.visit_purpose_id WHERE DATE(t.check_in_time) = ? GROUP BY t.visit_purpose_id",
      [today]
    );

    const chart_tujuan_labels = (rawPurpose[0] || []).map(r => r.purpose);
    const chart_tujuan_data = (rawPurpose[0] || []).map(r => r.count);

    if (chart_tujuan_labels.length === 0) {
      chart_tujuan_labels.push('Belum Ada Data');
      chart_tujuan_data.push(0);
    }

    const recent_10 = await DB("trx_visitations")
      .select("visitation_id", "guest_name", "visit_code", "check_in_time", "status")
      .orderBy("check_in_time", "desc")
      .limit(10);

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: {
        total_tamu_hari_ini: today_total,
        sedang_berkunjung: today_in,
        selesai_kunjungan: today_out,
        pending_approval,
        chart_mingguan,
        chart_tujuan_labels,
        chart_tujuan_data,
        recent_10
      },
      datetime: formatDateSystem(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;