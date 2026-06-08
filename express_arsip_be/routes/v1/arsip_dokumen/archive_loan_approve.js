import Knex from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const approveArchiveLoan = async (req, res) => {
  const oPayload = req.body;

  try {
    const nLoanId = oPayload.LoanId;
    const cStatus = oPayload.Status;

    if (!["approved", "rejected"].includes(cStatus)) {
      const oResult = {
        status: "error",
        message: "Status must be approved or rejected",
      };

      return res.status(422).json(oResult);
    }

    const dNow = new Date();

    const oData = {
      Status: cStatus,
      UpdatedAt: dNow,
    };

    const nUpdated = await Knex("trx_archive_loans")
      .where("LoanId", nLoanId)
      .update(oData);

    if (nUpdated === 0) {
      const oResult = {
        status: "error",
        message: "Archive loan not found",
      };

      return res.status(404).json(oResult);
    }

    const oResult = {
      status: "success",
      message: "Archive loan updated successfully",
      data: oData,
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
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default approveArchiveLoan;
