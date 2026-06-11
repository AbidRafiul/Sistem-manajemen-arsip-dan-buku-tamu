import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const deleteDocument = async (req, res) => {
  const oPayload = req.body;

  try {
    const vaDocumentId = Array.isArray(oPayload.DocumentId)
      ? oPayload.DocumentId
      : [oPayload.DocumentId];
    const dNow = new Date();

    if (!vaDocumentId.length || vaDocumentId.some((nDocumentId) => !nDocumentId)) {
      const oResult = {
        status: "error",
        message: "DocumentId is required",
      };

      return res.status(422).json(oResult);
    }

    const oData = {
      Status: "nonactive",
      UpdatedAt: dNow,
    };

    const nUpdated = await DB("trx_documents")
      .whereIn("DocumentId", vaDocumentId)
      .where("Status", "active")
      .update(oData);

    if (nUpdated === 0) {
      const oResult = {
        status: "error",
        message: "Document not found",
      };

      return res.status(404).json(oResult);
    }

    const oResult = {
      status: "success",
      message: "Document deleted successfully",
      data: {
        DocumentId: vaDocumentId,
        ...oData,
      },
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to delete document",
      error: error.message,
    };

    Logging(error, {
      file: "document_delete.js",
      func: "deleteDocument",
      request: oPayload,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default deleteDocument;
