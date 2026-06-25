import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const getDocumentTypes = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";

    const vaData = await DB("mst_document_type")
      .select(
        "document_type_id",
        "document_type_code",
        "document_type_name",
        "deskripsi",
        "status",
      )
      .where("status", cStatus)
      .orderBy("document_type_name", "asc");

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
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default getDocumentTypes;
