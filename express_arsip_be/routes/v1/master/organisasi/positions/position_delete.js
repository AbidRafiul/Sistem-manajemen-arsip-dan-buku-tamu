import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:id_jabatan", async (req, res) => {
  const cIdJabatan = req.params.id_jabatan;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";
  const oPayload = { id: cIdJabatan };

  try {
    const nUpdated = await DB("mst_jabatan")
      .where("id_jabatan", cIdJabatan)
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
      file: "position_delete.js",
      func: "delete",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
