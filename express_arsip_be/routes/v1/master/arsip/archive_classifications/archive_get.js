import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const vaData = await DB("mst_archive_classifications")
      .select(
        "archive_classification_id",
        "classification_code",
        "classification_name",
        "deskripsi",
        "status",
      )
      .where("status", "active")
      .orderBy("created_at", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data klasifikasi arsip berhasil ditarik",
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
      file: "archive_get.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
