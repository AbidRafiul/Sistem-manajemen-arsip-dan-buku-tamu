import express from "express";
import DB from "../../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.body;
  const username = req?.auth?.username || "";

  try {
    const vaData = await DB("mst_confidentiality_levels")
      .select(
        "confidentiality_level_id",
        "confidentiality_level_code",
        "confidentiality_level_name",
        "confidentiality_level", // <--- Angka levelnya
        "description",
        "status"
      )
      .where("status", "active")
      .orderBy("confidentiality_level", "asc"); // Urutkan berdasarkan levelnya

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
      func: "get",
      request: oPayload,
      response: oResult,
      user: username,
    });

    return res.status(500).json(oResult);
  }
});

export default router;