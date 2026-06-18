import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const today = formatDateSystem(new Date(), "yyyy-MM-dd");

    const [{ today_total }] = await DB.raw("SELECT COUNT(*) as today_total FROM trx_visitations WHERE DATE(CheckInTime)=?", [today]);
    const [{ today_in }] = await DB.raw("SELECT COUNT(*) as today_in FROM trx_visitations WHERE DATE(CheckInTime)=? AND Status='in'", [today]);
    const [{ today_out }] = await DB.raw("SELECT COUNT(*) as today_out FROM trx_visitations WHERE DATE(CheckInTime)=? AND Status='out'", [today]);
    const [{ pending_approval }] = await DB.raw("SELECT COUNT(*) as pending_approval FROM trx_visitations WHERE ApprovalStatus='pending'");

    const chart_per_hour_raw = await DB.raw("SELECT HOUR(CheckInTime) as hour, COUNT(*) as count FROM trx_visitations WHERE DATE(CheckInTime)=? GROUP BY HOUR(CheckInTime) ORDER BY hour", [today]);
    const chart_per_hour = chart_per_hour_raw[0].map(r => ({ hour: r.hour, count: r.count }));

    const chart_per_purpose_raw = await DB.raw(
      "SELECT mp.VisitPurposeName as purpose, COUNT(*) as count FROM trx_visitations t LEFT JOIN mst_visit_purpose mp ON t.VisitPurposeId = mp.VisitPurposeId WHERE DATE(t.CheckInTime) = ? GROUP BY t.VisitPurposeId", 
      [today]
    );
    const chart_per_purpose = chart_per_purpose_raw[0].map(r => ({ purpose: r.purpose, count: r.count }));

    const recent_10 = await DB("trx_visitations").select("VisitationId", "GuestName", "VisitCode", "CheckInTime", "Status").orderBy("CheckInTime", "desc").limit(10);

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: { today_total: today_total || 0, today_in: today_in || 0, today_out: today_out || 0, pending_approval: pending_approval || 0, chart_per_hour, chart_per_purpose, recent_10 },
      datetime: formatDateSystem(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Sistem error", datetime: formatDateSystem() });
  }
});

export default router;