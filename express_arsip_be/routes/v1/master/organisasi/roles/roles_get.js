import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const vaData = await DB("mst_peran")
      .select("id_peran as id", "nama_peran as name", "status")
      .where("status", "active");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data peran berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan sistem",
      datetime: formatDateSystem(),
    };
    Logging(error, {
      file: "roles_get.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
