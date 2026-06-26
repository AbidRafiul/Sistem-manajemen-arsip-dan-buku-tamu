import express from "express";
import DB from "../../../../../core/config/knex.js"; // Sesuaikan path titiknya
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

const getDocumentCategory = async (req, res) => {
  const oPayload = req.body;
  const username = req?.auth?.username || "";

  try {
    const vaData = await DB("mst_kategori_dokumen")
      .select(
        "id_kategori_dokumen",
        "kode_klasifikasi",
        "kode_kategori_dokumen",
        "nama_kategori_dokumen",
        "deskripsi",
        "status"
      )
      .where("status", "active")
      .orderBy("created_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data ditemukan",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "category_get.js",
      func: "getDocumentCategory",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", getDocumentCategory);

export default router;