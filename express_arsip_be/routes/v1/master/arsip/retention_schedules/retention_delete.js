import express from "express";
import DB from "../../../../../core/config/knex.js";
import {
  datetime,
  formatDateSystem,
  status,
} from "../../../components/tools/general.js";
import { Logging } from "../../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:RetentionScheduleId", async (req, res) => {
  const cRetentionScheduleId = req.params.RetentionScheduleId;
  const nama_pengguna = req?.auth?.nama_pengguna || "";
  const oPayload = { id: cRetentionScheduleId };

  try {
    const nUpdated = await DB("mst_retention_schedule")
      .where("retention_schedule_id", cRetentionScheduleId)
      .update({ status: "nonactive", updated_at: new Date() });

    if (!nUpdated) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data tidak ditemukan",
        datetime: formatDateSystem(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil dihapus",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Sistem sedang maintenance harap tunggu sebentar",
      datetime: datetime(),
    };

    Logging(error, {
      file: "retention_delete.js",
      func: "delete",
      request: oPayload,
      response: oResult,
      user: nama_pengguna,
    });

    return res.status(500).json(oResult);
  }
});

export default router;
