import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import DB from "../../../core/config/knex.js";


const router = express.Router();

const cUploadDir = "uploads/incoming_letters";

if (!fs.existsSync(cUploadDir)) {
  fs.mkdirSync(cUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cUploadDir);
  },
  filename: (req, file, cb) => {
    const cExt = path.extname(file.originalname);
    const cBaseName = path
      .basename(file.originalname, cExt)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    const cFileName = `${Date.now()}_${cBaseName}${cExt}`;
    cb(null, cFileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
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
  try {
    const oPayload = req.body || {};
    const oFile = req.file;

    if (!oPayload.incoming_letter_id) {
      return res.status(400).json({
        status: false,
        message: "IncomingLetterId wajib diisi",
      });
    }

    if (!oFile) {
      return res.status(400).json({
        status: false,
        message: "File wajib diupload",
      });
    }

    const oLetter = await DB("trx_incoming_letters")
      .where("incoming_letter_id", oPayload.incoming_letter_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    const dNow = new Date();

    const vaInserted = await DB("trx_incoming_letter_files").insert({
      incoming_letter_id: oPayload.incoming_letter_id,
      file_path: oFile.path.replace(/\\/g, "/"),
      file_name: oFile.originalname,
      file_mime_type: oFile.mimetype,
      file_size: oFile.size,
      uploaded_by: oPayload.UploadedBy || null,
      status: "active",
      created_at: dNow,
      updated_at: dNow,
    });

    await DB("trx_incoming_letter_trackings").insert({
      incoming_letter_id: oPayload.incoming_letter_id,
      disposition_id: null,
      action_name: "file_surat_diupload",
      from_user_id: null,
      to_user_id: null,
      previous_status: oLetter.status,
      current_status: oLetter.status,
      notes: `File ${oFile.originalname} berhasil diupload`,
      processed_at: dNow,
      created_by: oPayload.UploadedBy || null,
      created_at: dNow,
      updated_at: dNow,
    });

    return res.status(201).json({
      status: true,
      message: "File surat masuk berhasil diupload",
      data: {
        incoming_letter_file_id: vaInserted[0],
        file_path: oFile.path.replace(/\\/g, "/"),
        file_name: oFile.originalname,
        file_mime_type: oFile.mimetype,
        file_size: oFile.size,
      },
    });
  } catch (error) {
    console.log(error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
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
