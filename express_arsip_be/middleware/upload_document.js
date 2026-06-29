import multer from "multer";
import { uploadFileToMinio } from "../core/components/tools/minio_helper.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const vaAllowedMimeType = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
    fileSize: 30 * 1024 * 1024, // 30MB limit
  },
}).single("file");

export const uploadDocument = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.code === "LIMIT_FILE_SIZE" ? "Ukuran file melebihi batas 30MB" : err.message,
      });
    }

    if (!req.file) {
      return next();
    }

    try {
      const bucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
      // Upload ke MinIO di bawah folder 'documents'
      const objectName = await uploadFileToMinio(bucketName, req.file, "documents");

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
