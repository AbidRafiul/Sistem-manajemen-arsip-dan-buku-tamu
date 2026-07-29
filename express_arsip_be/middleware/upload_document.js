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

      // Extract metadata for structured filename
      let cNomorDokumen = req.body.nomor_dokumen || req.body.kode_dokumen || req.body.nomor_surat || "";
      let cNamaDokumen = req.body.nama_dokumen || req.body.perihal || "";

      // Lookup document metadata from DB if id_dokumen / kode_dokumen is present without metadata
      if ((!cNomorDokumen || !cNamaDokumen) && (req.body.id_dokumen || req.body.kode_dokumen)) {
        const docQuery = DB("trs_dokumen").select("nomor_dokumen", "nama_dokumen", "kode_dokumen");
        if (req.body.id_dokumen) {
          docQuery.where("id_dokumen", req.body.id_dokumen);
        } else {
          docQuery.where("kode_dokumen", req.body.kode_dokumen);
        }
        const foundDoc = await docQuery.first();
        if (foundDoc) {
          if (!cNomorDokumen) cNomorDokumen = foundDoc.nomor_dokumen || foundDoc.kode_dokumen;
          if (!cNamaDokumen) cNamaDokumen = foundDoc.nama_dokumen;
        }
      }

      // Upload ke MinIO dengan metadata penamaan terstruktur
      const cObjectName = await uploadFileToMinio(bucketName, req.file, {
        idCabang: uploaderIdCabang,
        modul: "arsip-dokumen",
        nomorDokumen: cNomorDokumen,
        namaDokumen: cNamaDokumen,
        version: req.body.nomor_versi ? `V${req.body.nomor_versi}` : "V1",
        customFolderPath: `${minioPrefix}/arsip-dokumen`
      });

      // Extract the filename portion for req.file.filename so downstream handles cFilePath correctly
      const baseName = cObjectName.split("/").pop();
      req.file.filename = baseName;
      req.file.path = cObjectName;

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
