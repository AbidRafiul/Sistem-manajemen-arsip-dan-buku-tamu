import minioClient from "../../../core/config/minio.js";
import { Logging } from "../components/tools/servertool.js";

const documentPreview = async (req, res) => {
  try {
    const cFileName = req.query.file_name;

    if (!cFileName) {
      return res.status(422).json({
        status: "error",
        message: "file_name wajib diisi",
      });
    }

    const cBucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
    // Contoh file_name: "/uploads/documents/filename.ext" -> "documents/filename.ext"
    const cObjectName = cFileName.replace(/^\/uploads\//, "").replace(/^\//, "");

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
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

export default documentPreview;
