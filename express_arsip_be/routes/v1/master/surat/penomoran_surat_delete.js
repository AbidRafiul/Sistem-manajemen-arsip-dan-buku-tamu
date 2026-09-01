import express from "express";
import DB from "../../../../core/config/knex.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { Logging } from "../../components/tools/servertool.js";

const router = express.Router();

router.delete("/:id", async (req, res) => {
  try {
    const used = await DB("trx_sequence_penomoran_surat")
      .where("id_penomoran_surat", req.params.id)
      .first();

    const updated = await DB("mst_penomoran_surat")
      .where("id_penomoran_surat", req.params.id)
      .update({
        status_aktif: 0,
        updated_by: req.body?.updated_by || null,
        updated_at: new Date(), tz: typeof req !== 'undefined' ? (req.context?.tz || req.headers?.['x-tz'] || 'Asia/Jakarta') : 'Asia/Jakarta',
      });

    if (!updated) {
      return res.status(404).json({ status: status.NOT_FOUND, message: "Penomoran surat tidak ditemukan", datetime: datetime() });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: used
        ? "Penomoran surat sudah digunakan, data dinonaktifkan"
        : "Penomoran surat berhasil dinonaktifkan",
      datetime: formatDateSystem(),
    });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat_delete.js", func: "delete", request: req.params, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Penomoran surat gagal dinonaktifkan", datetime: datetime() });
  }
});

export default router;
