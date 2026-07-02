import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/get_data", async (req, res) => {
  const oPayload = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    const vaData = await DB("mst_positions")
      .select(
        "id_jabatan as id",
        "id_jabatan",
        "kode_jabatan",
        "nama_jabatan",
        "tingkat_jabatan",
        "deskripsi",
        "status"
      )
      .whereNot("status", "deleted");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil ditarik",
      datetime: formatDateSystem(),
      data: vaData,
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Terjadi kesalahan sistem",
      datetime: formatDateSystem(),
    };
    Logging(error, { file: "get.js", func: "get", request: oPayload, response: oResult, user: cnama_pengguna });
    return res.status(500).json(oResult);
  }
});

export default router;
