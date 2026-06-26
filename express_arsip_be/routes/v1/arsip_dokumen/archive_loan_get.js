import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getArchiveLoans = async (req, res) => {
  const oQuery = req.query;

  try {
    const nLoanId = oQuery.id_peminjaman || oQuery.loan_id;
    const cKodeDokumen = oQuery.kode_dokumen || oQuery.document_code;
    const nIdDokumen = oQuery.id_dokumen || oQuery.document_id;
    const cStatus = oQuery.status;
    const vaAllowedStatus = [
      "pending",
      "approved",
      "borrowed",
      "returned",
      "rejected",
    ];

    if (cStatus && !vaAllowedStatus.includes(cStatus)) {
      const oResult = {
        status: "error",
        message: "Status is invalid",
      };

      return res.status(422).json(oResult);
    }

    const oData = DB("trs_peminjaman_arsip as l")
      .leftJoin("trs_dokumen as d", "l.kode_dokumen", "d.kode_dokumen")
      .select(
        "l.id_peminjaman",
        "l.kode_dokumen",
        "d.id_dokumen",
        "d.nama_dokumen",
        "d.nomor_dokumen",
        "l.nama_peminjam",
        "l.tanggal_pinjam",
        "l.tanggal_pengembalian",
        "l.tanggal_kembali",
        "l.keperluan",
        "l.status",
        "l.disetujui_oleh",
        "l.disetujui_pada",
        "l.catatan_persetujuan",
        "l.terlambat",
        "l.created_at",
        "l.updated_at",
      )
      .orderBy("l.id_peminjaman", "desc");

    if (nLoanId) {
      oData.where("l.id_peminjaman", nLoanId);
    }

    if (cKodeDokumen) {
      oData.where("l.kode_dokumen", cKodeDokumen);
    }

    if (nIdDokumen) {
      oData.where("d.id_dokumen", nIdDokumen);
    }

    if (cStatus) {
      oData.where("l.status", cStatus);
    }

    const vaData = await oData;

    const oResult = {
      status: "success",
      message: "Archive loans retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve archive loans",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_get.js",
      func: "getArchiveLoans",
      request: oQuery,
      response: oResult,
      user: req?.auth?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getArchiveLoans;
