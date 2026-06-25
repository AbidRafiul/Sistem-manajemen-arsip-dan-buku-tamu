import express from "express";
import DB from "../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { body } = req;
  const oPayload = body;
  const nama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    // JOIN murni cuma buat ngambil peran dari mst_pengguna_perans
    const vaData = await DB("mst_pengguna as mu")
      .leftJoin("mst_pengguna_peran as mur", "mu.id_pengguna", "mur.id_pengguna")
      .leftJoin("mst_peran as mr", "mur.id_peran", "mr.id_peran")
      .select(
        "mu.nama_pengguna as nama_pengguna",
        "mu.nama_lengkap as nama_lengkap",
        "mu.telepon as telepon",
        "mu.status as status",
        "mu.created_at as created_at",
        "mr.nama_peran as role",
      )
      .orderBy("mu.created_at", "desc");

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
      message: "Sistem sedang maintenance",
      datetime: datetime(),
    };
    Logging(error, {
      file: "user_data.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
