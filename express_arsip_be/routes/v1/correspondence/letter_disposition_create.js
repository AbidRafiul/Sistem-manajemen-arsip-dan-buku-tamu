import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const letterDispositionCreate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      incoming_letter_id: Joi.number().required(),
      parent_disposition_id: Joi.number().allow(null).optional(),

      from_user_id: Joi.number().allow(null).optional(),
      to_user_id: Joi.number().required(),

      disposition_instruction_id: Joi.number().allow(null).optional(),

      instruction: Joi.string().allow(null, "").optional(),
      disposition_note: Joi.string().allow(null, "").optional(),
      due_date: Joi.date().allow(null).optional(),

      created_by: Joi.number().allow(null).optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "incoming_letter_id.required": "incoming_letter_id wajib diisi",
      "incoming_letter_id.number": "incoming_letter_id harus berupa angka",

      "to_user_id.required": "User tujuan disposisi wajib diisi",
      "to_user_id.number": "to_user_id harus berupa angka",
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

    const oLetter = await DB("trs_incoming_letters")
      .where("incoming_letter_id", oPayload.incoming_letter_id)
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
        message: "Surat masuk sudah selesai dan tidak dapat didisposisikan",
      });
    }

    const vaReferenceChecks = [
      {
        field: "from_user_id",
        table: "mst_users",
        key: "UserId",
        label: "User asal disposisi",
      },
      {
        field: "to_user_id",
        table: "mst_users",
        key: "UserId",
        label: "User tujuan disposisi",
      },
      {
        field: "disposition_instruction_id",
        table: "mst_disposition_instructions",
        key: "disposition_instruction_id",
        label: "Instruksi disposisi",
      },
      {
        field: "created_by",
        table: "mst_users",
        key: "UserId",
        label: "User pembuat",
      },
      {
        field: "updated_by",
        table: "mst_users",
        key: "UserId",
        label: "User pengubah",
      },
    ];

    for (const oReference of vaReferenceChecks) {
      const value = oPayload[oReference.field];

      if (value === undefined || value === null || value === "") {
        continue;
      }

      const oData = await DB(oReference.table)
        .where(oReference.key, value)
        .first();

      if (!oData) {
        return res.status(400).json({
          status: false,
          message: `${oReference.label} tidak ditemukan`,
        });
      }
    }

    if (oPayload.parent_disposition_id) {
      const oParentDisposition = await DB("trs_letter_dispositions")
        .where("disposition_id", oPayload.parent_disposition_id)
        .where("incoming_letter_id", oPayload.incoming_letter_id)
        .first();

      if (!oParentDisposition) {
        return res.status(404).json({
          status: false,
          message: "Parent disposisi tidak ditemukan pada surat ini",
        });
      }
    }

    const dNow = new Date();

    const nDispositionId = await DB.transaction(async (trx) => {
      const vaInserted = await trx("trs_letter_dispositions").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        parent_disposition_id: oPayload.parent_disposition_id || null,

        from_user_id: oPayload.from_user_id || null,
        to_user_id: oPayload.to_user_id,

        disposition_instruction_id: oPayload.disposition_instruction_id || null,

        instruction: oPayload.instruction || null,
        disposition_note: oPayload.disposition_note || null,
        due_date: oPayload.due_date || null,

        status: "baru",
        received_at: null,
        processed_at: null,
        completed_at: null,

        created_by: oPayload.created_by || null,
        updated_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const nId = vaInserted[0];

      await trx("trs_incoming_letters")
        .where("incoming_letter_id", oPayload.incoming_letter_id)
        .update({
          status: "didisposisi",
          updated_by: oPayload.updated_by || oPayload.created_by || null,
          updated_at: dNow,
        });

      await trx("trs_incoming_letter_trackings").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        disposition_id: nId,
        action_name: "surat_didisposisi",
        from_user_id: oPayload.from_user_id || null,
        to_user_id: oPayload.to_user_id,
        previous_status: oLetter.status,
        current_status: "didisposisi",
        notes: oPayload.disposition_note || oPayload.instruction || "Surat didisposisikan",
        processed_at: dNow,
        created_by: oPayload.created_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Disposisi surat berhasil dibuat",
      data: {
        disposition_id: nDispositionId,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Disposisi surat gagal dibuat",
      error: error.message,
    });
  }
};

router.post("/", letterDispositionCreate);

export default router;
