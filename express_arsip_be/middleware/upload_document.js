import multer from "multer";
import { uploadFileToMinio } from "../core/components/tools/minio_helper.js";

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

      // Extract active branch ID from header or context
      let idCabang = null;
      const cFilterCabang = req.headers["x-filter-cabang"];
      if (cFilterCabang && cFilterCabang !== "null" && cFilterCabang !== "undefined") {
        const firstId = parseInt(String(cFilterCabang).split(",")[0], 10);
        if (!isNaN(firstId)) idCabang = firstId;
      }
      if (!idCabang) {
        idCabang = req.context?.id_cabang || req.auth?.id_cabang || null;
      }

      // Extract metadata for clean enterprise file naming
      const nomorDokumen = req.body?.nomor_dokumen || "";
      const namaDokumen = req.body?.nama_dokumen || "";

      // Upload ke MinIO dengan penamaan berbasis metadata
      const objectName = await uploadFileToMinio(bucketName, req.file, {
        idCabang,
        modul: "arsip-dokumen",
        nomorDokumen,
        namaDokumen
      });

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
