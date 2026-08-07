import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload, Logging } from "../components/tools/servertool.js";
import { status } from "../components/tools/general.js";
import { insertIncomingLetterTracking } from "../components/tools/tracking_helper.js";

const router = express.Router();
const letterDispositionProcess = async (req, res) => {
  try {
    const oPayload = req.body || {};
    const oValidation = {
      disposisi_id: Joi.number().required(),
      process_note: Joi.string().allow(null, "").optional(),
      updated_by: Joi.number().allow(null).optional(),
    };
    const oMessage = {
      "disposisi_id.required": "id disposisi wajib diisi",
      "disposisi_id.number": "id disposisi harus berupa angka",
    };
    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      allowUnknown: false,
    });
    if (cValidate) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: cValidate,
      });
    }
    const oDisposition = await DB("trs_disposisi_surat")
      .where("disposisi_surat_id", oPayload.disposisi_id)
      .first();
    if (!oDisposition) {
      return res.status(404).json({
        status: status.BAD_REQUEST,
        message: "Disposisi surat tidak ditemukan",
      });
    }
    if (oDisposition.status === "selesai") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Disposisi sudah selesai dan tidak dapat diproses ulang",
      });
    }
    if (oDisposition.status === "diproses") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Disposisi sudah dalam proses",
      });
    }
    const oLetter = await DB("trs_surat_masuk")
      .where("surat_masuk_id", oDisposition.surat_masuk_id)
      .first();
    if (!oLetter) {
      return res.status(404).json({
        status: status.BAD_REQUEST,
        message: "Surat masuk tidak ditemukan",
      });
    }
    if (oLetter.status === "selesai") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Surat masuk sudah selesai dan disposisi tidak dapat diproses",
      });
    }
    const dNow = new Date();
    const nActorId = oPayload.updated_by || req?.auth?.id_pengguna || null;

    await DB.transaction(async (trx) => {
      await trx("trs_disposisi_surat")
        .where("disposisi_surat_id", oPayload.disposisi_id)
        .update({
          status: "diproses",
          received_at: oDisposition.received_at || dNow,
          processed_at: dNow,
          updated_by: nActorId,
          updated_at: dNow,
        });

      await trx("trs_surat_masuk")
        .where("surat_masuk_id", oDisposition.surat_masuk_id)
        .update({
          status: "diproses",
          updated_by: nActorId,
          updated_at: dNow,
        });

      await insertIncomingLetterTracking(trx, {
        surat_masuk_id: oDisposition.surat_masuk_id,
        disposisi_surat_id: oPayload.disposisi_id,
        nama_aksi: "disposisi_diproses",
        dari_pengguna_id: oDisposition.dari_pengguna_id || null,
        kepada_pengguna_id: oDisposition.kepada_pengguna_id || null,
        status_sebelumnya: oLetter.status,
        status_saat_ini: "diproses",
        catatan: oPayload.process_note || "Disposisi mulai diproses",
        processed_at: dNow,
        created_by: nActorId,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Disposisi surat berhasil diproses",
    });
  } catch (error) {
    console.log(error);
    const oResult = {
      status: status.BAD_REQUEST,
      message: "Disposisi surat gagal diproses",
      error: error.message,
    };
    Logging(error, {
      file: "letter_disposition_process.js",
      func: "handler",
      request: req.body || {},
      response: oResult,
      user: "",
    });
    return res.status(500).json(oResult);
  }
};

router.post("/", letterDispositionProcess);
export default router;