import express from "express";
import DB from "../../../core/config/knex.js";
import { formatDateSystem } from "../components/tools/general.js";
import { getPresignedUrlFromMinio } from "../../../core/components/tools/minio_helper.js";
import { applyMultiTenantFilter } from "../components/tools/filter_helper.js";
import { getDescendantBranchIds } from "../components/tools/servertool.js";

const router = express.Router();

router.post("/purposes", async (req, res) => {
  try {
    const listTujuan = await DB("mst_tujuan_kunjungan")
      .select("id_tujuan_kunjungan as id", "nama_tujuan_kunjungan as name");

    return res.status(200).json({
      status: "00",
      message: "OK",
      data: listTujuan,
      datetime: formatDateSystem()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "01", message: "Gagal memuat list tujuan", datetime: formatDateSystem() });
  }
});


export default router;

