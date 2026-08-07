import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../components/tools/general.js";
import {
  Logging,
  validatePayload,
} from "../components/tools/servertool.js";

const router = express.Router();

// 1. GET - Retrieve all active letter types
// 1. GET - Retrieve all active letter types
router.get("/", async (req, res) => {
  const oPayload = req.body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const vaData = await DB("mst_jenis_surat")
      .select(
        "jenis_surat_id",
        "kode_jenis_surat",
        "nama_jenis_surat",
        "arah_surat",
        "deskripsi",
        "status"
      )
      .where("status", "active")
      .orderBy("created_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data jenis surat berhasil ditarik",
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
      file: "letter_type_management.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});


export default router;

