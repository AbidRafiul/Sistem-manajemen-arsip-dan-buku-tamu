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
      parent_disid_jabatan: Joi.number().allow(null).optional(),

      from_nama_pengguna: Joi.number().allow(null).optional(),
      to_nama_pengguna: Joi.number().required(),

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

      "to_nama_pengguna.required": "User tujuan disposisi wajib diisi",
      "to_nama_pengguna.number": "to_nama_pengguna harus berupa angka",
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

    const oLetter = await DB("trx_incoming_letters")
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
        field: "from_nama_pengguna",
        table: "mst_pengguna",
        key: "nama_pengguna",
        label: "User asal disposisi",
      },
      {
        field: "to_nama_pengguna",
        table: "mst_pengguna",
        key: "nama_pengguna",
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
        table: "mst_pengguna",
        key: "nama_pengguna",
        label: "User pembuat",
      },
      {
        field: "updated_by",
        table: "mst_pengguna",
        key: "nama_pengguna",
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

    if (oPayload.parent_disid_jabatan) {
      const oParentDisposition = await DB("trx_letter_dispositions")
        .where("disid_jabatan", oPayload.parent_disid_jabatan)
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

    const nDisIdJabatan = await DB.transaction(async (trx) => {
      const vaInserted = await trx("trx_letter_dispositions").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        parent_disid_jabatan: oPayload.parent_disid_jabatan || null,

        from_nama_pengguna: oPayload.from_nama_pengguna || null,
        to_nama_pengguna: oPayload.to_nama_pengguna,

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

      await trx("trx_incoming_letters")
        .where("incoming_letter_id", oPayload.incoming_letter_id)
        .update({
          status: "didisposisi",
          updated_by: oPayload.updated_by || oPayload.created_by || null,
          updated_at: dNow,
        });

      await trx("trx_incoming_letter_trackings").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        disid_jabatan: nId,
        action_name: "surat_didisposisi",
        from_nama_pengguna: oPayload.from_nama_pengguna || null,
        to_nama_pengguna: oPayload.to_nama_pengguna,
        previous_status: oLetter.status,
        current_status: "didisposisi",
        notes:
          oPayload.disposition_note ||
          oPayload.instruction ||
          "Surat didisposisikan",
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
        disid_jabatan: nDisIdJabatan,
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
