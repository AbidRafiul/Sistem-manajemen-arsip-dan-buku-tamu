import express from "express";
import path from "path";
import fs from "fs";
import DB from "../../../core/config/knex.js";

const router = express.Router();

const incomingLetterFileDownload = async (req, res) => {
  try {
    const nFileId = req.query.incoming_letter_file_id || req.body?.incoming_letter_file_id;

    if (!nFileId) {
      return res.status(400).json({
        status: false,
        message: "incoming_letter_file_id wajib diisi",
      });
    }

    const oFile = await DB("trx_incoming_letter_files")
      .where("incoming_letter_file_id", nFileId)
      .where("status", "active")
      .first();

    if (!oFile) {
      return res.status(404).json({
        status: false,
        message: "File surat masuk tidak ditemukan",
      });
    }

    const cUploadRoot = path.resolve(process.cwd(), "uploads", "incoming_letters");
    const cAbsolutePath = path.resolve(process.cwd(), oFile.file_path);

    if (!cAbsolutePath.startsWith(cUploadRoot)) {
      return res.status(400).json({
        status: false,
        message: "Path file tidak valid",
      });
    }

    if (!fs.existsSync(cAbsolutePath)) {
      return res.status(404).json({
        status: false,
        message: "File fisik tidak ditemukan di server",
      });
    }

    const cFileName = oFile.file_name || path.basename(cAbsolutePath);
    res.setHeader("Content-Type", oFile.file_mime_type || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${cFileName}"`);

    return res.sendFile(cAbsolutePath);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "File surat masuk gagal dibuka",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterFileDownload);

export default router;
