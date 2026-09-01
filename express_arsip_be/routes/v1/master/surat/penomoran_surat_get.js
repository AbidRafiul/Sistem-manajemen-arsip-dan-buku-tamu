import express from "express";
import DB from "../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const keyword = String(req.query?.keyword || req.query?.search || "").trim();
    const query = DB("mst_penomoran_surat as mps").leftJoin("mst_jenis_surat as mjs", "mps.jenis_surat_id", "mjs.jenis_surat_id").select("mps.id_penomoran_surat", "mps.nama_penomoran", "mps.jenis_surat_id", "mjs.kode_jenis_surat", "mjs.nama_jenis_surat", "mps.format_nomor", "mps.jumlah_digit", "mps.nomor_awal", "mps.periode_reset", "mps.cakupan_sequence", "mps.tahap_penerbitan_nomor", "mps.status_aktif", "mps.created_by", "mps.updated_by", "mps.created_at", "mps.updated_at");
    if (keyword) {
      query.where(builder => {
        builder.where("mps.nama_penomoran", "like", `%${keyword}%`).orWhere("mps.format_nomor", "like", `%${keyword}%`).orWhere("mjs.nama_jenis_surat", "like", `%${keyword}%`);
      });
    }
    if (req.query?.status_aktif !== undefined && req.query.status_aktif !== "") {
      query.where("mps.status_aktif", Number(req.query.status_aktif));
    }
    if (req.query?.jenis_surat_id) {
      query.where("mps.jenis_surat_id", Number(req.query.jenis_surat_id));
    }
    const vaData = await query.orderBy("mps.updated_at", "desc");
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data penomoran surat berhasil diambil",
      datetime: formatDateSystem(),
      data: vaData,
      total_data: vaData.length
    });
  } catch (error) {
    await Logging(error, {
      file: "penomoran_surat_get.js",
      func: "get",
      request: req.query,
      user: req?.auth?.nama_pengguna || ""
    });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Data penomoran surat gagal diambil",
      datetime: datetime()
    });
  }
});
export default router;
