import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const createDocumentVersion = async (req, res) => {
  const oPayload = req.body;
  try {

    const nDocumentId = oPayload.DocumentId;
    const nVersionNumber = oPayload.VersionNumber;
    const cChangeNotes = oPayload.ChangeNotes;
    const cFilePath = oPayload.FilePath;
    const dNow = new Date();

    const oData = {
      DocumentId: nDocumentId,
      VersionNumber: nVersionNumber,
      ChangeNotes: cChangeNotes,
      FilePath: cFilePath,
      CreatedAt: dNow,
      UpdatedAt: dNow,
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
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default createDocumentVersion;
