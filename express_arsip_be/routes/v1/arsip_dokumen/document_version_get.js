import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentVersions = async (req, res) => {
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
      .select("DocumentId")
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

    const vaData = await DB("trx_document_versions")
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

    const oResult = {
      status: "success",
      message: "Document versions retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document versions",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_get.js",
      func: "getDocumentVersions",
      request: oQuery,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentVersions;
