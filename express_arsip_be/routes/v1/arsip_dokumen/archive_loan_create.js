import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nDocumentId = oPayload.document_id;
    const cBorrowerName = oPayload.borrower_name;
    const dLoanDate = oPayload.loan_date;
    const dExpectedReturnDate = oPayload.expected_return_date;
    const cPurpose = oPayload.purpose || null;
    const dNow = new Date();

    // Validasi wajib
    if (!nDocumentId || !cBorrowerName || !dLoanDate || !dExpectedReturnDate) {
      const oResult = {
        status: "error",
        message:
          "document_id, borrower_name, loan_date, dan expected_return_date wajib diisi",
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
      .where("document_id", nDocumentId)
      .where("status", "active")
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
      .where("document_id", nDocumentId)
      .where("status", "borrowed")
      .first();

    if (oActiveLoan) {
      const oResult = {
        status: "error",
        message: `Dokumen sedang dipinjam oleh ${oActiveLoan.borrower_name} sejak ${oActiveLoan.loan_date}. Tidak dapat mengajukan peminjaman baru.`,
      };
      return res.status(422).json(oResult);
    }

    const oData = {
      document_id: nDocumentId,
      borrower_name: cBorrowerName,
      loan_date: dLoanDate,
      expected_return_date: dExpectedReturnDate,
      return_date: null,
      purpose: cPurpose,
      status: "pending",
      approved_by: null,
      approved_at: null,
      approval_notes: null,
      is_overdue: 0,
      created_at: dNow,
      updated_at: dNow,
    };

    const [nLoanId] = await DB("trx_archive_loans").insert(oData);

    const oResult = {
      status: "success",
      message:
        "Pengajuan peminjaman arsip berhasil dibuat dan menunggu approval",
      data: {
        loan_id: nLoanId,
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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createArchiveLoan;
