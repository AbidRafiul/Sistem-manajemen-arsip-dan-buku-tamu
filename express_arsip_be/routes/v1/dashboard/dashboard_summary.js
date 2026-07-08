import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import { formatDateSystem } from "../components/tools/general.js";

/**
 * GET /dashboard/summary
 * Mengambil ringkasan data dashboard: metric cards, chart mingguan, dan audit log.
 */
const getDashboardSummary = async (req, res) => {
  try {
    // ── 1. Query semua metric secara paralel ──────────────────────────────────
    const [oArsipAktif, oTamuHariIni, oDisposisi, vaRetensi, vaChartRaw, vaAuditRaw] =
      await Promise.all([
        // Metric 1: Arsip Aktif
        DB("trs_dokumen")
          .count("* as total")
          .where("status", "active")
          .first(),

        // Metric 2: Tamu Berkunjung Hari Ini
        DB("trs_kunjungan")
          .count("* as total")
          .whereRaw("DATE(created_at) = CURDATE()")
          .first(),

        // Metric 3: Surat Disposisi Menunggu Tindak Lanjut
        DB("trs_disposisi_surat")
          .count("* as total")
          .where("status", "baru")
          .first(),

        // Metric 4: Retensi Expired
        DB("trs_dokumen as d")
          .count("* as total")
          .join("mst_jadwal_retensi as rs", "d.kode_retensi", "rs.kode_retensi")
          .where("d.status", "active")
          .whereRaw("DATE_ADD(d.tanggal, INTERVAL rs.tahun_retensi YEAR) <= NOW()")
          .first(),

        // Chart: Dokumen diunggah 7 hari terakhir (per hari)
        DB("trs_dokumen")
          .select(DB.raw("DATE(created_at) as tanggal"), DB.raw("COUNT(*) as total"))
          .whereRaw("created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)")
          .where("status", "active")
          .groupByRaw("DATE(created_at)")
          .orderByRaw("DATE(created_at) ASC"),

        // Audit Log: 10 aktivitas terbaru
        DB("mst_riwayat_audit")
          .select("id", "username as nama_pengguna", "aksi", "status", "created_at")
          .orderBy("created_at", "desc")
          .limit(10),
      ]);

    // ── 2. Format angka metric ────────────────────────────────────────────────
    const nArsipAktif = Number(oArsipAktif?.total) || 0;
    const nTamuHariIni = Number(oTamuHariIni?.total) || 0;
    const nDisposisi = Number(oDisposisi?.total) || 0;
    const nRetensi = Number(vaRetensi?.total) || 0;

    // ── 3. Format chart data (7 hari terakhir, Sen-Min) ───────────────────────
    const vaNamaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const vaLabels = [];
    const vaData = [];

    for (let i = 6; i >= 0; i--) {
      const dTarget = new Date();
      dTarget.setDate(dTarget.getDate() - i);

      const cTanggal = dTarget.toISOString().slice(0, 10); // YYYY-MM-DD
      const cHari = vaNamaHari[dTarget.getDay()];

      vaLabels.push(cHari);

      // Cari data di hasil query
      const oFound = vaChartRaw.find((oItem) => {
        const cItemDate =
          oItem.tanggal instanceof Date
            ? oItem.tanggal.toISOString().slice(0, 10)
            : String(oItem.tanggal).slice(0, 10);
        return cItemDate === cTanggal;
      });

      vaData.push(oFound ? Number(oFound.total) : 0);
    }

    // ── 4. Format audit logs dengan relative time ─────────────────────────────
    const vaColorPalette = [
      "#6366f1", "#10b981", "#0ea5e9", "#f59e0b",
      "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
    ];

    const vaAuditLogs = vaAuditRaw.map((oLog, nIndex) => {
      const cRelativeTime = _getRelativeTime(oLog.created_at);

      return {
        id: oLog.id,
        user: oLog.nama_pengguna,
        action: oLog.aksi,
        time: cRelativeTime,
        color: vaColorPalette[nIndex % vaColorPalette.length],
      };
    });

    // ── 5. Response ───────────────────────────────────────────────────────────
    const oResult = {
      status: "success",
      message: "Dashboard summary retrieved successfully",
      data: {
        summary: {
          arsipAktif: nArsipAktif,
          tamuHariIni: nTamuHariIni,
          menungguDisposisi: nDisposisi,
          retensiExpired: nRetensi,
        },
        chartMingguan: {
          labels: vaLabels,
          data: vaData,
        },
        auditLogs: vaAuditLogs,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve dashboard summary",
      error: error.message,
    };

    Logging(error, {
      file: "dashboard_summary.js",
      func: "getDashboardSummary",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

/**
 * Helper: Konversi datetime ke relative time string (bahasa Indonesia)
 */
const _getRelativeTime = (dDate) => {
  if (!dDate) return "-";

  const dNow = new Date();
  const dInput = new Date(dDate);
  const nDiffMs = dNow - dInput;
  const nDiffSeconds = Math.floor(nDiffMs / 1000);
  const nDiffMinutes = Math.floor(nDiffSeconds / 60);
  const nDiffHours = Math.floor(nDiffMinutes / 60);
  const nDiffDays = Math.floor(nDiffHours / 24);

  if (nDiffSeconds < 60) return "Baru saja";
  if (nDiffMinutes < 60) return `${nDiffMinutes} menit yang lalu`;
  if (nDiffHours < 24) return `${nDiffHours} jam yang lalu`;
  if (nDiffDays < 7) return `${nDiffDays} hari yang lalu`;

  return dInput.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default getDashboardSummary;
