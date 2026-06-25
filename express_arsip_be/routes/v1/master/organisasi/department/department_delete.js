import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  status,
  formatDateSystem,
  datetime,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:id_departemen", async (req, res) => {
  const cIdDepartemen = req.params.id_departemen;
  const cnama_pengguna = req?.auth?.nama_pengguna || "";
  const oPayload = { id: cIdDepartemen };

  try {
    const nUpdated = await DB("mst_departemen")
      .where("id_departemen", cIdDepartemen)
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
      file: "department_delete.js",
      func: "delete",
      request: oPayload,
      response: oResult,
      user: cnama_pengguna,
    });
    return res.status(500).json(oResult);
  }
});

export default router;
