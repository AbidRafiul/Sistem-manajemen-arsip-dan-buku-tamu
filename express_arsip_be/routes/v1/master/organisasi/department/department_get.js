import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/get_data", async (req, res) => {
  const oPayload = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    let query = DB("mst_departemen")
      .select(
        "id_departemen as id",
        "id_departemen",
        "id_cabang",
        "kode_departemen",
        "nama_departemen",
        "deskripsi",
        "status"
      )
      .where("status", "active");

    if (req.headers["x-filter-cabang"]) {
      query = query.whereIn("id_cabang", req.headers["x-filter-cabang"].split(","));
    }
    if (req.headers["x-filter-departemen"]) {
      query = query.where("id_departemen", req.headers["x-filter-departemen"]);
    }

    const vaData = await query;

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
