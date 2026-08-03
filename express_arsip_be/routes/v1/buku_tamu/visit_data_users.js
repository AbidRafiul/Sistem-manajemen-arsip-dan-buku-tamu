import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { getDescendantBranchIds, Logging } from "../components/tools/servertool.js";
const router = express.Router();
router.post("/users", async (req, res) => {
  try {
    const {
      id_cabang
    } = req.body;
    let query = DB("mst_pengguna as u").select("u.id_pengguna as id", "u.nama_lengkap as name", "u.id_cabang").where("u.status", "active");
    if (id_cabang && id_cabang !== "null" && id_cabang !== "undefined") {
      const branchIds = await getDescendantBranchIds(DB, id_cabang);
      query = query.whereIn("u.id_cabang", branchIds);
    }
    const listUser = await query.orderBy("u.nama_lengkap", "asc");
    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listUser,
      datetime: formatDateSystem()
    });
  } catch (error) {
    const oResult = {
      status: "01",
      message: "Gagal memuat list pegawai",
      datetime: formatDateSystem()
    };
    Logging(error, {
      file: "visit_data_users.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(500).json(oResult);
  }
});
export default router;