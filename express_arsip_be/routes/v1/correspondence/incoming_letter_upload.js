import express from "express";
import multer from "multer";
import DB from "../../../core/config/knex.js";
import {
  removeFileFromMinio,
  uploadFileToMinio,
} from "../../../core/components/tools/minio_helper.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const vaAllowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ];

    if (!vaAllowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Format file tidak didukung"));
    }

    cb(null, true);
  },
});

const incomingLetterUpload = async (req, res) => {
  const cBucketName = process.env.MINIO_BUCKET_NAME || "arsip-bucket";
  let cObjectName = null;
  let bObjectPersisted = false;

  try {
    const oPayload = req.body || {};
    const oFile = req.file;

    if (!oPayload.surat_masuk_id) {
      return res.status(400).json({
        status: false,
        message: "id surat masuk wajib diisi",
      });
    }

    if (!oFile) {
      return res.status(400).json({
        status: false,
        message: "File wajib diupload",
      });
    }

    const oLetter = await DB("trs_surat_masuk")
      .where("surat_masuk_id", oPayload.surat_masuk_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    cObjectName = await uploadFileToMinio(
      cBucketName,
      oFile,
      "correspondence/surat_masuk",
    );

    const dNow = new Date();
    let vaInserted;
    let vaReplacedFiles = [];

    await DB.transaction(async (trx) => {
      vaReplacedFiles = await trx("trs_file_surat_masuk")
        .select("file_surat_masuk_id", "path_file")
        .where("surat_masuk_id", oPayload.surat_masuk_id)
        .where("status", "active")
        .forUpdate();

      if (vaReplacedFiles.length > 0) {
        await trx("trs_file_surat_masuk")
          .where("surat_masuk_id", oPayload.surat_masuk_id)
          .where("status", "active")
          .update({
            status: "nonactive",
            updated_at: dNow,
          });
      }

      vaInserted = await trx("trs_file_surat_masuk").insert({
        surat_masuk_id: oPayload.surat_masuk_id,
        path_file: cObjectName,
        nama_file: oFile.originalname,
        tipe_mime_file: oFile.mimetype,
        ukuran_file: oFile.size,
        uploaded_by: oPayload.uploaded_by || oPayload.UploadedBy || null,
        status: "active",
        created_at: dNow,
        updated_at: dNow,
      });

      await trx("trs_tracking_surat_masuk").insert({
        surat_masuk_id: oPayload.surat_masuk_id,
        disposisi_surat_id: null,
        nama_aksi: "file_surat_diupload",
        dari_pengguna_id: null,
        kepada_pengguna_id: null,
        status_sebelumnya: oLetter.status,
        status_saat_ini: oLetter.status,
        catatan:
          vaReplacedFiles.length > 0
            ? `File surat diganti dengan ${oFile.originalname}`
            : `File ${oFile.originalname} berhasil diupload`,
        processed_at: dNow,
        created_by: oPayload.uploaded_by || oPayload.UploadedBy || null,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    bObjectPersisted = true;

    for (const oReplacedFile of vaReplacedFiles) {
      const cReplacedPath = oReplacedFile.path_file?.replace(/\\/g, "/");
      const bIsLegacyLocalFile =
        !cReplacedPath || /^\/?uploads\/surat_masuk\//.test(cReplacedPath);

      if (bIsLegacyLocalFile) continue;

      try {
        await removeFileFromMinio(
          cBucketName,
          cReplacedPath.replace(/^\/+/, ""),
        );
      } catch (cleanupError) {
        console.error(
          `Gagal menghapus file lama ${cReplacedPath} dari MinIO:`,
          cleanupError.message,
        );
      }
    }

    return res.status(201).json({
      status: true,
      message:
        vaReplacedFiles.length > 0
          ? "File surat masuk berhasil diganti"
          : "File surat masuk berhasil diupload",
      data: {
        file_surat_masuk_id: vaInserted[0],
        path_file: cObjectName,
        nama_file: oFile.originalname,
        tipe_mime_file: oFile.mimetype,
        ukuran_file: oFile.size,
      },
    });
  } catch (error) {
    console.log(error);

    if (cObjectName && !bObjectPersisted) {
      try {
        await removeFileFromMinio(cBucketName, cObjectName);
      } catch (cleanupError) {
        console.error(
          "Gagal membersihkan file surat masuk dari MinIO:",
          cleanupError.message,
        );
      }
    }

    return res.status(500).json({
      status: false,
      message: "File surat masuk gagal diupload",
      error: error.message,
    });
  }
};

router.post("/", upload.single("File"), incomingLetterUpload);

export default router;
