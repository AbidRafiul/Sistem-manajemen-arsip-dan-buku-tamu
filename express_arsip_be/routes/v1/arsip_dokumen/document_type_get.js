import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentTypes = async (req, res) => {
  try {
    const cStatus = req.query.Status || "active";

    const vaData = await DB("mst_document_type")
      .select(
        "DocumentTypeId",
        "DocumentTypeCode",
        "DocumentTypeName",
        "Description",
        "Status"
      )
      .where("Status", cStatus)
      .orderBy("DocumentTypeName", "asc");

    const oResult = {
      status: "success",
      message: "Document types retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve document types",
      error: error.message,
    };

    Logging(error, {
      file: "document_type_get.js",
      func: "getDocumentTypes",
      request: req.query,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentTypes;
