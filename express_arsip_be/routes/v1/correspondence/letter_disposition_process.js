import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionProcess = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      disid_jabatan: Joi.number().required(),
      process_note: Joi.string().allow(null, "").optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "disid_jabatan.required": "disid_jabatan wajib diisi",
      "disid_jabatan.number": "disid_jabatan harus berupa angka",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
      });
    }

    const oDisposition = await DB("trx_letter_dispositions")
      .where("disid_jabatan", oPayload.disid_jabatan)
      .first();

    if (!oDisposition) {
      return res.status(404).json({
        status: false,
        message: "Disposisi surat tidak ditemukan",
      });
    }

    if (oDisposition.status === "selesai") {
      return res.status(400).json({
        status: false,
        message: "Disposisi sudah selesai dan tidak dapat diproses ulang",
      });
    }

    if (oDisposition.status === "diproses") {
      return res.status(400).json({
        status: false,
        message: "Disposisi sudah dalam proses",
      });
    }

    const oLetter = await DB("trx_incoming_letters")
      .where("incoming_letter_id", oDisposition.incoming_letter_id)
      .first();

    if (!oLetter) {
      return res.status(404).json({
        status: false,
        message: "Surat masuk tidak ditemukan",
      });
    }

    if (oLetter.status === "selesai") {
      return res.status(400).json({
        status: false,
        message: "Surat masuk sudah selesai dan disposisi tidak dapat diproses",
      });
    }

    const dNow = new Date();

    await DB.transaction(async (trx) => {
      await trx("trx_letter_dispositions")
        .where("disid_jabatan", oPayload.disid_jabatan)
        .update({
          status: "diproses",
          received_at: oDisposition.received_at || dNow,
          processed_at: dNow,
          updated_by: oPayload.updated_by || null,
          updated_at: dNow,
        });

      await trx("trx_incoming_letters")
        .where("incoming_letter_id", oDisposition.incoming_letter_id)
        .update({
          status: "diproses",
          updated_by: oPayload.updated_by || null,
          updated_at: dNow,
        });

      await trx("trx_incoming_letter_trackings").insert({
        incoming_letter_id: oDisposition.incoming_letter_id,
        disid_jabatan: oPayload.disid_jabatan,
        action_name: "disposisi_diproses",
        from_nama_pengguna: oDisposition.from_nama_pengguna || null,
        to_nama_pengguna: oDisposition.to_nama_pengguna || null,
        previous_status: oLetter.status,
        current_status: "diproses",
        notes: oPayload.process_note || "Disposisi mulai diproses",
        processed_at: dNow,
        created_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Disposisi surat berhasil diproses",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal diproses",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionProcess);

export default router;
