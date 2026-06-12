import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getOverdueLoans = async (req, res) => {
  try {
    const dToday = new Date().toISOString().split("T")[0];

    // Ambil peminjaman yang overdue:
    // 1. IsOverdue = 1 (sudah dikembalikan terlambat)
    // 2. Status = 'borrowed' dan ExpectedReturnDate sudah lewat (belum kembali, sudah terlambat)
    const vaData = await DB("trx_archive_loans as l")
      .select(
        "l.LoanId",
        "l.DocumentId",
        "l.BorrowerName",
        "l.LoanDate",
        "l.ExpectedReturnDate",
        "l.ReturnDate",
        "l.Purpose",
        "l.Status",
        "l.IsOverdue",
        "l.ApprovedBy",
        "l.CreatedAt",
        // Data dokumen
        "d.DocumentName",
        "d.DocumentNumber",
        "d.PhysicalLocation",
        // Kalkulasi hari keterlambatan
        DB.raw(`DATEDIFF(?, l.ExpectedReturnDate) as OverdueDays`, [dToday])
      )
      .leftJoin("trx_documents as d", "l.DocumentId", "d.DocumentId")
      .where((oBuilder) => {
        oBuilder
          // Sudah dikembalikan terlambat
          .where("l.IsOverdue", 1)
          // ATAU masih dipinjam tapi sudah lewat expected return date
          .orWhere((oInner) => {
            oInner
              .where("l.Status", "borrowed")
              .where("l.ExpectedReturnDate", "<", dToday);
          });
      })
      .orderBy("l.ExpectedReturnDate", "asc");

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
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getOverdueLoans;
