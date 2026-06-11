import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const returnArchiveLoan = async (req, res) => {
    try {
        const oPayload = req.body;
        const nLoanId = oPayload.LoanId; 
        
        if (!nLoanId) {
            return res.status(422).json({
                status: "error",
                message: "LoanId is required"
            });
        }

        const dNow = new Date();
        const oData = {
            Status: "returned",
            UpdatedAt: dNow
        };

        const nUpdated = await DB("trx_archive_loans")
            .where("LoanId", nLoanId)
            .update(oData);

        if (nUpdated === 0) {
            return res.status(404).json({
                status: "error",
                message: "Archive loan not found"
            });
        }
        const oResult = {
            status: "success",
            message: "Archive loan returned successfully",
            data: {
                LoanId: nLoanId,
                Status: "returned"
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
            request: req.body,
            response: oResult,
            user: req?.auth?.username || "system",
        });
        return res.status(500).json(oResult);
    }
    }

    export default returnArchiveLoan;