import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createDocumentVersion = async (req, res) => {
  const oPayload = req.body;
  try {
    const nDocumentId = oPayload.document_id;
    const nVersionNumber = oPayload.version_number;
    const cChangeNotes = oPayload.change_notes;
    const cFilePath = oPayload.file_path;
    const dNow = new Date();

    const oData = {
      document_id: nDocumentId,
      version_number: nVersionNumber,
      change_notes: cChangeNotes,
      file_path: cFilePath,
      created_at: dNow,
      updated_at: dNow,
    };

    await DB("trx_document_versions").insert(oData);

    const oResult = {
      status: "success",
      message: "Document version created successfully",
      data: oData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to create document version",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_create.js",
      func: "createDocumentVersion",
      request: oPayload,
      response: oResult,
      user: req?.auth?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createDocumentVersion;
