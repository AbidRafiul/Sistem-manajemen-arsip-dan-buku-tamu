import express from "express";
import DB from "../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";
const router = express.Router();
router.get("/:id", async (req, res) => {
  try {
    const vaData = await DB("mst_penomoran_surat as mps").leftJoin("mst_jenis_surat as mjs", "mps.jenis_surat_id", "mjs.jenis_surat_id").select("mps.*", "mjs.kode_jenis_surat", "mjs.nama_jenis_surat").where("mps.id_penomoran_surat", req.params.id).first();
    if (!vaData) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Penomoran surat tidak ditemukan",
        datetime: datetime()
      });
    }
    return res.status(200).json({
      status: status.SUKSES,
      message: "Detail penomoran surat berhasil diambil",
      datetime: formatDateSystem(),
      data: vaData
    });
  } catch (error) {
    await Logging(error, {
      file: "penomoran_surat_detail.js",
      func: "detail",
      request: req.params,
      user: req?.auth?.nama_pengguna || ""
    });
    return res.status(500).json({
      status: status.BAD_REQUEST,
      message: "Detail penomoran surat gagal diambil",
      datetime: datetime()
    });
  }
});
export default router;
