import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getOverdueLoans = async (req, res) => {
  try {
    const dToday = new Date().toISOString().split("T")[0];

    // Ambil peminjaman yang overdue:
    // 1. terlambat = 1 (sudah dikembalikan terlambat)
    // 2. Status = 'borrowed' dan tanggal_pengembalian sudah lewat (belum kembali, sudah terlambat)
    const vaData = await DB("trx_peminjaman_arsip as l")
      .select(
        "l.id_peminjaman",
        "l.kode_dokumen",
        "l.nama_peminjam",
        "l.tanggal_pinjam",
        "l.tanggal_pengembalian",
        "l.tanggal_kembali",
        "l.keperluan",
        "l.status",
        "l.terlambat",
        "l.disetujui_oleh",
        "l.created_at",
        // Data dokumen
        "d.nama_dokumen",
        "d.nomor_dokumen",
        "d.lokasi_fisik",
        // Kalkulasi hari keterlambatan
        DB.raw(`DATEDIFF(?, l.tanggal_pengembalian) as OverdueDays`, [dToday])
      )
      .leftJoin("trx_dokumen as d", "l.kode_dokumen", "d.kode_dokumen")
      .where((oBuilder) => {
        oBuilder
          // Sudah dikembalikan terlambat
          .where("l.terlambat", 1)
          // ATAU masih dipinjam tapi sudah lewat expected return date
          .orWhere((oInner) => {
            oInner
              .where("l.status", "borrowed")
              .where("l.tanggal_pengembalian", "<", dToday);
          });
      })
      .orderBy("l.tanggal_pengembalian", "asc");

    const oResult = {
      status: "success",
      message: "Overdue loans retrieved successfully",
      data: vaData,
      total: vaData.length,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve overdue loans",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_overdue_get.js",
      func: "getOverdueLoans",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getOverdueLoans;
