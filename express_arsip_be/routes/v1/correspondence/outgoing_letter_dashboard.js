import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

const outgoingLetterDashboardStats = async (req, res) => {
  const cFile = "outgoing_letter_dashboard.js";
  const cFunc = "outgoingLetterDashboardStats";

  try {
    const [oTerkirim, oDisetujui, oDitolak, oMenunggu] = await Promise.all([
      DB("trs_surat_keluar").count("* as total").whereIn("status", ["terkirim", "selesai"]).first(),
      DB("trs_surat_keluar").count("* as total").where("status", "disetujui").first(),
      DB("trs_surat_keluar").count("* as total").where("status", "ditolak").first(),
      DB("trs_surat_keluar").count("* as total").where("status", "menunggu_approval").first()
    ]);

    const nTerkirim = Number(oTerkirim?.total) || 0;
    const nDisetujui = Number(oDisetujui?.total) || 0;
    const nDitolak = Number(oDitolak?.total) || 0;
    const nMenunggu = Number(oMenunggu?.total) || 0;

    // Fetch trend data for last 7 days
    const vaChartRaw = await DB("trs_surat_keluar")
      .select(DB.raw("DATE(created_at) as tanggal"), "status", DB.raw("COUNT(*) as total"))
      .whereRaw("created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)")
      .whereNot("status", "dihapus")
      .groupByRaw("DATE(created_at), status")
      .orderByRaw("DATE(created_at) ASC");

    const vaNamaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const vaLabels = [];
    const vaTerkirimData = [];
    const vaDisetujuiData = [];
    const vaDitolakData = [];
    const vaMenungguData = [];

    for (let i = 6; i >= 0; i--) {
      const dTarget = new Date();
      dTarget.setDate(dTarget.getDate() - i);

      const cTanggal = dTarget.toISOString().slice(0, 10);
      const cHari = vaNamaHari[dTarget.getDay()];

      vaLabels.push(cHari);

      // Find matching values in vaChartRaw for target date
      const filterByDateAndStatus = (statusList) => {
        return vaChartRaw
          .filter((item) => {
            const cItemDate =
              item.tanggal instanceof Date
                ? item.tanggal.toISOString().slice(0, 10)
                : String(item.tanggal).slice(0, 10);
            return cItemDate === cTanggal && statusList.includes(item.status);
          })
          .reduce((sum, item) => sum + Number(item.total), 0);
      };

      vaTerkirimData.push(filterByDateAndStatus(["terkirim", "selesai"]));
      vaDisetujuiData.push(filterByDateAndStatus(["disetujui"]));
      vaDitolakData.push(filterByDateAndStatus(["ditolak"]));
      vaMenungguData.push(filterByDateAndStatus(["menunggu_approval"]));
    }

    return res.status(200).json({
      status: true,
      message: "Statistik dashboard surat keluar berhasil diambil",
      data: {
        summary: {
          terkirim: nTerkirim,
          disetujui: nDisetujui,
          ditolak: nDitolak,
          menungguApproval: nMenunggu,
          total: nTerkirim + nDisetujui + nDitolak + nMenunggu
        },
        chartData: {
          labels: vaLabels,
          datasets: [
            {
              label: "Terkirim",
              data: vaTerkirimData,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4
            },
            {
              label: "Diterima / Disetujui",
              data: vaDisetujuiData,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: true,
              tension: 0.4
            },
            {
              label: "Ditolak",
              data: vaDitolakData,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.4
            },
            {
              label: "Menunggu Approval",
              data: vaMenungguData,
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              fill: true,
              tension: 0.4
            }
          ]
        }
      }
    });
  } catch (error) {
    const oResult = {
      status: false,
      message: "Statistik dashboard surat keluar gagal diambil",
      error: error.message
    };

    await Logging(error, {
      file: cFile,
      func: cFunc,
      request: "",
      response: JSON.stringify(oResult),
      user: req?.auth?.nama_pengguna || "system"
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", outgoingLetterDashboardStats);
router.post("/", outgoingLetterDashboardStats);

export default router;
