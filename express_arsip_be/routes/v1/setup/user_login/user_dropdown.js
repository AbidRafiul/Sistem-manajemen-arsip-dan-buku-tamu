import express from "express";
import DB from "../../../../core/config/knex.js";
import { formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const vaData = await DB("mst_pengguna as u")
      .leftJoin("mst_pengguna_peran as ur", "u.id_pengguna", "ur.id_pengguna")
      .leftJoin("mst_peran as r", "ur.id_peran", "r.id_peran")
      .select(
        "u.id_pengguna",
        "u.nama_lengkap",
        "u.nama_pengguna",
        "u.telepon",
        "r.nama_peran as role",
      )
      .where("u.status", "active")
      .orderBy("u.nama_lengkap", "asc");

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
      message: "Data user gagal diambil",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "user_dropdown.js",
      func: "post",
      request: req.body,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
