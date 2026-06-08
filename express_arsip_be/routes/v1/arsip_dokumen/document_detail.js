import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentDetail = async (req, res) => {
  const oQuery = req.query;

  try {
    const nDocumentId = oQuery.DocumentId;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "DocumentId is required",
      };

      return res.status(422).json(oResult);
    }

    const oDocument = await DB("trx_documents")
      .select(
        "DocumentId",
        "ArchiveClassificationId",
        "DocumentName",
        "DocumentNumber",
        "DocumentDate",
        "ExpiredDate",
        "PicName",
        "Status",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("DocumentId", nDocumentId)
      .where("Status", "active")
      .first();

    if (!oDocument) {
      const oResult = {
        status: "error",
        message: "Document not found",
      };

      return res.status(404).json(oResult);
    }

    const vaVersions = await DB("trx_document_versions")
      .select(
        "VersionId",
        "DocumentId",
        "VersionNumber",
        "ChangeNotes",
        "FilePath",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("DocumentId", nDocumentId)
      .orderBy("VersionNumber", "desc");

    const vaLoans = await DB("trx_archive_loans")
      .select(
        "LoanId",
        "DocumentId",
        "BorrowerName",
        "LoanDate",
        "ReturnDate",
        "Purpose",
        "Status",
        "CreatedAt",
        "UpdatedAt"
      )
      .where("DocumentId", nDocumentId)
      .orderBy("LoanId", "desc");

    const oResult = {
      status: "success",
      message: "Document detail retrieved successfully",
      data: {
        document: oDocument,
        versions: vaVersions,
        loans: vaLoans,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document detail",
      error: error.message,
    };

    Logging(error, {
      file: "document_detail.js",
      func: "getDocumentDetail",
      request: oQuery,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentDetail;
