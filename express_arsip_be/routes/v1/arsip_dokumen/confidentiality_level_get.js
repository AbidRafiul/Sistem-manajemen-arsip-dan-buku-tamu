import express from "express";
import DB from "../../../core/config/knex.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

const getConfidentialityLevels = async (req, res) => {
  try {
    const cStatus = req.query.status || "active";

    const vaData = await DB("mst_tingkat_kerahasiaan")
      .select(
        "id_tingkat_kerahasiaan",
        "kode_tingkat_kerahasiaan",
        "nama_tingkat_kerahasiaan",
        "tingkat_kerahasiaan",
        "deskripsi",
        "status"
      )
      .where("status", cStatus)
      .orderBy("tingkat_kerahasiaan", "asc");

    const oResult = {
      status: "success",
      message: "Confidentiality levels retrieved successfully",
      data: vaData,
    };

    return res.status(200).json(oResult);
  } catch (error) {
    const oResult = {
      status: "error",
      message: "Failed to retrieve confidentiality levels",
      error: error.message,
    };

    Logging(error, {
      file: "confidentiality_level_get.js",
      func: "getConfidentialityLevels",
      request: req.query,
      response: oResult,
      user: req?.context?.nama_pengguna || "system",
    });

    return res.status(500).json(oResult);
  }
};

router.get("/", getConfidentialityLevels);
export default router;
