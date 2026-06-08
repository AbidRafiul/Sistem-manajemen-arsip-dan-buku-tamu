import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createArchiveLoan = async (req, res) => {
  try {
    const oPayload = req.body;

    const nDocumentId = oPayload.DocumentId;
    const cBorrowerName = oPayload.BorrowerName;
    const dLoanDate = oPayload.LoanDate;
    const dReturnDate = oPayload.ReturnDate;
    const cPurpose = oPayload.Purpose;
    const dNow = new Date();

    const oData = {
      DocumentId: nDocumentId,
      BorrowerName: cBorrowerName,
      LoanDate: dLoanDate,
      ReturnDate: dReturnDate,
      Purpose: cPurpose,
      CreatedAt: dNow,
      UpdatedAt: dNow,
    };

    await DB("trx_archive_loans").insert(oData);

    const oResult = {
      status: "success",
      message: "Archive loan created successfully",
      data: oData,
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
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createArchiveLoan;
