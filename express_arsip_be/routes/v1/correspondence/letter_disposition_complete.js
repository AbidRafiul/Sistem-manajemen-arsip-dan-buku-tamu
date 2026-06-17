import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionComplete = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      disposition_id: Joi.number().required(),
      complete_note: Joi.string().allow(null, "").optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "disposition_id.required": "disposition_id wajib diisi",
      "disposition_id.number": "disposition_id harus berupa angka",
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
      .where("disposition_id", oPayload.disposition_id)
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
        message: "Disposisi sudah selesai",
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
        message: "Surat masuk sudah selesai",
      });
    }

    const dNow = new Date();

    let bAllDispositionCompleted = false;

    await DB.transaction(async (trx) => {
      await trx("trx_letter_dispositions")
        .where("disposition_id", oPayload.disposition_id)
        .update({
          status: "selesai",
          received_at: oDisposition.received_at || dNow,
          processed_at: oDisposition.processed_at || dNow,
          completed_at: dNow,
          updated_by: oPayload.updated_by || null,
          updated_at: dNow,
        });

      await trx("trx_incoming_letter_trackings").insert({
        incoming_letter_id: oDisposition.incoming_letter_id,
        disposition_id: oPayload.disposition_id,
        action_name: "disposisi_selesai",
        from_user_id: oDisposition.from_user_id || null,
        to_user_id: oDisposition.to_user_id || null,
        previous_status: oLetter.status,
        current_status: "diproses",
        notes: oPayload.complete_note || "Disposisi telah diselesaikan",
        processed_at: dNow,
        created_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const vaUnfinishedDispositions = await trx("trx_letter_dispositions")
        .where("incoming_letter_id", oDisposition.incoming_letter_id)
        .whereNot("status", "selesai");

      if (vaUnfinishedDispositions.length === 0) {
        bAllDispositionCompleted = true;

        await trx("trx_incoming_letters")
          .where("incoming_letter_id", oDisposition.incoming_letter_id)
          .update({
            status: "selesai",
            updated_by: oPayload.updated_by || null,
            updated_at: dNow,
          });

        await trx("trx_incoming_letter_trackings").insert({
          incoming_letter_id: oDisposition.incoming_letter_id,
          disposition_id: oPayload.disposition_id,
          action_name: "surat_selesai",
          from_user_id: oDisposition.from_user_id || null,
          to_user_id: oDisposition.to_user_id || null,
          previous_status: oLetter.status,
          current_status: "selesai",
          notes: "Semua disposisi selesai, surat masuk dinyatakan selesai",
          processed_at: dNow,
          created_by: oPayload.updated_by || null,
          created_at: dNow,
          updated_at: dNow,
        });
      } else {
        await trx("trx_incoming_letters")
          .where("incoming_letter_id", oDisposition.incoming_letter_id)
          .update({
            status: "diproses",
            updated_by: oPayload.updated_by || null,
            updated_at: dNow,
          });
      }
    });

    return res.status(200).json({
      status: true,
      message: bAllDispositionCompleted
        ? "Disposisi selesai dan surat masuk telah selesai"
        : "Disposisi surat berhasil diselesaikan",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal diselesaikan",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionComplete);

export default router;