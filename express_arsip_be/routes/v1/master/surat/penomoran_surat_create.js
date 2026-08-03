import express from "express";
import DB from "../../../../core/config/knex.js";
import { validateNumberingFormat } from "../../components/tools/letter_numbering_service.js";
import { datetime, formatDateSystem, status } from "../../components/tools/general.js";
import { Logging, validatePayload } from "../../components/tools/servertool.js";
import { baseValidation, validationMessages, checkReference, ensureActiveUniqueness, normalizePayload } from "./penomoran_surat_helper.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const payload = normalizePayload(req.body || {});

  try {
    const validation = await validatePayload(baseValidation, validationMessages, req.body || {});
    if (validation) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: validation, datetime: datetime() });
    }

    const formatError = validateNumberingFormat(payload.format_nomor);
    if (formatError) {
      return res.status(422).json({ status: status.BAD_REQUEST, message: formatError, datetime: datetime() });
    }

    const referenceError = await checkReference({
      table: "mst_jenis_surat",
      key: "jenis_surat_id",
      value: payload.jenis_surat_id,
      label: "Jenis surat",
    });
    if (referenceError) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: referenceError, datetime: datetime() });
    }

    const uniqueError = await ensureActiveUniqueness(payload);
    if (uniqueError) {
      return res.status(400).json({ status: status.BAD_REQUEST, message: uniqueError, datetime: datetime() });
    }

    const now = new Date();
    const inserted = await DB("mst_penomoran_surat").insert({
      ...payload,
      updated_by: payload.updated_by || payload.created_by || null,
      created_at: now,
      updated_at: now,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "Penomoran surat berhasil dibuat",
      datetime: formatDateSystem(),
      data: { id_penomoran_surat: inserted[0] },
    });
  } catch (error) {
    await Logging(error, { file: "penomoran_surat_create.js", func: "create", request: payload, user: req?.auth?.nama_pengguna || "" });
    return res.status(500).json({ status: status.BAD_REQUEST, message: "Penomoran surat gagal dibuat", datetime: datetime() });
  }
});

export default router;
