import express from "express";
import DB from "../../../../core/config/knex.js";
import { formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.post("/vp-data", async (req, res) => {
  try {
    const vaData = await DB("mst_tujuan_kunjungan")
      .select(
        "id_tujuan_kunjungan as VisitPurposeId",
        "kode_tujuan_kunjungan as VisitPurposeCode",
        "nama_tujuan_kunjungan as VisitPurposeName",
        "deskripsi as Description",
        "status",
      )
      .where("status", "active")
      .orderBy("id_tujuan_kunjungan", "asc");

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
      message: "Data tujuan kunjungan gagal diambil",
      datetime: formatDateSystem(),
    };

    Logging(error, {
      file: "vp_data.js",
      func: "post",
      request: req.body,
      response: oResult,
      user: req?.auth?.nama_pengguna || "",
    });

    return res.status(500).json(oResult);
  }
});

export default router;
