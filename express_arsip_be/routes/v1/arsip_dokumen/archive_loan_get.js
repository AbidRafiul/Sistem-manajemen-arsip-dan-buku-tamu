import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getArchiveLoans = async (req, res) => {
  const oQuery = req.query;

  try {
    const nLoanId = oQuery.LoanId;
    const nDocumentId = oQuery.DocumentId;
    const cStatus = oQuery.Status;
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

    const oData = DB("trx_archive_loans as l")
      .leftJoin("trx_documents as d", "l.DocumentId", "d.DocumentId")
      .select(
        "l.LoanId",
        "l.DocumentId",
        "d.DocumentName",
        "d.DocumentNumber",
        "l.BorrowerName",
        "l.LoanDate",
        "l.ReturnDate",
        "l.Purpose",
        "l.Status",
        "l.CreatedAt",
        "l.UpdatedAt"
      )
      .orderBy("l.LoanId", "desc");

    if (nLoanId) {
      oData.where("l.LoanId", nLoanId);
    }

    if (nDocumentId) {
      oData.where("l.DocumentId", nDocumentId);
    }

    if (cStatus) {
      oData.where("l.Status", cStatus);
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
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getArchiveLoans;
