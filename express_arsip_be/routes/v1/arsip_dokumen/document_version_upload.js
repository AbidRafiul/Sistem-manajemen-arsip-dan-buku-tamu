import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const uploadDocumentVersion = async (req, res) => {
  const oPayload = req.body;

  try {
    const oFile = req.file;

    if (!oFile) {
      const oResult = {
        status: "error",
        message: "File dokumen wajib diunggah",
      };

      return res.status(400).json(oResult);
    }

    const cFilePath = `/uploads/documents/${oFile.filename}`;
    const nDocumentId = parseInt(oPayload.DocumentId, 10);
    const cChangeNotes = oPayload.ChangeNotes;

    const vaLastVersion = await DB("trx_document_versions")
      .select("VersionNumber")
      .where("DocumentId", nDocumentId)
      .orderBy("VersionNumber", "desc")
      .limit(1);

    let nVersionNumber = 1;
    if (vaLastVersion.length > 0) {
      nVersionNumber = vaLastVersion[0].VersionNumber + 1;
    }

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
      message: "Versi dokumen berhasil diunggah",
      data: oData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Gagal mengunggah versi dokumen",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_upload.js",
      func: "uploadDocumentVersion",
      request: oPayload,
      response: oResult,
      user: req?.auth?.username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default uploadDocumentVersion;
