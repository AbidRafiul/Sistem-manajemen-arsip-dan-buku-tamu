import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { getDescendantBranchIds, Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/purposes", async (req, res) => {
  try {
    const listTujuan = await DB("mst_tujuan_kunjungan").select("id_tujuan_kunjungan as id", "nama_tujuan_kunjungan as name");
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listTujuan,
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Gagal memuat list tujuan",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_data_purposes.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;