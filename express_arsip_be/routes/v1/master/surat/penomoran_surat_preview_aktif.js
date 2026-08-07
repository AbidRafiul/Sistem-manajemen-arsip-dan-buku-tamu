import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { previewActiveNomorSurat } from "../../components/tools/letter_numbering_service.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { validatePayload, Logging } from "../../components/tools/servertool.js";
import { validationMessages } from "./penomoran_surat_helper.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const cValidation = await validatePayload({
      jenis_surat_id: Joi.number().integer().positive().required().label("Jenis Surat"),
      id_unit_kerja: Joi.number().integer().positive().allow(null).optional().label("Unit Kerja"),
      tanggal_surat: Joi.date().allow(null).optional().label("Tanggal Surat")
    }, validationMessages, req.body || {});
    if (cValidation) {
      return res.status(422).json({
        status: status.BAD_REQUEST,
        message: cValidation,
        datetime: datetime()
      });
    }
    const nomor_surat = await previewActiveNomorSurat(DB, {
      jenisSuratId: Number(req.body?.jenis_surat_id),
      unitKerjaId: req.body?.id_unit_kerja || req?.auth?.id_unit_kerja || req?.context?.id_unit_kerja || req?.headers?.["x-filter-unit-kerja"] || null,
      tanggalSurat: req.body?.tanggal_surat
    });
    return res.status(200).json({
      status: status.SUKSES,
      message: "Preview nomor surat aktif berhasil dibuat",
      datetime: formatDateSystem(),
      data: {
        nomor_surat
      }
    });
  } catch (error) {
    const oResult = {
      status: status.BAD_REQUEST,
      message: error.message || "Preview nomor surat aktif gagal dibuat",
      datetime: datetime()
    };
    Logging(error, {
      file: "penomoran_surat_preview_aktif.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: ""
    });
    return res.status(400).json(oResult);
  }
});
export default router;