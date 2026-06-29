import express from "express";
import DB from "../../../../core/config/knex.js";
import { formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const vaData = await DB("mst_pengguna as u")
      .leftJoin("mst_pengguna_peran as ur", "u.user_id", "ur.user_id")
      .leftJoin("mst_peran as r", "ur.role_id", "r.role_id")
      .select(
        "u.user_id as id_pengguna",
        "u.fullname as nama_lengkap",
        "u.username as nama_pengguna",
        "u.telepon as telepon",
        "r.role_name as role",
      )
      .where("u.status", "active")
      .orderBy("u.fullname", "asc");

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
