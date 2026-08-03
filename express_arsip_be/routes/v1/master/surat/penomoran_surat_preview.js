import express from "express";
import Joi from "joi";
import DB from "../../../../core/config/knex.js";
import { previewNomorSurat } from "../../components/tools/letter_numbering_service.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { validatePayload } from "../../components/tools/servertool.js";
import { validationMessages } from "./penomoran_surat_helper.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const validation = await validatePayload(
      {
        format_nomor: Joi.string().trim().max(255).required().label("Format Nomor"),
        jumlah_digit: Joi.number().integer().positive().required().label("Jumlah Digit"),
        nomor: Joi.number().integer().positive().required().label("Nomor"),
        jenis_surat_id: Joi.number().integer().positive().allow(null).optional().label("Jenis Surat"),
        id_unit_kerja: Joi.number().integer().positive().allow(null).optional().label("Unit Kerja"),
        tanggal_surat: Joi.date().allow(null).optional().label("Tanggal Surat"),
      },
      validationMessages,
      req.body || {}
    );

    if (validation) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: validation, datetime: datetime() });
    }

    const nomor_surat = await previewNomorSurat(DB, req.body || {});

    return res.status(200).json({
      status: status.SUKSES,
      message: "Preview nomor surat berhasil dibuat",
      datetime: formatDateSystem(),
      data: { nomor_surat },
    });
  } catch (error) {
    return res.status(400).json({
      status: status.BAD_REQUEST,
      message: error.message || "Preview nomor surat gagal dibuat",
      datetime: datetime(),
    });
  }
});

export default router;
