import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentVersions = async (req, res) => {
  const oQuery = req.query;

  try {
    const nDocumentId = oQuery.document_id;

    if (!nDocumentId) {
      const oResult = {
        status: "error",
        message: "document_id is required",
      };

      return res.status(422).json(oResult);
    }

    const oDocument = await DB("trx_documents")
      .select("document_id")
      .where("document_id", nDocumentId)
      .where("status", "active")
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
        "version_id",
        "document_id",
        "version_number",
        "change_notes",
        "file_path",
        "created_at",
        "updated_at"
      )
      .where("document_id", nDocumentId)
      .orderBy("version_number", "desc");

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
