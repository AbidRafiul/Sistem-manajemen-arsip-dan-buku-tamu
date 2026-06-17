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
        "l.loan_id",
        "l.document_id",
        "l.borrower_name",
        "l.loan_date",
        "l.expected_return_date",
        "l.return_date",
        "l.purpose",
        "l.status",
        "l.is_overdue",
        "l.approved_by",
        "l.created_at",
        // Data dokumen
        "d.document_name",
        "d.document_number",
        "d.physical_location",
        // Kalkulasi hari keterlambatan
        DB.raw(`DATEDIFF(?, l.expected_return_date) as OverdueDays`, [dToday])
      )
      .leftJoin("trx_documents as d", "l.document_id", "d.document_id")
      .where((oBuilder) => {
        oBuilder
          // Sudah dikembalikan terlambat
          .where("l.is_overdue", 1)
          // ATAU masih dipinjam tapi sudah lewat expected return date
          .orWhere((oInner) => {
            oInner
              .where("l.status", "borrowed")
              .where("l.expected_return_date", "<", dToday);
          });
      })
      .orderBy("l.expected_return_date", "asc");

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
