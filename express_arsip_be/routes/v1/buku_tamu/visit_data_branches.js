import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { getDescendantBranchIds, Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/branches", async (req, res) => {
  try {
    const oPayload = req.body || {};
    let query = DB("mst_cabang").select("id_cabang as id", "nama_cabang as name", "id_induk").whereNot("status", "deleted");
    if (!oPayload.is_public && !oPayload.isPublic && !oPayload.all && req.headers["x-filter-cabang"]) {
      query = query.whereIn("id_cabang", req.headers["x-filter-cabang"].split(",").map(Number));
    }
    const listCabang = await query;
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listCabang,
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Gagal memuat list cabang",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_data_branches.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;