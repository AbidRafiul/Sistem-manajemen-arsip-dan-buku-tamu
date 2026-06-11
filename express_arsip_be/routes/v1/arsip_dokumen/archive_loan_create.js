import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.DocumentId;
    const cBorrowerName = oPayload.BorrowerName;
    const dLoanDate = oPayload.LoanDate;
    const dExpectedReturnDate = oPayload.ExpectedReturnDate;
    const cPurpose = oPayload.Purpose || null;
    const dNow = new Date();

    // Validasi wajib
    if (!nDocumentId || !cBorrowerName || !dLoanDate || !dExpectedReturnDate) {
      const oResult = {
        status: "error",
        message: "DocumentId, BorrowerName, LoanDate, dan ExpectedReturnDate wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Validasi: ExpectedReturnDate tidak boleh sebelum LoanDate
    if (new Date(dExpectedReturnDate) <= new Date(dLoanDate)) {
      const oResult = {
        status: "error",
        message: "ExpectedReturnDate harus setelah LoanDate",
      };
      return res.status(422).json(oResult);
    }

    // Verifikasi dokumen aktif
    const oDocument = await DB("trx_documents")
      .where("DocumentId", nDocumentId)
      .where("Status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found or already inactive",
      };
      return res.status(404).json(oResult);
    }

    // Cek apakah dokumen sedang dipinjam (status = borrowed)
    const oActiveLoan = await DB("trx_archive_loans")
      .where("DocumentId", nDocumentId)
      .where("Status", "borrowed")
      .first();

    if (oActiveLoan) {
      const oResult = {
        status: "error",
        message: `Dokumen sedang dipinjam oleh ${oActiveLoan.BorrowerName} sejak ${oActiveLoan.LoanDate}. Tidak dapat mengajukan peminjaman baru.`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      DocumentId: nDocumentId,
      BorrowerName: cBorrowerName,
      LoanDate: dLoanDate,
      ExpectedReturnDate: dExpectedReturnDate,
      ReturnDate: null,
      Purpose: cPurpose,
      Status: "pending",
      ApprovedBy: null,
      ApprovedAt: null,
      ApprovalNotes: null,
      IsOverdue: 0,
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };

    const [nLoanId] = await DB("trx_archive_loans").insert(oData);

    const oResult = {
      status: "success",
      message: "Pengajuan peminjaman arsip berhasil dibuat dan menunggu approval",
      data: {
        LoanId: nLoanId,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to create archive loan",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_create.js",
      func: "createArchiveLoan",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createArchiveLoan;
