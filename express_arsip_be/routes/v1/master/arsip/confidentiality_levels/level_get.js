import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

const getConfidentialityLevel = async (req, res) => {
  const oPayload = req.body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const vaData = await DB("mst_tingkat_kerahasiaan")
      .select(
        "id_tingkat_kerahasiaan",
        "kode_tingkat_kerahasiaan",
        "nama_tingkat_kerahasiaan",
        "tingkat_kerahasiaan",
        "deskripsi",
        "status"

      )
      .where("status", "active")
      .orderBy("tingkat_kerahasiaan", "asc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data tingkat kerahasiaan berhasil ditarik",
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
      file: "level_get.js",
      func: "getConfidentialityLevel",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", getConfidentialityLevel);

export default router;
