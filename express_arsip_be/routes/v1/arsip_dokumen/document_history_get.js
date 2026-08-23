import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

/**
 * Get audit trail / history log for a document
 */
const getDocumentHistory = async (req, res) => {
  const oQuery = req.query;
  try {
    const cKodeDokumen = oQuery.kode_dokumen || oQuery.document_code;

    if (!cKodeDokumen) {
      return res.status(422).json({
        status: "error",
        message: "kode_dokumen wajib diisi",
      });
    }

    const vaHistory = await DB("trx_riwayat_dokumen")
      .select(
        "id_riwayat",
        "kode_dokumen",
        "aksi",
        "deskripsi",
        "detail_json",
        "dilakukan_oleh",
        "ip_alamat",
        "created_at"
      )
      .where("kode_dokumen", cKodeDokumen)
      .orderBy("created_at", "desc");

    // Parse detail_json for response
    const formatted = vaHistory.map((item) => ({
      ...item,
      detail_json:
        typeof item.detail_json === "string"
          ? JSON.parse(item.detail_json)
          : item.detail_json,
    }));

    return res.status(200).json({
      status: "success",
      message: "Riwayat perubahan dokumen berhasil diambil",
      data: formatted,
    });
  } catch (error) {
    Logging(error, {
      file: "document_history_get.js",
      func: "getDocumentHistory",
      request: oQuery,
    });
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil riwayat dokumen",
      error: error.message,
    });
  }
};

router.get("/", getDocumentHistory);
export default router;
