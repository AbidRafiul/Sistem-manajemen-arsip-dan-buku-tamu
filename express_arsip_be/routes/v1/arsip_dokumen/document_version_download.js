import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadDocumentVersion = async (req, res) => {
  try {
    const nVersionId = req.query.version_id || req.body?.version_id;

    if (!nVersionId) {
      const oResult = {
        status: "error",
        message: "version_id wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data versi dokumen
    const oVersion = await DB("trx_document_versions as v")
      .select(
        "v.version_id",
        "v.document_id",
        "v.version_number",
        "v.file_path",
        "v.approval_status",
        "d.document_name",
        "d.document_number"
      )
      .leftJoin("trx_documents as d", "v.document_id", "d.document_id")
      .where("v.version_id", nVersionId)
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
    const cRelativePath = oVersion.file_path.replace(/^\//, "");
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
    const cFileExtension = path.extname(oVersion.file_path);
    const cDownloadName = `${oVersion.document_number}_V${oVersion.version_number}${cFileExtension}`;

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
