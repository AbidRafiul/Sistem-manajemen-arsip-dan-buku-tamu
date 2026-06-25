import express from "express";
import Joi from "joi";
import DB from "../../../core/config/knex.js";
import { validatePayload } from "../components/tools/servertool.js";

const router = express.Router();

const incomingLetterCreate = async (req, res) => {
  try {
    const oPayload = req.body || {};

    const oValidation = {
      agenda_number: Joi.string().max(100).required(),
      letter_number: Joi.string().max(100).required(),
      letter_date: Joi.date().required(),
      received_date: Joi.date().required(),
      sender_name: Joi.string().max(150).required(),
      sender_institution: Joi.string().max(150).allow(null, "").optional(),
      subject: Joi.string().max(255).required(),
      attachment_deskripsi: Joi.string().allow(null, "").optional(),
      letter_type_id: Joi.number().allow(null).optional(),
      document_type_id: Joi.number().allow(null).optional(),
      archive_classification_id: Joi.number().allow(null).optional(),
      confidentiality_level_id: Joi.number().allow(null).optional(),
      created_by: Joi.number().allow(null).optional(),
      updated_by: Joi.number().allow(null).optional(),
    };

    const oMessage = {
      "agenda_number.required": "Nomor agenda wajib diisi",
      "letter_number.required": "Nomor surat wajib diisi",
      "letter_date.required": "Tanggal surat wajib diisi",
      "received_date.required": "Tanggal diterima wajib diisi",
      "sender_name.required": "Pengirim wajib diisi",
      "subject.required": "Perihal wajib diisi",
    };

    const cValidate = await validatePayload(oValidation, oMessage, oPayload, {
      uniqueField: ["agenda_number"],
      table: "trx_incoming_letters",
      allowUnknown: false,
    });

    if (cValidate) {
      return res.status(400).json({
        status: false,
        message: cValidate,
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
        field: "created_by",
        table: "mst_pengguna",
        key: "NamaPengguna",
        label: "User pembuat",
      },
      {
        field: "updated_by",
        table: "mst_pengguna",
        key: "NamaPengguna",
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

    const nIncomingLetterId = await DB.transaction(async (trx) => {
      const vaInserted = await trx("trx_incoming_letters").insert({
        agenda_number: oPayload.agenda_number,
        letter_number: oPayload.letter_number,
        letter_date: oPayload.letter_date,
        received_date: oPayload.received_date,
        sender_name: oPayload.sender_name,
        sender_institution: oPayload.sender_institution || null,
        subject: oPayload.subject,
        attachment_deskripsi: oPayload.attachment_deskripsi || null,
        letter_type_id: oPayload.letter_type_id || null,
        document_type_id: oPayload.document_type_id || null,
        archive_classification_id: oPayload.archive_classification_id || null,
        confidentiality_level_id: oPayload.confidentiality_level_id || null,
        status: "baru",
        created_by: oPayload.created_by || null,
        updated_by: oPayload.updated_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      const nId = vaInserted[0];

      await trx("trx_incoming_letter_trackings").insert({
        incoming_letter_id: nId,
        disid_jabatan: null,
        action_name: "surat_dibuat",
        from_nama_pengguna: null,
        to_nama_pengguna: null,
        previous_status: null,
        current_status: "baru",
        notes: "Surat masuk dibuat",
        processed_at: dNow,
        created_by: oPayload.created_by || null,
        created_at: dNow,
        updated_at: dNow,
      });

      return nId;
    });

    return res.status(201).json({
      status: true,
      message: "Surat masuk berhasil dibuat",
      data: {
        incoming_letter_id: nIncomingLetterId,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Surat masuk gagal dibuat",
      error: error.message,
    });
  }
};

router.post("/", incomingLetterCreate);

export default router;
