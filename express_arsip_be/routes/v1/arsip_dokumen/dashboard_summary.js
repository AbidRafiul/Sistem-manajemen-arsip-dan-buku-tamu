import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem, status } from "../components/tools/general.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

const getArchiveDashboardSummary = async (req, res) => {
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const fCabang = req.headers["x-filter-cabang"];
    const vaCabangIds = (fCabang && fCabang !== "null" && fCabang !== "undefined")
      ? String(fCabang).split(",").map(Number)
      : null;

    const applyCabangDocFilter = (qb, tableAlias = "") => {
      if (!vaCabangIds) return qb;
      const col = tableAlias ? `${tableAlias}.id_cabang` : "id_cabang";
      return qb.whereIn(col, vaCabangIds);
    };

    const applyCabangLoanFilter = (qb, tableAlias = "") => {
      if (!vaCabangIds) return qb;
      const col = tableAlias ? `${tableAlias}.id_cabang` : "id_cabang";
      return qb.whereIn(col, vaCabangIds);
    };

    const [
      nPengarsipanDokumen,
      nDokumenDipinjam,
      nDokumenDariSurat,
      vaJenisDokumenGroups,
      vaTrendRaw,
      vaBorrowedRaw
    ] = await Promise.all([
      // 1. Total Pengarsipan Dokumen (trs_dokumen berstatus active)
      applyCabangDocFilter(DB("trs_dokumen").where("status", "active"))
        .count("* as count")
        .first()
        .then((r) => Number(r?.count || 0)),

      // 2. Total Dokumen Dipinjam (trs_peminjaman_arsip berstatus borrowed)
      applyCabangLoanFilter(DB("trs_peminjaman_arsip").where("status", "borrowed"))
        .count("* as count")
        .first()
        .then((r) => Number(r?.count || 0)),

      // 3. Total Pengarsipan dari Modul Surat (trs_surat_masuk)
      DB("trs_surat_masuk")
        .count("* as count")
        .first()
        .then((r) => Number(r?.count || 0)),

      // 4. Pengelompokan dokumen berdasarkan jenis (untuk circle chart)
      applyCabangDocFilter(
        DB("trs_dokumen as d")
          .leftJoin("mst_jenis_dokumen as jd", "d.kode_jenis_dokumen", "jd.kode_jenis_dokumen")
          .select(
            DB.raw("COALESCE(jd.nama_jenis_dokumen, d.kode_jenis_dokumen) as label"),
            DB.raw("COUNT(d.id_dokumen) as count")
          )
          .where("d.status", "active"),
        "d"
      ).groupBy(DB.raw("COALESCE(jd.nama_jenis_dokumen, d.kode_jenis_dokumen)")),

      // 5. Trend pengarsipan 7 hari terakhir
      applyCabangDocFilter(
        DB("trs_dokumen")
          .select(DB.raw("DATE(created_at) as tanggal"), DB.raw("COUNT(*) as total"))
          .whereRaw("created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)")
          .where("status", "active")
      )
        .groupByRaw("DATE(created_at)")
        .orderByRaw("DATE(created_at) ASC"),

      // 6. Daftar peminjaman aktif (sedang dipinjam)
      applyCabangLoanFilter(
        DB("trs_peminjaman_arsip as p")
          .leftJoin("trs_dokumen as d", "p.kode_dokumen", "d.kode_dokumen")
          .select(
            "p.id_peminjaman",
            "p.kode_dokumen",
            "d.nama_dokumen",
            "p.nama_peminjam",
            "p.tanggal_pinjam",
            "p.tanggal_pengembalian",
            "p.keperluan",
            "p.status"
          )
          .where("p.status", "borrowed"),
        "p"
      ).orderBy("p.tanggal_pinjam", "desc")
    ]);

    // Format trend mingguan (7 hari terakhir)
    const vaNamaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const vaLabels = [];
    const vaDataTrend = [];

    for (let i = 6; i >= 0; i--) {
      const dTarget = new Date();
      dTarget.setDate(dTarget.getDate() - i);

      const cTanggal = dTarget.toISOString().slice(0, 10); // YYYY-MM-DD
      const cHari = vaNamaHari[dTarget.getDay()];

      vaLabels.push(cHari);

      const oFound = vaTrendRaw.find((oItem) => {
        const cItemDate =
          oItem.tanggal instanceof Date
            ? oItem.tanggal.toISOString().slice(0, 10)
            : String(oItem.tanggal).slice(0, 10);
        return cItemDate === cTanggal;
      });

      vaDataTrend.push(oFound ? Number(oFound.total) : 0);
    }

    const oData = {
      metrics: {
        pengarsipanDokumen: nPengarsipanDokumen,
        dokumenDipinjam: nDokumenDipinjam,
        dokumenDariSurat: nDokumenDariSurat
      },
      chartData: vaJenisDokumenGroups.map((group) => ({
        label: group.label,
        count: Number(group.count || 0)
      })),
      weeklyTrend: {
        labels: vaLabels,
        data: vaDataTrend
      },
      borrowedList: vaBorrowedRaw.map((b) => ({
        id_peminjaman: b.id_peminjaman,
        kode_dokumen: b.kode_dokumen,
        nama_dokumen: b.nama_dokumen || "Tanpa Judul",
        nama_peminjam: b.nama_peminjam,
        tanggal_pinjam: b.tanggal_pinjam,
        tanggal_pengembalian: b.tanggal_pengembalian,
        keperluan: b.keperluan || "-",
        status: b.status
      }))
    };

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ringkasan arsip berhasil dimuat",
      datetime: formatDateSystem(),
      data: oData
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Gagal memuat ringkasan dashboard arsip",
      datetime: formatDateSystem()
    };

    Logging(error, {
      file: "dashboard_summary.js",
      func: "getArchiveDashboardSummary",
      response: oResult,
      user: nama_pengguna
    });

    return res.status(500).json(oResult);
  }
};

router.get("/summary", getArchiveDashboardSummary);

export default router;
