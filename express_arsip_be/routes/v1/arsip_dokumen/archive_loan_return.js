import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const returnArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nLoanId = oPayload.loan_id;
    const dReturnDate = oPayload.return_date || null;
    const dNow = new Date();

    if (!nLoanId) {
      const oResult = {
        status: "error",
        message: "loan_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data peminjaman
    const oLoan = await DB("trx_archive_loans")
      .where("loan_id", nLoanId)
      .first();

    if (!oLoan) {
      const oResult = {
        status: "error",
        message: "Archive loan not found",
      };
      return res.status(404).json(oResult);
    }

    if (oLoan.status !== "borrowed") {
      const oResult = {
        status: "error",
        message: `Peminjaman tidak dalam status 'borrowed'. Status saat ini: '${oLoan.status}'`,
      };
      return res.status(422).json(oResult);
    }

    // Tanggal pengembalian aktual
    const dActualReturnDate = dReturnDate ? new Date(dReturnDate) : dNow;

    // Deteksi keterlambatan: bandingkan tanggal kembali aktual vs ExpectedReturnDate
    const bIsOverdue =
      oLoan.expected_return_date &&
      new Date(dActualReturnDate) > new Date(oLoan.expected_return_date)
        ? 1
        : 0;

    const oData = {
      status: "returned",
      return_date: dActualReturnDate,
      is_overdue: bIsOverdue,
      updated_at: dNow,
    };

    await DB("trx_archive_loans")
      .where("loan_id", nLoanId)
      .update(oData);

    const cOverdueMessage = bIsOverdue
      ? ` (TERLAMBAT: seharusnya kembali ${oLoan.expected_return_date})`
      : "";

    const oResult = {
      status: "success",
      message: `Dokumen berhasil dikembalikan${cOverdueMessage}`,
      data: {
        loan_id: nLoanId,
        document_id: oLoan.document_id,
        borrower_name: oLoan.borrower_name,
        expected_return_date: oLoan.expected_return_date,
        is_overdue: bIsOverdue,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to return archive loan",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_return.js",
      func: "returnArchiveLoan",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default returnArchiveLoan;