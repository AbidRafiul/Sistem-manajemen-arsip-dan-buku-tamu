import express from "express";
import DB from "../../../core/config/knex.js";
import { datetime, status, formatDateSystem } from "../components/tools/general.js";
import { Logging } from "../components/tools/servertool.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const oPayload = req.query;
  const cNamaPengguna = req?.auth?.nama_pengguna || "";

  try {
    const userId = req.auth.id_pengguna;
    if (!userId) {
      return res.status(401).json({
        status: status.UNAUTHORIZED,
        message: "Sesi tidak valid",
        datetime: formatDateSystem()
      });
    }

    const oData = await DB("mst_pengguna as mu")
      .leftJoin("mst_pengguna_peran as mur", "mu.id_pengguna", "mur.id_pengguna")
      .leftJoin("mst_peran as mr", "mur.id_peran", "mr.id_peran")
      .select(
        "mu.id_pengguna",
        "mu.nama_lengkap",
        "mu.nama_pengguna",
        "mu.telepon",
        "mu.surel",
        "mr.nama_peran as role"
      )
      .where("mu.id_pengguna", userId)
      .first();

    if (!oData) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Profil tidak ditemukan",
        datetime: formatDateSystem()
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Profil ditemukan",
      datetime: formatDateSystem(),
      data: oData
    });

  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Gagal mengambil data profil",
      datetime: datetime(),
    };
    Logging(error, {
      file: "profile_get.js",
      func: "get",
      request: oPayload,
      response: oResult,
      user: cNamaPengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
