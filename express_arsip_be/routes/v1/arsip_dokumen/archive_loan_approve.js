import Knex from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const approveArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nLoanId = oPayload.LoanId;
    const cStatus = oPayload.Status;
    const cApprovalNotes = oPayload.ApprovalNotes || null;
    const cApprovedBy = req?.context?.Username || oPayload.ApprovedBy || "system";
    const dNow = new Date();

    if (!nLoanId) {
      const oResult = {
        status: "error",
        message: "LoanId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    if (!["approved", "rejected"].includes(cStatus)) {
      const oResult = {
        status: "error",
        message: "Status harus 'approved' atau 'rejected'",
      };
      return res.status(422).json(oResult);
    }

    // Cek loan ada dan masih pending
    const oLoan = await Knex("trx_archive_loans")
      .where("LoanId", nLoanId)
      .first();

    if (!oLoan) {
      const oResult = {
        status: "error",
        message: "Archive loan not found",
      };
      return res.status(404).json(oResult);
    }

    if (oLoan.Status !== "pending") {
      const oResult = {
        status: "error",
        message: `Peminjaman sudah diproses dengan status '${oLoan.Status}'`,
      };
      return res.status(422).json(oResult);
    }

    // Jika approved, ubah status jadi 'borrowed' (langsung bisa dipinjam)
    const cNewStatus = cStatus === "approved" ? "borrowed" : "rejected";

    const oData = {
      Status: cNewStatus,
      ApprovedBy: cApprovedBy,
      ApprovedAt: dNow,
      ApprovalNotes: cApprovalNotes,
      UpdatedAt: dNow,
    };

    await Knex("trx_archive_loans")
      .where("LoanId", nLoanId)
      .update(oData);

    const oResult = {
      status: "success",
      message: `Peminjaman arsip berhasil di-${cStatus === "approved" ? "setujui (status: borrowed)" : "tolak"}`,
      data: {
        LoanId: nLoanId,
        DocumentId: oLoan.DocumentId,
        BorrowerName: oLoan.BorrowerName,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to update archive loan",
      error: error.message,
    };

    Logging(error, {
      file: "archive_loan_approve.js",
      func: "approveArchiveLoan",
      request: oPayload,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default approveArchiveLoan;
