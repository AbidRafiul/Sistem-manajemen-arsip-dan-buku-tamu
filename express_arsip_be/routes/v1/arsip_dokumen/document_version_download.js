import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadDocumentVersion = async (req, res) => {
  try {
    const nVersionId = req.query.id_versi || req.query.version_id || req.body?.id_versi || req.body?.version_id;

    if (!nVersionId) {
      const oResult = {
        status: "error",
        message: "id_versi wajib diisi",
      };
      return res.status(422).json(oResult);
    }

    // Ambil data versi dokumen
    const oVersion = await DB("trs_versi_dokumen as v")
      .select(
        "v.id_versi",
        "v.kode_dokumen",
        "v.nomor_versi",
        "v.file_path",
        "v.status_persetujuan",
        "d.nama_dokumen",
        "d.nomor_dokumen"
      )
      .leftJoin("trs_dokumen as d", "v.kode_dokumen", "d.kode_dokumen")
      .where("v.id_versi", nVersionId)
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
    const cAbsolutePath = path.join(
      __dirname,
      "../../../../public",
      cRelativePath,
    );

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
    const cDownloadName = `${oVersion.nomor_dokumen}_V${oVersion.nomor_versi}${cFileExtension}`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${cDownloadName}"`,
    );
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
      request: req.query || {},
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default downloadDocumentVersion;
