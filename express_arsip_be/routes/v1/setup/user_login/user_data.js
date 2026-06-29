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
    // DB aktif memakai nama kolom Inggris; response tetap pakai alias lama
    // supaya frontend setup/users tidak perlu berubah.
    const vaData = await DB("mst_pengguna as mu")
      .leftJoin("mst_pengguna_peran as mur", "mu.user_id", "mur.user_id")
      .leftJoin("mst_peran as mr", "mur.role_id", "mr.role_id")
      .select(
        "mu.user_id as id_pengguna",
        "mu.fullname as nama_lengkap",
        "mu.username as nama_pengguna",
        "mu.telepon as telepon",
        "mu.email as surel",
        "mu.branch_id as id_cabang",
        "mu.division_id as id_divisi",
        "mu.department_id as id_departemen",
        "mu.position_id as id_jabatan",
        "mu.work_unit_id as id_unit_kerja",
        "mu.status as status",
        "mu.created_at as created_at",
        "mr.role_id as id_peran",
        "mr.role_name as role",
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
