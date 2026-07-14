import express from "express";
import DB from "../../../../../core/config/knex.js";
import { status, formatDateSystem } from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.post("/get_data", async (req, res) => {
  const oPayload = req.body;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";

  try {
    let query = DB("mst_divisi")
      .select(
        "mst_divisi.id_divisi as id",
        "mst_divisi.id_divisi",
        "mst_divisi.id_departemen",
        "mst_divisi.kode_divisi",
        "mst_divisi.nama_divisi",
        "mst_divisi.deskripsi",
        "mst_divisi.status"
      )
      .whereNot("mst_divisi.status", "deleted");

    console.log("division_get headers:", req.headers);

    if (req.headers["x-filter-cabang"]) {
      query = query
        .join("mst_departemen", "mst_divisi.id_departemen", "mst_departemen.id_departemen")
        .whereIn("mst_departemen.id_cabang", req.headers["x-filter-cabang"].split(","));
    }
    if (req.headers["x-filter-departemen"]) {
      query = query.where("mst_divisi.id_departemen", req.headers["x-filter-departemen"]);
    }
    if (req.headers["x-filter-divisi"]) {
      query = query.where("mst_divisi.id_divisi", req.headers["x-filter-divisi"]);
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