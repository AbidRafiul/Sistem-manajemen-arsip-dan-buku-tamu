import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const returnArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nLoanId = oPayload.LoanId;
    const dReturnDate = oPayload.ReturnDate || null;
    const dNow = new Date();

    if (!nLoanId) {
      const oResult = {
        status: "error",
        message: "LoanId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data peminjaman
    const oLoan = await DB("trx_archive_loans")
      .where("LoanId", nLoanId)
      .first();

    if (!oLoan) {
      const oResult = {
        status: "error",
        message: "Archive loan not found",
      };
      return res.status(404).json(oResult);
    }

    if (oLoan.Status !== "borrowed") {
      const oResult = {
        status: "error",
        message: `Peminjaman tidak dalam status 'borrowed'. Status saat ini: '${oLoan.Status}'`,
      };
      return res.status(422).json(oResult);
    }

    // Tanggal pengembalian aktual
    const dActualReturnDate = dReturnDate ? new Date(dReturnDate) : dNow;

    // Deteksi keterlambatan: bandingkan tanggal kembali aktual vs ExpectedReturnDate
    const bIsOverdue =
      oLoan.ExpectedReturnDate &&
      new Date(dActualReturnDate) > new Date(oLoan.ExpectedReturnDate)
        ? 1
        : 0;

    const oData = {
      Status: "returned",
      ReturnDate: dActualReturnDate,
      IsOverdue: bIsOverdue,
      UpdatedAt: dNow,
    };

    await DB("trx_archive_loans")
      .where("LoanId", nLoanId)
      .update(oData);

    const cOverdueMessage = bIsOverdue
      ? ` (TERLAMBAT: seharusnya kembali ${oLoan.ExpectedReturnDate})`
      : "";

    const oResult = {
      status: "success",
      message: `Dokumen berhasil dikembalikan${cOverdueMessage}`,
      data: {
        LoanId: nLoanId,
        DocumentId: oLoan.DocumentId,
        BorrowerName: oLoan.BorrowerName,
        ExpectedReturnDate: oLoan.ExpectedReturnDate,
        IsOverdue: bIsOverdue,
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