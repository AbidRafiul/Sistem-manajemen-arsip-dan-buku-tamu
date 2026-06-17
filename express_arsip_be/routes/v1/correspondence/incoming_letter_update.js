import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterUpdate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      incoming_letter_id: Joi.number().required(),

      agenda_number: Joi.string().max(100).optional(),
      letter_number: Joi.string().max(100).optional(),
      letter_date: Joi.date().optional(),
      received_date: Joi.date().optional(),
      sender_name: Joi.string().max(150).optional(),
      sender_institution: Joi.string().max(150).allow(null, "").optional(),
      subject: Joi.string().max(255).optional(),
      attachment_description: Joi.string().allow(null, "").optional(),

      letter_type_id: Joi.number().allow(null).optional(),
      document_type_id: Joi.number().allow(null).optional(),
      archive_classification_id: Joi.number().allow(null).optional(),
      confidentiality_level_id: Joi.number().allow(null).optional(),

      status: Joi.string()
        .valid("baru", "diproses", "didisposisi", "selesai")
        .optional(),

      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "incoming_letter_id.required": "incoming_letter_id wajib diisi",
      "incoming_letter_id.number": "incoming_letter_id harus berupa angka",

      "agenda_number.max": "Nomor agenda maksimal 100 karakter",
      "letter_number.max": "Nomor surat maksimal 100 karakter",
      "sender_name.max": "Nama pengirim maksimal 150 karakter",
      "subject.max": "Perihal maksimal 255 karakter",

      "status.valid":
        "status hanya boleh baru, diproses, didisposisi, atau selesai",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["agenda_number"],
      table: "trx_incoming_letters",
      excludedField: "incoming_letter_id",
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

    const vaReferenceChecks = [
      {
        field: "letter_type_id",
        table: "mst_letter_types",
        key: "letter_type_id",
        label: "Jenis surat",
      },
      {
        field: "document_type_id",
        table: "mst_document_type",
        key: "DocumentTypeId",
        label: "Tipe dokumen",
      },
      {
        field: "archive_classification_id",
        table: "mst_archive_classifications",
        key: "ArchiveClassificationId",
        label: "Klasifikasi arsip",
      },
      {
        field: "confidentiality_level_id",
        table: "mst_confidentiality_levels",
        key: "ConfidentialityLevelId",
        label: "Level kerahasiaan",
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

    const dNow = new Date();

    const oUpdate = {
      agenda_number: oPayload.agenda_number,
      letter_number: oPayload.letter_number,
      letter_date: oPayload.letter_date,
      received_date: oPayload.received_date,
      sender_name: oPayload.sender_name,
      sender_institution: oPayload.sender_institution,
      subject: oPayload.subject,
      attachment_description: oPayload.attachment_description,
      letter_type_id: oPayload.letter_type_id,
      document_type_id: oPayload.document_type_id,
      archive_classification_id: oPayload.archive_classification_id,
      confidentiality_level_id: oPayload.confidentiality_level_id,
      status: oPayload.status,
      updated_by: oPayload.updated_by || null,
      updated_at: dNow,
    };

    Object.keys(oUpdate).forEach((cKey) => {
      if (oUpdate[cKey] === undefined) {
        delete oUpdate[cKey];
      }
    });

    await DB.transaction(async (trx) => {
      await trx("trx_incoming_letters")
        .where("incoming_letter_id", oPayload.incoming_letter_id)
        .update(oUpdate);

      await trx("trx_incoming_letter_trackings").insert({
        incoming_letter_id: oPayload.incoming_letter_id,
        disposition_id: null,
        action_name: "surat_diupdate",
        from_user_id: null,
        to_user_id: null,
        previous_status: oLetter.status,
        current_status: oUpdate.status || oLetter.status,
        notes: "Data surat masuk diperbarui",
        processed_at: dNow,
        created_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Surat masuk berhasil diupdate",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal diupdate",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterUpdate);

export default router;
