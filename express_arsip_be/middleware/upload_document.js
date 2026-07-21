import multer from "multer";
import DB from "../core/config/knex.js";
import { uploadFileToMinio, getMinioPrefix } from "../core/components/tools/minio_helper.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const vaAllowedMimeType = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
  ];

  if (vaAllowedMimeType.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Tipe file tidak diizinkan"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
}).single("file");

export const uploadDocument = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.code === "LIMIT_FILE_SIZE" ? "Ukuran file melebihi batas 50MB" : err.message,
      });
    }

    if (!req.file) {
      return next();
    }

    try {
      const bucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";

      let uploaderIdCabang = null, uploaderIdDept = null, uploaderIdDiv = null, uploaderIdUnit = null;
      const uploaderId = req.body.uploaded_by || req?.auth?.id_pengguna;
      if (uploaderId) {
        const uploader = await DB("mst_pengguna")
          .select("id_cabang", "id_departemen", "id_divisi", "id_unit_kerja")
          .where("id_pengguna", uploaderId).first();
        if (uploader) {
          uploaderIdCabang = uploader.id_cabang;
          uploaderIdDept = uploader.id_departemen;
          uploaderIdDiv = uploader.id_divisi;
          uploaderIdUnit = uploader.id_unit_kerja;
        }
      }

      // Fallback if not found in db
      if (!uploaderIdCabang && req.body.id_cabang) {
        uploaderIdCabang = req.body.id_cabang;
      } else if (!uploaderIdCabang && req?.auth?.id_cabang) {
        uploaderIdCabang = req.auth.id_cabang;
      }

      const minioPrefix = await getMinioPrefix(uploaderIdCabang, uploaderIdDept, uploaderIdDiv, uploaderIdUnit);

      // Upload ke MinIO di bawah folder 'arsip_dokumen'
      const objectName = await uploadFileToMinio(bucketName, req.file, `${minioPrefix}/arsip_dokumen`);

      // Extract the filename portion for req.file.filename so downstream handles cFilePath correctly
      const baseName = objectName.split("/").pop();
      req.file.filename = baseName;
      req.file.path = objectName;

      next();
    } catch (uploadError) {
      console.error("Gagal mengunggah file ke MinIO di middleware:", uploadError);
      return res.status(500).json({
        status: "error",
        message: "Gagal mengunggah file ke penyimpanan MinIO",
        error: uploadError.message,
      });
    }
  });
};
