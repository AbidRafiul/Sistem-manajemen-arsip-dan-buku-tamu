import minioClient from "../../../core/config/minio.js";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const documentPreview = async (req, res) => {
  try {
    let cFilePath =
      req.query.file_name ||
      req.query.file_path ||
      req.query.path_file ||
      req.body?.file_name ||
      req.body?.file_path ||
      req.body?.path_file;

    const nIdDokumen = req.query.id_dokumen || req.body?.id_dokumen;
    const cKodeDokumen = req.query.kode_dokumen || req.body?.kode_dokumen;

    // Jika file_path belum ada tapi id_dokumen / kode_dokumen dikirim, cari dari database
    if (!cFilePath && (nIdDokumen || cKodeDokumen)) {
      const oQuery = DB("trs_versi_dokumen as v")
        .select("v.file_path")
        .join("trs_dokumen as d", "v.kode_dokumen", "d.kode_dokumen");

      if (nIdDokumen) {
        oQuery.where("d.id_dokumen", nIdDokumen);
      } else if (cKodeDokumen) {
        oQuery.where("d.kode_dokumen", cKodeDokumen);
      }

      const oVersion = await oQuery
        .where("v.status_persetujuan", "approved")
        .orderBy("v.nomor_versi", "desc")
        .first();

      if (oVersion && oVersion.file_path) {
        cFilePath = oVersion.file_path;
      }
    }

    if (!cFilePath) {
      return res.status(422).json({
        status: "error",
        message: "file_name / file_path / id_dokumen / kode_dokumen wajib diisi",
      });
    }

    const cBucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
    const cObjectName = cFilePath.replace(/^\/uploads\//, "").replace(/^\//, "");

    minioClient.presignedGetObject(cBucketName, cObjectName, 3600, (err, presignedUrl) => {
      if (err) {
        console.error("Gagal men-generate presigned URL dari MinIO:", err);
        return res.status(500).json({
          status: "error",
          message: "Gagal men-generate URL preview",
          error: err.message,
        });
      }

      return res.status(200).json({
        status: "success",
        preview_url: presignedUrl,
        url: presignedUrl,
        data: {
          preview_url: presignedUrl,
          url: presignedUrl,
        },
      });
    });
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Gagal memproses pratinjau dokumen",
      error: error.message,
    };

    Logging(error, {
      file: "document_preview.js",
      func: "documentPreview",
      request: { ...req.query, ...req.body },
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default documentPreview;
