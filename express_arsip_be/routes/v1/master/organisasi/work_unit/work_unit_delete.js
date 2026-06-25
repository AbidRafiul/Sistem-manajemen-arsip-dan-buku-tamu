import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:mst_unit_kerja", async (req, res) => {
  const cIdUnitKerja = req.params.mst_unit_kerja;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";
  const oPayload = { id: cIdUnitKerja };

  try {
    const nUpdated = await DB("mst_unit_kerja")
      .where("mst_unit_kerja", cIdUnitKerja)
      .update({ status: "nonactive", updated_at: new Date() });

    if (!nUpdated)
      return res.status(404).json({
        message: "Data tidak ditemukan",
        datetime: formatDateSystem(),
      });
    return res.status(200).json({
      status: status.SUKSES,
      message: "Berhasil dihapus!",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Gagal menghapus",
      datetime: datetime(),
    };
    Logging(error, {
      file: "work_unit_delete.js",
      func: "delete",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
