import express from "express";
import path from "path";
import fs from "fs";
import DB from "../../../core/config/knex.js";
import { downloadFileFromMinio } from "../../../core/components/tools/minio_helper.js";

const router = express.Router();

const outgoingLetterFileDownload = async (req, res) => {
  try {
    const nFileId =
      req.params[0] ||
      req.params.id_file_surat_keluar ||
      req.query.id_file_surat_keluar ||
      req.query.id_surat_keluar ||
      req.body?.id_file_surat_keluar ||
      req.body?.id_surat_keluar;

    let oFile = null;

    if (nFileId) {
      const cStrParam = String(nFileId).trim();
      if (/^\d+$/.test(cStrParam)) {
        oFile = await DB("trs_file_surat_keluar")
          .where("id_file_surat_keluar", cStrParam)
          .where("status", "active")
          .first();

        if (!oFile) {
          oFile = await DB("trs_file_surat_keluar")
            .where("id_surat_keluar", cStrParam)
            .where("status", "active")
            .orderBy("id_file_surat_keluar", "desc")
            .first();
        }
      } else {
        const cleanParamPath = cStrParam.replace(/\\/g, "/").replace(/^\/+/, "");
        oFile = await DB("trs_file_surat_keluar")
          .where("path_file", "like", `%${cleanParamPath}%`)
          .where("status", "active")
          .first();
        if (!oFile) {
          // If not in DB, create virtual file object for MinIO stream
          const ext = path.extname(cleanParamPath).toLowerCase();
          let mimeType = "application/pdf";
          if (ext === ".docx" || ext === ".doc") {
            mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          }
          oFile = {
            path_file: cleanParamPath,
            nama_file: path.basename(cleanParamPath),
            mime_type: mimeType,
          };
        }
      }
    }

    if (!oFile) {
      return res.status(404).json({
        status: false,
        message: "File surat keluar tidak ditemukan",
      });
    }

    const cFilePath = oFile.path_file;
    const cFileName = oFile.nama_file || path.basename(cFilePath);
    const cMimeType = oFile.mime_type || "application/pdf";
    const cBucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
    const cObjectName = cFilePath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/^uploads\//, "");

    try {
      const oStream = await downloadFileFromMinio(cBucketName, cObjectName);

      res.setHeader("Content-Type", cMimeType);
      res.setHeader("Content-Disposition", `inline; filename="${cFileName}"`);

      return oStream.pipe(res);
    } catch (minioError) {
      console.warn(
        "[MinIO Download Warning]: File tidak ditemukan di MinIO, mencoba lokal disk fallback:",
        minioError.message
      );
    }

    const cUploadRoot = path.resolve(process.cwd(), "uploads", "surat_keluar");
    const cAbsolutePath = path.resolve(process.cwd(), cFilePath);
    const cRelativePath = path.relative(cUploadRoot, cAbsolutePath);
    const bIsLocalUploadPath =
      cRelativePath !== "" &&
      !cRelativePath.startsWith("..") &&
      !path.isAbsolute(cRelativePath);

    if (!bIsLocalUploadPath || !fs.existsSync(cAbsolutePath)) {
      return res.status(404).json({
        status: false,
        message: "File tidak ditemukan di MinIO maupun di server lokal",
      });
    }

    res.setHeader("Content-Type", cMimeType);
    res.setHeader("Content-Disposition", `inline; filename="${cFileName}"`);
    return res.sendFile(cAbsolutePath);
  } catch (error) {
    console.error("[Outgoing File Download Error]:", error);

    return res.status(500).json({
      status: false,
      message: "File surat keluar gagal dibuka",
      error: error.message,
    });
  }
};

router.get("/:id_file_surat_keluar?", outgoingLetterFileDownload);
router.get("/*", outgoingLetterFileDownload);
router.post("/", outgoingLetterFileDownload);

export default router;
