import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getArchiveLoans = async (req, res) => {
  const oQuery = req.query;

  try {
    const nLoanId = oQuery.loan_id;
    const nDocumentId = oQuery.document_id;
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

    const oData = DB("trx_archive_loans as l")
      .leftJoin("trx_documents as d", "l.document_id", "d.document_id")
      .select(
        "l.loan_id",
        "l.document_id",
        "d.document_name",
        "d.document_number",
        "l.borrower_name",
        "l.loan_date",
        "l.return_date",
        "l.purpose",
        "l.status",
        "l.created_at",
        "l.updated_at"
      )
      .orderBy("l.loan_id", "desc");

    if (nLoanId) {
      oData.where("l.loan_id", nLoanId);
    }

    if (nDocumentId) {
      oData.where("l.document_id", nDocumentId);
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
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getArchiveLoans;
