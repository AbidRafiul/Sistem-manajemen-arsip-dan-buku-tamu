import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:id_divisi", async (req, res) => {
  const cIdDivisi = req.params.id_divisi;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";
  const oPayload = { id: cIdDivisi };

  try {
    const nUpdated = await DB("mst_divisi")
      .where("id_divisi", cIdDivisi)
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
      file: "division_delete.js",
      func: "delete",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
