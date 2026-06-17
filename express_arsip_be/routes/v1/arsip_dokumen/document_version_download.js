import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadDocumentVersion = async (req, res) => {
  try {
    const nVersionId = req.query.VersionId || req.body?.VersionId;

    if (!nVersionId) {
      const oResult = {
        status: "error",
        message: "VersionId wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data versi dokumen
    const oVersion = await DB("trx_document_versions as v")
      .select(
        "v.VersionId",
        "v.DocumentId",
        "v.VersionNumber",
        "v.FilePath",
        "v.ApprovalStatus",
        "d.DocumentName",
        "d.DocumentNumber"
      )
      .leftJoin("trx_documents as d", "v.DocumentId", "d.DocumentId")
      .where("v.VersionId", nVersionId)
      .first();

    if (!oVersion) {
      const oResult = {
        status: "error",
        message: "Document version not found",
      };
      return res.status(404).json(oResult);
    }

    // Bangun absolute path file
    // FilePath tersimpan sebagai /uploads/documents/filename.ext
    const cRelativePath = oVersion.FilePath.replace(/^\//, "");
    const cAbsolutePath = path.join(__dirname, "../../../../public", cRelativePath);

    // Cek file ada di disk
    if (!fs.existsSync(cAbsolutePath)) {
      const oResult = {
        status: "error",
        message: "File fisik tidak ditemukan di server",
      };
      return res.status(404).json(oResult);
    }

    // Tentukan nama file download
    const cFileExtension = path.extname(oVersion.FilePath);
    const cDownloadName = `${oVersion.DocumentNumber}_V${oVersion.VersionNumber}${cFileExtension}`;

    res.setHeader("Content-Disposition", `attachment; filename="${cDownloadName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    return res.sendFile(cAbsolutePath);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to download document version",
      error: error.message,
    };

    Logging(error, {
      file: "document_version_download.js",
      func: "downloadDocumentVersion",
      request: oQuery,
      response: oResult,
      user: req?.context?.Username || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default downloadDocumentVersion;
